// Local picker URIs cannot be opened by another user's device.
function resolveVoucherImage(voucher, thumbnailFirst = false) {
  const brand = voucher.brandId || {};
  const candidates = thumbnailFirst
    ? [voucher.thumbnail_url, voucher.coverImage, brand.cover_image_url, brand.logo_url]
    : [voucher.coverImage, voucher.thumbnail_url, brand.cover_image_url, brand.logo_url];
  return candidates.find((value) => typeof value === 'string' && /^https?:\/\/\S+$/i.test(value.trim()))?.trim() || '';
}

module.exports = { resolveVoucherImage };
