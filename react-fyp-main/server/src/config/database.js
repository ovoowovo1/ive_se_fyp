import mysql from 'mysql2';
import util from 'util';
import { env } from './env.js';

export const db = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
});

export const queryAsync = util.promisify(db.query).bind(db);

export const getConnectionAsync = () =>
  new Promise((resolve, reject) => {
    db.getConnection((error, connection) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(connection);
    });
  });

export const withTransaction = async (work) => {
  const connection = await getConnectionAsync();

  try {
    await util.promisify(connection.beginTransaction).bind(connection)();
    const result = await work(connection);
    await util.promisify(connection.commit).bind(connection)();
    return result;
  } catch (error) {
    await util.promisify(connection.rollback).bind(connection)();
    throw error;
  } finally {
    connection.release();
  }
};
