import { verifyGatewayRequest } from '@thejuggernaut01/jobberapp-shared';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth.routes';
import { healthRoutes } from '@auth/routes/health.routes';
import { currentUserRoutes } from '@auth/routes/current-user.routes';
import { searchRoutes } from '@auth/routes/search.routes';

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, searchRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
};
