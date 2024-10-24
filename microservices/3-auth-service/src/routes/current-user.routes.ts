import { read, resendEmail } from '@auth/controllers/current-user';
import { token } from '@auth/controllers/refresh-token';
import express, { Router } from 'express';

const router: Router = express.Router();

export const currentUserRoutes = (): Router => {
  router.get('/refresh-token/:username', token);
  router.get('/current-user', read);
  router.post('/resend-email', resendEmail);

  return router;
};
