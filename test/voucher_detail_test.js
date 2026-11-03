const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolveVoucherImage } = require('../utils/voucherMedia');

test('images fall back from inaccessible picker URI to thumbnail then brand', () => {
  const voucher = {
    coverImage: 'file:///phone/photo.jpg',
    thumbnail_url: ' https://example.com/thumbnail.jpg ',
    brandId: { cover_image_url: 'https://example.com/brand.jpg' }
  };
  assert.equal(resolveVoucherImage(voucher), 'https://example.com/thumbnail.jpg');
  voucher.thumbnail_url = '   ';
  assert.equal(resolveVoucherImage(voucher), 'https://example.com/brand.jpg');
  assert.equal(resolveVoucherImage({ brandId: null }), '');
});

test('detail API includes usable image, brand address and voucher status', async () => {
  const repository = require('../repositories/voucherRepository');
  const service = require('../services/voucherService');
  const original = repository.findById;
  repository.findById = async () => ({
    _id: 'voucher-id', status: 'ACTIVE', title: 'Voucher',
    brandId: { _id: 'brand-id', name: 'Brand', address: '123 Main Street', cover_image_url: 'https://example.com/brand.jpg' },
    thumbnail_url: 'https://example.com/voucher.jpg',
    categoryId: { _id: 'category-id', name: 'Coffee' }
  });
  try {
    const detail = await service.getVoucherById('voucher-id');
    assert.equal(detail.coverImage, 'https://example.com/voucher.jpg');
    assert.equal(detail.brand.address, '123 Main Street');
    assert.equal(detail.status, 'ACTIVE');
    assert.equal(detail.categoryId, 'category-id');
    assert.ok(detail.termsAndConditions.length > 0);
  } finally {
    repository.findById = original;
  }
});
