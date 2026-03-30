import bcrypt from 'bcrypt';

const BCRYPT_PATTERN = /^\$2[aby]\$\d{2}\$/;
const SALT_ROUNDS = 10;

export const isBcryptHash = (value) => typeof value === 'string' && BCRYPT_PATTERN.test(value);

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (password, storedPassword) => {
  if (!storedPassword) {
    return false;
  }

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }

  return password === storedPassword;
};
