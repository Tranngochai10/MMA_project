require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const { connectDatabase } = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Route modules
const authRouter = require('./routes/auth');
const categoriesRouter = require('./routes/categories');
const brandsRouter = require('./routes/brands');
const vouchersRouter = require('./routes/vouchers');
const favoritesRouter = require('./routes/favorites');
const userVouchersRouter = require('./routes/userVouchers');

const app = express();

// Initialize MongoDB Connection
connectDatabase().catch((error) => {
  console.error('Failed to connect to database on startup:', error.message);
});

// View engine setup (optional legacy support)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middlewares
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'voucher-platform backend',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/user-vouchers', userVouchersRouter);

// Centralized API Error Handler
app.use(errorHandler);

// Catch 404 and forward to error handler for non-API requests
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  }
  next(createError(404));
});

// Legacy Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
