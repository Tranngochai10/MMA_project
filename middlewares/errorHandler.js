function errorHandler(err, req, res, next) {
  if (!req.originalUrl.startsWith('/api')) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || (err.code === 11000 ? 409 : ['ValidationError', 'CastError'].includes(err.name) ? 400 : 500);
  const response = {
    success: false,
    message: err.message || 'Internal server error'
  };

  if (err.details) {
    response.details = err.details;
  }

  if (req.app.get('env') === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

module.exports = errorHandler;
