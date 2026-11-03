const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const http = require('http');
const users = require('../repositories/userRepository');
const payments = require('../services/paymentService');
const { signAuthToken } = require('../utils/jwt');
test('payment routes require authentication and only DB-authorized managers can confirm or cancel', async t => {
  const old = process.env.JWT_SECRET; process.env.JWT_SECRET = 'route-test-secret';
  t.after(() => old === undefined ? delete process.env.JWT_SECRET : process.env.JWT_SECRET = old);
  const id = '507f1f77bcf86cd799439011';
  let roles = ['USER']; let confirmed = 0; let cancelled = 0;
  t.mock.method(users, 'findById', async () => ({ _id: id, status: 'active', tokenVersion: 0 }));
  t.mock.method(users, 'getRoleNamesByUserId', async () => roles);
  t.mock.method(payments, 'confirmTransfer', async (orderId, managerId) => {
    assert.equal(orderId, id); assert.equal(managerId, id); confirmed++; return { status: 'PAID' };
  });
  t.mock.method(payments, 'cancelTransfer', async () => { cancelled++; return { status: 'CANCELLED' }; });
  t.mock.method(payments, 'getTransferOrder', async (orderId, ownerId) => {
    assert.equal(orderId, id); assert.equal(ownerId, id); return { status: 'PENDING' };
  });
  const app = express(); app.use(express.json()); app.use('/api/payments', require('../routes/payments'));
  app.use(require('../middlewares/errorHandler'));
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api/payments/mb/${id}`;
  const token = signAuthToken({ user_id: id, token_version: 0, role: 'MANAGER' });
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  assert.equal((await fetch(base)).status, 401);
  assert.equal((await fetch(base + '/confirm', { method: 'POST', headers, body: '{}' })).status, 403);
  assert.equal((await fetch(base + '/cancel', { method: 'POST', headers, body: '{}' })).status, 403);
  assert.equal(confirmed, 0); assert.equal(cancelled, 0);
  assert.equal((await fetch(base, { headers })).status, 200);
  roles = ['MANAGER'];
  assert.equal((await fetch(base + '/confirm', { method: 'POST', headers, body: '{}' })).status, 200);
  assert.equal((await fetch(base + '/cancel', { method: 'POST', headers, body: '{}' })).status, 200);
  assert.equal(confirmed, 1); assert.equal(cancelled, 1);
});
