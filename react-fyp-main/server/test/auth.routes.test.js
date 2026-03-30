import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import request from 'supertest';
import createAuthRouter from '../src/domains/auth/routes.js';

const buildApp = (contextOverrides = {}) => {
  const app = express();
  app.use(express.json());
  app.use(
    createAuthRouter({
      comparePassword: async () => true,
      env: {
        jwt: {
          secret: 'test-secret',
          expiresIn: '1h',
        },
      },
      hashPassword: async (value) => `hashed-${value}`,
      isBcryptHash: () => true,
      jwt: {
        sign: () => 'signed-token',
      },
      queryAsync: async () => [],
      ...contextOverrides,
    }),
  );

  return app;
};

test('POST /login returns admin session payload', async () => {
  const app = buildApp({
    queryAsync: async () => [
      {
        Admin_ID: 'admin01',
        Admin_Name: 'Admin',
        Admin_Photo: 'uploadAdminIMG/admin.png',
        Admin_Password: 'stored-password',
        Admin_Suspended: 0,
        Admin_Permission_User: 1,
        Admin_Permission_Admin: 1,
        Admin_Permission_Analysis: 1,
        Admin_Permission_Violation: 1,
        Admin_Permission_Donate: 1,
        Admin_Permission_Announcement: 1,
      },
    ],
  });

  const response = await request(app).post('/login').send({
    username: 'admin01',
    password: 'password',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 200);
  assert.equal(response.body.Login_id, 'admin01');
  assert.equal(response.body.token, 'signed-token');
});

test('POST /Userlogin upgrades legacy plain-text passwords after successful login', async () => {
  const sqlCalls = [];
  const app = buildApp({
    isBcryptHash: () => false,
    queryAsync: async (sql, params) => {
      sqlCalls.push({ sql, params });

      if (sql.startsWith('select ID,password,is_suspended from user')) {
        return [
          {
            ID: 'user01',
            password: 'plain-password',
            is_suspended: 0,
          },
        ];
      }

      if (sql.startsWith('UPDATE user SET password = ?')) {
        return { affectedRows: 1 };
      }

      return [];
    },
  });

  const response = await request(app).post('/Userlogin').send({
    username: 'user01',
    password: 'plain-password',
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 200);
  assert.equal(response.body.token, 'signed-token');
  assert.ok(
    sqlCalls.some(
      ({ sql, params }) =>
        sql.startsWith('UPDATE user SET password = ?') && params[0] === 'hashed-plain-password',
    ),
  );
});
