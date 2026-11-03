const { test } = require('node:test');
const assert = require('node:assert/strict');
const { brandPresence, validateBrandPresence } = require('../utils/brandPresence');
const repository = require('../repositories/voucherRepository');
const { getVoucherById } = require('../services/voucherService');

test('legacy and small brands use name search without requiring an address', () => {
  assert.deepEqual(brandPresence({ name: 'Small brand' }), { salesChannel: 'STORE', websiteUrl: '' });
  assert.deepEqual(validateBrandPresence({ name: 'Small brand' }), { salesChannel: 'STORE', websiteUrl: '' });
});

test('online brands require a valid shop link and preserve it during partial updates', () => {
  assert.throws(() => validateBrandPresence({ salesChannel: 'ONLINE' }), { statusCode: 400 });
  for (const websiteUrl of ['javascript:alert(1)', 'file:///shop', 'https://user:password@example.com', 'not-a-link']) {
    assert.throws(() => validateBrandPresence({ salesChannel: 'ONLINE', websiteUrl }), { statusCode: 400 });
  }
  const online = validateBrandPresence({ salesChannel: 'ONLINE', websiteUrl: ' https://example.com/shop ' });
  assert.deepEqual(online, { salesChannel: 'ONLINE', websiteUrl: 'https://example.com/shop' });
  assert.deepEqual(validateBrandPresence({ description: 'Updated' }, online), online);
});

test('voucher detail inherits the brand channel and online shop URL', async () => {
  const original = repository.findById;
  repository.findById = async () => ({
    _id: 'voucher', title: 'Online voucher', status: 'ACTIVE', termsAndConditions: [],
    brandId: { _id: 'brand', name: 'Small online shop', salesChannel: 'ONLINE', websiteUrl: 'https://example.com/shop' }
  });
  try {
    const result = await getVoucherById('voucher');
    assert.equal(result.brand.salesChannel, 'ONLINE');
    assert.equal(result.brand.websiteUrl, 'https://example.com/shop');
    assert.equal(result.brand.name, 'Small online shop');
  } finally { repository.findById = original; }
});
