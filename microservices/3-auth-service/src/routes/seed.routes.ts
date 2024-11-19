import { createSeedUsers } from '@auth/controllers/seed';
import express, { Router } from 'express';

const router: Router = express.Router();

export const seedRoutes = (): Router => {
  router.put('/seed/:count', createSeedUsers);

  return router;
};
