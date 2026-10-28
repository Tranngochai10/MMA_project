const express = require('express');
const brandController = require('../controllers/brandController');
const authenticate = require('../middlewares/authenticate');
const authorizeRoles = require('../middlewares/authorizeRoles');
const optionalAuthenticate = require('../middlewares/optionalAuthenticate');
const asyncHandler = require('../utils/asyncHandler');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.get('/', optionalAuthenticate, asyncHandler(brandController.getBrands));
router.get('/:id', optionalAuthenticate, asyncHandler(brandController.getBrandById));
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.MANAGER),
  asyncHandler(brandController.createBrand)
);

module.exports = router;
