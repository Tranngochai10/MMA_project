// Process-local protection for the single-server demo; no account secrets are stored.
module.exports = function rateLimit({ max, windowMs }) {
  const buckets = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of buckets) if (value.expires <= now) buckets.delete(key);
    const key = req.ip;
    const bucket = buckets.get(key) || { count: 0, expires: now + windowMs };
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > max) {
      res.set('Retry-After', String(Math.ceil((bucket.expires - now) / 1000)));
      return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
    }
    return next();
  };
};
