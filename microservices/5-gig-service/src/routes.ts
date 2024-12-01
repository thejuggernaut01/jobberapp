import { verifyGatewayRequest } from '@thejuggernaut01/jobberapp-shared';
import { Application } from 'express';

const BASE_PATH = '/api/v1/gig';

const appRoutes = (app: Application): void => {
  app.use('', () => console.log('Heath routes'));
  app.use(BASE_PATH, verifyGatewayRequest, () => console.log('Gig routes'));
  app.use(BASE_PATH, verifyGatewayRequest, () => console.log('Search routes'));
};

export { appRoutes };
