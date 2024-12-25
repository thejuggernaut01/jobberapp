import { verifyGatewayRequest } from '@thejuggernaut01/jobberapp-shared';
import { Application } from 'express';

const BASE_PATH = '/api/v1/message';

const appRoutes = (app: Application): void => {
  app.use('', () => console.log('Health routes'));
  app.use(BASE_PATH, verifyGatewayRequest, () => console.log('Chat routes'));
};

export { appRoutes };
