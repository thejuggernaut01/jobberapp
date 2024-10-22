import { verifyGatewayRequest } from '@thejuggernaut01/jobberapp-shared';
import { Application } from 'express';

import { authRoutes } from './routes/auth.routes';
import { currentUserRoutes } from './routes/current-user.routes';

const BASE_PATH = '/api/v1/auth';

export const appRoutes = (app: Application): void => {
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, currentUserRoutes());
};
