import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ Message: 'Unauthorized' });
  }

  jwt.verify(token, env.jwt.secret, (error, user) => {
    if (error) {
      return res.status(403).json({ Message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};
