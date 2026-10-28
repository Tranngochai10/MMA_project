const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Tất cả các route Favorites đều yêu cầu Bearer Token
router.use(authenticate);

// Brand favorites
router.get('/brands', asyncHandler(favoriteController.getFavoriteBrands));
router.post('/brands/:id/toggle', asyncHandler(favoriteController.toggleFavoriteBrand));

// Voucher favorites
router.get('/vouchers', asyncHandler(favoriteController.getFavoriteVouchers));
router.post('/vouchers/:id/toggle', asyncHandler(favoriteController.toggleFavoriteVoucher));

module.exports = router;
