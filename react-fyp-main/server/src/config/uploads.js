import fs from 'fs-extra';
import multer from 'multer';
import path from 'path';
import { env } from './env.js';

const imageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const buildStorage = (destination) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, destination);
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname || '');
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      callback(null, safeName);
    },
  });

const createImageUpload = (destination) =>
  multer({
    storage: buildStorage(destination),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, callback) => {
      if (!imageMimeTypes.has(file.mimetype)) {
        callback(new Error('Unsupported file type'));
        return;
      }

      callback(null, true);
    },
  });

export const staticDirectories = [
  { route: '/uploads', dir: env.uploads.userImagesDir },
  { route: '/uploadDonateIMG', dir: env.uploads.donateImagesDir },
  { route: '/uploadAnnouncement', dir: env.uploads.announcementImagesDir },
  { route: '/uploadAdminIMG', dir: env.uploads.adminImagesDir },
  { route: '/violationIMG', dir: env.uploads.violationImagesDir },
];

export const ensureUploadDirectories = async () => {
  await Promise.all(staticDirectories.map(({ dir }) => fs.ensureDir(dir)));
};

export const uploads = {
  upload: createImageUpload(env.uploads.userImagesDir),
  uploadDonateIMG: createImageUpload(env.uploads.donateImagesDir),
  uploadAnnouncement: createImageUpload(env.uploads.announcementImagesDir),
  uploadAdminIMG: createImageUpload(env.uploads.adminImagesDir),
  violationIMG: createImageUpload(env.uploads.violationImagesDir),
};
