const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const UserVoucher = require('../models/UserVoucher');
const { createQr, decodeRedemption } = require('../services/voucherQrService');
const { useVoucher } = require('../services/userVoucherService');
const id = '507f1f77bcf86cd799439011';
test('redemption QR rejects expired, tampered, wrong-purpose and auth tokens', t => {
  const old = process.env.JWT_SECRET; process.env.JWT_SECRET = 'qr-test-secret';
  t.after(() => old === undefined ? delete process.env.JWT_SECRET : process.env.JWT_SECRET = old);
  const sign = (payload, options = {}) => 'DLQR:' + jwt.sign(payload, process.env.JWT_SECRET, { audience: 'voucher-redemption', expiresIn: 300, ...options });
  const valid = sign({ purpose: 'redeem', voucherCode: 'AB123456' });
  assert.equal(decodeRedemption(valid), 'AB123456');
  assert.equal(decodeRedemption(' ab123456 '), 'AB123456');
  for (const value of [valid.slice(0, -10) + 'tampered', sign({ purpose: 'redeem', voucherCode: 'AB123456' }, { expiresIn: -1 }),
    sign({ purpose: 'auth', voucherCode: 'AB123456' }), sign({ user_id: id }, { audience: 'auth' }), null]) {
    assert.throws(() => decodeRedemption(value), { statusCode: 400 });
  }
});
test('QR issuance enforces ownership and live unused wallet state', async t => {
  const old = process.env.JWT_SECRET; process.env.JWT_SECRET = 'qr-test-secret';
  t.after(() => old === undefined ? delete process.env.JWT_SECRET : process.env.JWT_SECRET = old);
  let wallet = null;
  t.mock.method(UserVoucher, 'findOne', async filter => { assert.equal(filter.userId, id); return wallet; });
  await assert.rejects(createQr(id, id), { statusCode: 404 });
  wallet = { voucherCode: 'AB123456', is_used: true, expires_at: new Date(Date.now() + 86400000) };
  await assert.rejects(createQr(id, id), { statusCode: 409 });
  wallet.is_used = false; wallet.expires_at = new Date(0);
  await assert.rejects(createQr(id, id), { statusCode: 409 });
  wallet.expires_at = new Date(Date.now() + 86400000);
  const qr = await createQr(id, id);
  assert.match(qr.qrImage, /^data:image\/png;base64,/);
  assert.ok(new Date(qr.expiresAt).getTime() <= Date.now() + 300000);
  await assert.rejects(useVoucher(id, id), { statusCode: 403 });
});
