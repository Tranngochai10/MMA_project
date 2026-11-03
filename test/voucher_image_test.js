const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../services/managerService');
const brands = require('../repositories/brandRepository');
const vouchers = require('../repositories/voucherRepository');
const { voucherImageUrl } = require('../validators/voucherValidator');

test('voucher image must be an uploaded URL rather than a device-local URI', () => {
  for (const uri of ['file:///phone/image.jpg', 'blob:http://localhost/image', 'data:image/png;base64,abc']) assert.throws(() => voucherImageUrl(uri), { statusCode: 400 });
  assert.equal(voucherImageUrl(' https://example.com/uploads/image.png '), 'https://example.com/uploads/image.png');
});

test('creating and editing a voucher persist its own image and matching thumbnail', async () => {
  const old = { brand: brands.findById, create: vouchers.create, find: vouchers.findById, update: vouchers.updateById };
  let stored;
  brands.findById = async () => ({ _id: 'brand', categoryId: 'category' });
  vouchers.create = async data => { stored = { ...data, _id: 'voucher' }; return stored; };
  vouchers.findById = async () => ({ ...stored, toObject: () => ({ ...stored }) });
  vouchers.updateById = async (id, update) => { stored = { ...stored, ...update }; return stored; };
  try {
    const image = 'https://example.com/uploads/media/first.png';
    await service.createManagerVoucher('manager', { brandId: 'brand', title: 'Voucher', sellingPrice: 10, originalValue: 20, totalQuantity: 10, discountType: 'PERCENTAGE', discountValue: 50, startDate: '2026-11-01', expirationDate: '2027-01-01', coverImage: image });
    assert.equal(stored.coverImage, image);
    assert.equal(stored.thumbnail_url, image);
    const changed = 'https://example.com/uploads/media/changed.png';
    const result = await service.updateManagerVoucher('voucher', { coverImage: changed });
    assert.equal(stored.coverImage, changed);
    assert.equal(stored.thumbnail_url, changed);
    assert.equal(result.coverImage, changed);
  } finally {
    brands.findById = old.brand; vouchers.create = old.create; vouchers.findById = old.find; vouchers.updateById = old.update;
  }
});
