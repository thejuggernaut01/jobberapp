import { verifyGatewayRequest } from '@thejuggernaut01/jobberapp-shared';
import { Application } from 'express';
import { gigRoutes } from '@gig/routes/gig.routes';
import { healthRoutes } from '@gig/routes/health.routes';

const BASE_PATH = '/api/v1/gig';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, gigRoutes());
  app.use(BASE_PATH, verifyGatewayRequest, () => console.log('Search routes'));
};

export { appRoutes };
