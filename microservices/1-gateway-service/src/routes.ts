import { Application } from 'express';
import { healthRoutes } from '@gateway/routes/health.routes';
import { authRoutes } from '@gateway/routes/auth.routes';
import { currentUserRoutes } from '@gateway/routes/current-user.routes';
import { authMiddleware } from '@gateway/services/auth-middleware';
import { searchRoutes } from '@gateway/routes/search.routes';
import { buyerRoutes } from '@gateway/routes/buyer.routes';
import { sellerRoutes } from '@gateway/routes/seed.routes';

const BASE_PATH = '/api/gateway/v1';

export const appRoutes = (app: Application) => {
  app.use('', healthRoutes.routes());
  app.use(BASE_PATH, authRoutes.routes());
  app.use(BASE_PATH, searchRoutes.routes());
  app.use(BASE_PATH, searchRoutes.routes());

  app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, buyerRoutes.routes());
  app.use(BASE_PATH, authMiddleware.verifyUser, sellerRoutes.routes());
};
