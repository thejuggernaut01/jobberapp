import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health.routes';

import { authRoutes } from './routes/auth.routes';
import { currentUserRoutes } from './routes/current-user.routes';
import { authMiddleware } from './services/auth-middleware';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, authRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
};
