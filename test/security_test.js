const { test } = require('node:test');
const assert = require('node:assert/strict');
const repository = require('../repositories/userRepository');
const auth = require('../services/authService');
const authenticate = require('../middlewares/authenticate');
const { signAuthToken } = require('../utils/jwt');

test('recovery never exposes an OTP before real email delivery is configured', async () => {
  await assert.rejects(auth.forgotPassword({ email: 'test@example.com' }), { statusCode: 503 });
  await assert.rejects(auth.resetPassword({ email: 'test@example.com', otp: '123456', new_password: 'NewPassword123!' }), { statusCode: 503 });
});

test('blocked accounts and revoked tokens cannot access protected routes', async () => {
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-only-secret';
  const original = repository.findById;
  let user = { _id: 'user-id', status: 'active', tokenVersion: 1 };
  repository.findById = async () => user;
  const check = version => new Promise(resolve => authenticate({ headers: { authorization: `Bearer ${signAuthToken({ user_id: 'user-id', token_version: version })}` } }, {}, resolve));
  try {
    assert.equal((await check(0)).statusCode, 401);
    assert.equal(await check(1), undefined);
    user.status = 'blocked';
    assert.equal((await check(1)).statusCode, 401);
  } finally {
    repository.findById = original;
    oldSecret === undefined ? delete process.env.JWT_SECRET : process.env.JWT_SECRET = oldSecret;
  }
});
