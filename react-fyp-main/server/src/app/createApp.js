import cors from 'cors';
import express from 'express';
import { createContext } from './createContext.js';
import { env } from '../config/env.js';
import { ensureUploadDirectories, staticDirectories } from '../config/uploads.js';
import createAuthRouter from '../domains/auth/routes.js';
import createAdminUsersRouter from '../domains/admin-users/routes.js';
import createDonationsRouter from '../domains/donations-classification/routes.js';
import createAnnouncementsRouter from '../domains/announcements/routes.js';
import createViolationsRouter from '../domains/violations-ai/routes.js';
import createAnalysisRouter from '../domains/analysis-maps/routes.js';
import createRequestsRouter from '../domains/requests-reviews/routes.js';
import createRealtimeRouter from '../domains/realtime/routes.js';

export const createApp = async () => {
  await ensureUploadDirectories();

  const app = express();
  const context = createContext();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: env.cors.origins,
      credentials: true,
    }),
  );

  staticDirectories.forEach(({ route, dir }) => {
    app.use(route, express.static(dir));
  });

  [
    createAuthRouter,
    createAdminUsersRouter,
    createDonationsRouter,
    createAnnouncementsRouter,
    createViolationsRouter,
    createAnalysisRouter,
    createRequestsRouter,
    createRealtimeRouter,
  ].forEach((createRouter) => {
    app.use(createRouter(context));
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  });

  return app;
};
