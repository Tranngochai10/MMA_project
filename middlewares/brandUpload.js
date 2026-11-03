const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { randomUUID } = require('crypto');
const ApiError = require('../utils/ApiError');

const uploadDirectory = path.join(__dirname, '../public/uploads/brands');
const parse = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2, fields: 12, fieldSize: 64 * 1024 }
}).fields([{ name: 'logo', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]);

function imageExtension(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return 'jpg';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

function brandUpload(req, res, next) {
  parse(req, res, async (error) => {
    if (error) return next(new ApiError(400, error.code === 'LIMIT_FILE_SIZE'
      ? 'Mỗi ảnh tối đa 5 MB.' : 'File tải lên không hợp lệ. Chỉ nhận một logo và một ảnh bìa.'));
    const written = [];
    const cleanup = () => Promise.all(written.map(file => fs.unlink(file).catch(() => {})));
    let completed = false;
    res.once('finish', () => { completed = true; if (res.statusCode >= 400) void cleanup(); });
    res.once('close', () => { if (!completed) void cleanup(); });
    try {
      const files = Object.entries(req.files || {}).map(([field, values]) => {
        const file = values[0];
        const extension = imageExtension(file.buffer);
        if (!extension) throw new ApiError(400, 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.');
        return { field, file, filename: `${randomUUID()}.${extension}` };
      });
      if (files.length) await fs.mkdir(uploadDirectory, { recursive: true });
      const origin = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
      for (const { field, file, filename } of files) {
        const destination = path.join(uploadDirectory, filename);
        await fs.writeFile(destination, file.buffer, { flag: 'wx' });
        written.push(destination);
        req.body[field === 'logo' ? 'logo_url' : 'cover_image_url'] = `${origin}/uploads/brands/${filename}`;
      }
      next();
    } catch (err) {
      await cleanup();
      next(err);
    }
  });
}

module.exports = brandUpload;
module.exports.imageExtension = imageExtension;
