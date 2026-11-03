const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const brandUpload = require('../middlewares/brandUpload');

test('brand multipart upload stores a public image and rejects invalid or oversized files', async () => {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../public')));
  app.post('/brand', brandUpload, (req, res) => res.json(req.body));
  app.use((err, req, res, next) => res.status(err.statusCode || 500).json({ message: err.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const storedFiles = [];
  try {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j5V8AAAAASUVORK5CYII=', 'base64');
    const form = new FormData();
    form.append('name', 'Test Brand');
    form.append('address', '123 Main Street');
    form.append('logo', new Blob([png], { type: 'image/png' }), 'logo.png');
    form.append('coverImage', new Blob([png], { type: 'image/png' }), 'cover.png');
    const response = await fetch(`${origin}/brand`, { method: 'POST', body: form });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.name, 'Test Brand');
    assert.equal(body.address, '123 Main Street');
    for (const url of [body.logo_url, body.cover_image_url]) {
      assert.ok(url.startsWith(`${origin}/uploads/brands/`));
      storedFiles.push(path.join(__dirname, '../public', new URL(url).pathname));
      const image = await fetch(url);
      assert.equal(image.status, 200);
      assert.equal(image.headers.get('content-type'), 'image/png');
      assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    }
    const bad = new FormData();
    bad.append('logo', new Blob(['fake image'], { type: 'image/png' }), 'fake.png');
    assert.equal((await fetch(`${origin}/brand`, { method: 'POST', body: bad })).status, 400);
    const large = new FormData();
    large.append('logo', new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
    assert.equal((await fetch(`${origin}/brand`, { method: 'POST', body: large })).status, 400);
    const json = await fetch(`${origin}/brand`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Existing client' }) });
    assert.equal(json.status, 200);
  } finally {
    await Promise.all(storedFiles.map(file => fs.unlink(file)));
    await new Promise(resolve => server.close(resolve));
  }
});
