import { email } from '@users/controllers/buyer/get';
import express, { Router } from 'express';

const router: Router = express.Router();

const healthRoutes = (): Router => {
  router.get('/user-health', email);

  return router;
};

export { healthRoutes };
