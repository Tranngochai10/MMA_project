const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const authenticate = require('../middlewares/authenticate');
const rateLimit = require('../middlewares/rateLimit');
const asyncHandler = require('../utils/asyncHandler');
const { imageExtension } = require('../middlewares/brandUpload');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();
const parse = multer({ storage: multer.memoryStorage(), limits: { files: 1, fileSize: 5 * 1024 * 1024, fields: 0 } }).single('image');
router.post('/', authenticate, rateLimit({ max: 30, windowMs: 15 * 60 * 1000 }), (req, res, next) => {
  parse(req, res, error => error ? next(new ApiError(400, 'Upload one JPG, PNG or WebP image, up to 5 MB.')) : next());
}, asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Image is required.');
  const extension = imageExtension(req.file.buffer);
  if (!extension) throw new ApiError(400, 'Only JPG, PNG and WebP images are supported.');
  const directory = path.join(__dirname, '../public/uploads/media');
  await fs.mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await fs.writeFile(path.join(directory, filename), req.file.buffer, { flag: 'wx' });
  const origin = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
  return sendSuccess(res, 201, 'Image uploaded.', { url: `${origin}/uploads/media/${filename}` });
}));

module.exports = router;
