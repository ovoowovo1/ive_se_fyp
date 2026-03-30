import axios from 'axios';
import bcrypt from 'bcrypt';
import fs from 'fs-extra';
import jwt from 'jsonwebtoken';
import os from 'os';
import path from 'path';
import sharp from 'sharp';
import sdk from 'microsoft-cognitiveservices-speech-sdk';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import { db, queryAsync, withTransaction } from '../config/database.js';
import { env } from '../config/env.js';
import { uploads } from '../config/uploads.js';
import { authenticateJWT } from '../middleware/authenticateJwt.js';
import ffmpeg from '../utils/ffmpeg.js';
import { comparePassword, hashPassword, isBcryptHash } from '../utils/password.js';

export const createContext = () => ({
  axios,
  bcrypt,
  comparePassword,
  db,
  env,
  ffmpeg,
  fs,
  hashPassword,
  isBcryptHash,
  jwt,
  os,
  path,
  queryAsync,
  sdk,
  sharp,
  uploads,
  util,
  uuidv4,
  withTransaction,
  authenticateJWT,
});
