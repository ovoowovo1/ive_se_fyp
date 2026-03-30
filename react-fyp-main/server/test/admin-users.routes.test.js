import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import request from 'supertest';
import createAdminUsersRouter from '../src/domains/admin-users/routes.js';

const createNoopMiddleware = () => (_req, _res, next) => next();

const buildApp = (contextOverrides = {}) => {
  const app = express();
  app.use(express.json());
  app.use(
    createAdminUsersRouter({
      authenticateJWT: (_req, _res, next) => {
        _req.user = {
          Admin_Permission_User: 1,
          Admin_Permission_Admin: 1,
        };
        next();
      },
      db: {
        query: (_sql, callback) => callback(null, []),
      },
      env: {
        jwt: {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      },
      hashPassword: async (value) => `hashed-${value}`,
      jwt: {
        sign: () => 'signed-token',
      },
      queryAsync: async () => ({ insertId: 1 }),
      uploads: {
        upload: { single: createNoopMiddleware },
        uploadAdminIMG: { single: createNoopMiddleware },
      },
      util: {
        promisify: (fn) => fn,
      },
      withTransaction: async (handler) => handler({ query: async () => ({}) }),
      ...contextOverrides,
    }),
  );

  return app;
};

test('POST /createuser hashes the password before inserting', async () => {
  const calls = [];
  const app = buildApp({
    queryAsync: async (sql, params) => {
      calls.push({ sql, params });
      return { insertId: 1 };
    },
  });

  const response = await request(app).post('/createuser').send({
    UserID: 'user02',
    Name: 'User',
    password: 'plain-password',
    User_Email: 'user@example.com',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.token, 'signed-token');
  assert.equal(calls[0].params[3], 'hashed-plain-password');
});
