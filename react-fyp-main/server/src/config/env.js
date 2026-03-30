import dotenv from 'dotenv';

dotenv.config();

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseOrigins = (value) => {
  if (!value) {
    return ['http://localhost:5173', 'http://localhost:3000'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  app: {
    port: parseInteger(process.env.PORT, 8081),
    baseUrl: process.env.APP_BASE_URL || `http://localhost:${parseInteger(process.env.PORT, 8081)}`,
  },
  cors: {
    origins: parseOrigins(process.env.CORS_ORIGIN),
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInteger(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'react_fyp_demo',
    connectionLimit: parseInteger(process.env.DB_CONNECTION_LIMIT, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-env',
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  },
  ai: {
    serviceBaseUrl: process.env.AI_SERVICE_BASE_URL || 'http://127.0.0.1:5001',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  azureSpeech: {
    key: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || 'japaneast',
  },
  ffmpeg: {
    path: process.env.FFMPEG_PATH || 'ffmpeg',
  },
  uploads: {
    userImagesDir: process.env.UPLOAD_USER_DIR || 'uploads',
    donateImagesDir: process.env.UPLOAD_DONATE_DIR || 'uploadDonateIMG',
    announcementImagesDir: process.env.UPLOAD_ANNOUNCEMENT_DIR || 'uploadAnnouncement',
    adminImagesDir: process.env.UPLOAD_ADMIN_DIR || 'uploadAdminIMG',
    violationImagesDir: process.env.UPLOAD_VIOLATION_DIR || 'violationIMG',
  },
};
