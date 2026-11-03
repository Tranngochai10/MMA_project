const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateVoucher } = require('../validators/voucherValidator');
const UserVoucher = require('../models/UserVoucher');
const Voucher = require('../models/Voucher');
const repository = require('../repositories/userVoucherRepository');
const vouchers = require('../repositories/voucherRepository');
const { buyVoucher } = require('../services/voucherService');

test('campaign rules reject invalid prices, percentages, quantities and dates', () => {
  const data = { title: 'Demo', sellingPrice: 10, originalValue: 20, discountValue: 50, discountType: 'PERCENTAGE', totalQuantity: 10, startDate: '2026-11-01', expirationDate: '2026-12-01' };
  assert.doesNotThrow(() => validateVoucher(data));
  for (const change of [{ sellingPrice: 10.5 }, { sellingPrice: Infinity }, { sellingPrice: 21 }, { totalQuantity: 1.5 }, { totalQuantity: 0 }, { discountValue: 101 }, { expirationDate: 'invalid' }, { expirationDate: data.startDate }]) {
    assert.throws(() => validateVoucher({ ...data, ...change }), { statusCode: 400 });
  }
});

test('concurrent redemption checks unused and unexpired state in its atomic filter', async () => {
  const original = UserVoucher.findOneAndUpdate;
  let used = false;
  let successfulWrites = 0;
  UserVoucher.findOneAndUpdate = (filter, update) => ({ populate: async () => {
    assert.equal(filter.is_used, false);
    assert.ok(filter.expires_at.$gt instanceof Date);
    assert.equal(update.redeemedBy, 'manager-id');
    if (used) return null;
    used = true;
    successfulWrites++;
    return { _id: filter._id, ...update };
  } });
  try {
    const results = await Promise.all(Array.from({ length: 20 }, () => repository.markAsUsed('wallet-id', new Date(), 'manager-id', 'MANAGER')));
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(successfulWrites, 1);
  } finally { UserVoucher.findOneAndUpdate = original; }
});

test('stock reservation includes campaign start and positive stock in the write filter', async () => {
  const original = Voucher.findOneAndUpdate;
  Voucher.findOneAndUpdate = async (filter, update) => {
    assert.ok(filter.startDate.$lte instanceof Date);
    assert.ok(filter.expirationDate.$gt instanceof Date);
    assert.equal(filter.availableQuantity.$gt, 0);
    assert.equal(update.$inc.availableQuantity, -1);
    return null;
  };
  try { await vouchers.decrementAvailableQuantity('id'); }
  finally { Voucher.findOneAndUpdate = original; }
});

test('unconfigured payments cannot use the legacy checkout bypass', async () => {
  const old = process.env.MB_PAYMENT_ENABLED;
  process.env.MB_PAYMENT_ENABLED = 'false';
  try { await assert.rejects(buyVoucher('invalid', 'user'), { statusCode: 503 }); }
  finally { old === undefined ? delete process.env.MB_PAYMENT_ENABLED : process.env.MB_PAYMENT_ENABLED = old; }
});
