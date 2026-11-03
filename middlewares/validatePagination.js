module.exports = function validatePagination(req, res, next) {
  for (const key of ['search', 'categoryId', 'brandId', 'sort', 'status', 'recommended']) {
    if (req.query[key] !== undefined && (typeof req.query[key] !== 'string' || req.query[key].length > 200)) {
      return res.status(400).json({ success: false, message: `Invalid ${key}.` });
    }
  }
  for (const key of ['brandId', 'categoryId']) {
    if (req.query[key] && !/^[a-fA-F0-9]{24}$/.test(req.query[key])) {
      return res.status(400).json({ success: false, message: `Invalid ${key}.` });
    }
  }
  for (const key of ['page', 'limit']) {
    if (req.query[key] === undefined) continue;
    const value = Number(req.query[key]);
    if (!Number.isSafeInteger(value) || value < 1 || (key === 'limit' && value > 100)) {
      return res.status(400).json({ success: false, message: `${key} must be a positive integer${key === 'limit' ? ' at most 100' : ''}.` });
    }
    req.query[key] = value;
  }
  return next();
};
