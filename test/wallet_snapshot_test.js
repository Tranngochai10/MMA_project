const { test } = require('node:test');
const assert = require('node:assert/strict');
const repository = require('../repositories/userVoucherRepository');
const service = require('../services/userVoucherService');

test('wallet keeps purchased benefits even after the campaign is edited', async () => {
  const originalList = repository.findByUserId;
  const originalDetail = repository.findByIdOrCode;
  const wallet = {
    _id: 'wallet', userId: 'user', voucherCode: 'AB123456', is_used: false,
    expires_at: new Date('2027-12-01'), purchased_at: new Date('2026-11-01'),
    voucherId: { _id: 'voucher', title: 'Edited campaign', sellingPrice: 999, termsAndConditions: ['New terms'], brandId: { name: 'Edited brand' } },
    snapshot: { title: 'Purchased title', brandName: 'Purchased brand', sellingPrice: 10, originalValue: 20, termsAndConditions: ['Purchased terms'] }
  };
  repository.findByUserId = async () => [wallet];
  repository.findByIdOrCode = async () => wallet;
  try {
    for (const result of [(await service.getMyWalletVouchers('user'))[0], await service.getWalletVoucherById('wallet', 'user')]) {
      assert.equal(result.title, 'Purchased title');
      assert.equal(result.brandName, 'Purchased brand');
      assert.equal(result.sellingPrice, 10);
      assert.deepEqual(result.termsAndConditions, ['Purchased terms']);
    }
    await assert.rejects(service.getWalletVoucherById('wallet', 'someone-else'), { statusCode: 403 });
  } finally {
    repository.findByUserId = originalList;
    repository.findByIdOrCode = originalDetail;
  }
});
