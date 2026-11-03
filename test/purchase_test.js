const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Brand = require('../models/Brand');
const Voucher = require('../models/Voucher');
const UserVoucher = require('../models/UserVoucher');
const stock = require('../repositories/voucherRepository');
const payment = require('../services/paymentService');
const { vietQr } = require('../utils/vietQr');
const id = '507f1f77bcf86cd799439011';
function setup(t) {
  for (const [key, value] of Object.entries({ MB_PAYMENT_ENABLED: 'true', MB_ACCOUNT_NUMBER: '0011001932418', MB_ACCOUNT_NAME: 'TEST FIXTURE' })) {
    const old = process.env[key]; process.env[key] = value;
    t.after(() => old === undefined ? delete process.env[key] : process.env[key] = old);
  }
  t.mock.method(mongoose.connection, 'transaction', async callback => callback({ testSession: true }));
  const old = mongoose.connection.client;
  mongoose.connection.client = { topology: { description: { type: 'ReplicaSetWithPrimary' } } };
  t.after(() => { mongoose.connection.client = old; });
}
function order() {
  return { _id: id, voucherId: id, userId: id, orderCode: 'ORD-TEST', status: 'PENDING', paymentMethod: 'MB_BANK_TRANSFER',
    totalAmount: 120000, paymentReference: 'DLTEST', bankDetails: { bankBin: '970422', accountNumber: '0011001932418', accountName: 'TEST FIXTURE' },
    paymentExpiresAt: new Date(Date.now() + 60000), inventoryReserved: true,
    voucherSnapshot: { title: 'Purchased title', brandCode: 'AB', expirationDate: new Date(Date.now() + 86400000), sellingPrice: 120000 },
    save: async () => {} };
}
test('VietQR payload matches the published independent CRC fixture', () => {
  assert.equal(vietQr({ amount: 120000, bankBin: '970415', accountNumber: '0011001932418', reference: 'ung ho lu lut' }),
    '00020101021238570010A00000072701270006970415011300110019324180208QRIBFTTA530370454061200005802VN62170813ung ho lu lut6304C15C');
  for (const amount of [0, -1, 1.5, Infinity]) assert.throws(() => vietQr({ amount, bankBin: '970422', accountNumber: '12345678', reference: 'TEST' }));
});
test('creating a transfer reserves stock but never issues a wallet or marks PAID', async t => {
  setup(t);
  t.mock.method(Order, 'findOne', async () => null);
  t.mock.method(Order, 'countDocuments', () => ({ session: async () => 0 }));
  t.mock.method(stock, 'decrementAvailableQuantity', async (value, session) => {
    assert.equal(value, id); assert.ok(session);
    return { _id: id, brandId: id, title: 'Original benefit', sellingPrice: 120000, originalValue: 150000, expirationDate: new Date(Date.now() + 86400000) };
  });
  t.mock.method(Brand, 'findById', () => ({ session: async () => ({ _id: id, name: 'Fixture', code: 'AB' }) }));
  t.mock.method(UserVoucher, 'create', async () => { assert.fail('Pending orders must not issue vouchers'); });
  t.mock.method(Order, 'create', async ([data], options) => {
    assert.equal(data.status, 'PENDING'); assert.equal(data.totalAmount, 120000); assert.equal(data.isDemo, false);
    assert.equal(data.voucherSnapshot.title, 'Original benefit'); assert.ok(options.session);
    return [{ ...data, _id: id }];
  });
  const result = await payment.createTransferOrder(id, id, 'checkout-key-1');
  assert.equal(result.status, 'PENDING'); assert.equal(result.currency, 'VND');
  assert.match(result.qrImage, /^data:image\/png;base64,/); assert.equal(result.walletVoucherId, undefined);
});
test('idempotent retries replay the same order and cannot change voucher', async t => {
  setup(t); const existing = order();
  t.mock.method(Order, 'findOne', async () => existing);
  t.mock.method(stock, 'decrementAvailableQuantity', () => { assert.fail('Replay must not reserve again'); });
  assert.equal((await payment.createTransferOrder(id, id, 'checkout-key-1')).id, id);
  await assert.rejects(payment.createTransferOrder('507f1f77bcf86cd799439012', id, 'checkout-key-1'), { statusCode: 409 });
});
test('owner lookup, expired QR, and unavailable transactions fail without issuance', async t => {
  setup(t); const existing = order(); existing.paymentExpiresAt = new Date(0);
  assert.equal((await payment.formatPayment(existing)).qrImage, null);
  t.mock.method(Order, 'findOne', async filter => { assert.equal(filter.userId, id); return null; });
  await assert.rejects(payment.getTransferOrder(id, id), { statusCode: 404 });
  mongoose.connection.client.topology.description.type = 'Single';
  await assert.rejects(payment.createTransferOrder(id, id, 'checkout-key-1'), { statusCode: 503 });
});
test('confirmation requires exact received amount and issues once from the frozen snapshot', async t => {
  setup(t); const existing = order(); let issued = 0;
  t.mock.method(Order, 'findById', () => ({ session: async () => existing }));
  t.mock.method(UserVoucher, 'findOne', () => ({ session() { return this; }, then(resolve) { return Promise.resolve(null).then(resolve); } }));
  t.mock.method(UserVoucher, 'create', async ([data], options) => {
    issued++; assert.equal(data.orderId, id); assert.equal(data.snapshot.title, 'Purchased title'); assert.ok(options.session);
    return [{ _id: id }];
  });
  await assert.rejects(payment.confirmTransfer(id, id, { bankTransactionId: 'TXN12345', receivedAmount: 1000 }), { statusCode: 409 });
  assert.equal(issued, 0);
  assert.equal((await payment.confirmTransfer(id, id, { bankTransactionId: 'TXN12345', receivedAmount: 120000 })).status, 'PAID');
  await payment.confirmTransfer(id, id, { bankTransactionId: 'TXN12345', receivedAmount: 120000 });
  assert.equal(issued, 1);
  await assert.rejects(payment.confirmTransfer(id, id, { bankTransactionId: 'TXN99999', receivedAmount: 120000 }), { statusCode: 409 });
});
test('cancellation releases a pending reservation once and cannot cancel PAID', async t => {
  setup(t); const existing = order(); let released = 0;
  t.mock.method(Order, 'findOne', () => ({ session: async () => existing }));
  t.mock.method(Voucher, 'updateOne', async (filter, update, options) => { released += update.$inc.availableQuantity; assert.ok(options.session); });
  await payment.cancelTransfer(id); await payment.cancelTransfer(id); assert.equal(released, 1);
  existing.status = 'PAID'; await assert.rejects(payment.cancelTransfer(id), { statusCode: 409 });
});
