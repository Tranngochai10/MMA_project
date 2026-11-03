const ApiError = require('./ApiError');

function brandPresence(brand = {}) {
  return { salesChannel: brand.salesChannel || 'STORE', websiteUrl: brand.websiteUrl || '' };
}

function validateBrandPresence(data, previous = {}) {
  const salesChannel = data.salesChannel ?? previous.salesChannel ?? 'STORE';
  if (!['STORE', 'ONLINE'].includes(salesChannel)) throw new ApiError(400, 'Invalid brand sales channel.');
  const raw = data.websiteUrl ?? previous.websiteUrl ?? '';
  if (typeof raw !== 'string') throw new ApiError(400, 'Invalid store URL.');
  const websiteUrl = raw.trim();
  if (websiteUrl) {
    try {
      const url = new URL(websiteUrl);
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
    } catch { throw new ApiError(400, 'Store URL must be an HTTP or HTTPS link.'); }
  }
  if (salesChannel === 'ONLINE' && !websiteUrl) throw new ApiError(400, 'Online brands need a store or website link.');
  return { salesChannel, websiteUrl };
}

module.exports = { brandPresence, validateBrandPresence };
