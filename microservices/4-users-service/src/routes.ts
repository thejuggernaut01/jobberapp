import { Application } from 'express';
import { buyerRoutes } from '@users/routes/buyer.routes';
import { healthRoutes } from '@users/routes/health.routes';

const BUYER_BASE_PATH = '/api/v1/buyer';
const SELLER_BASE_PATH = '/api/v1/seller';

const appRoutes = (app: Application): void => {
  app.use('', healthRoutes());
  app.use(BUYER_BASE_PATH, buyerRoutes());
  app.use(SELLER_BASE_PATH, () => console.log('seller routes'));
};

export { appRoutes };
