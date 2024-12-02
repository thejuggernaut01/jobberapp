import { gigCreate } from '@gig/controllers/create.controller';
import { gigDelete } from '@gig/controllers/delete.controller';
import { gigById, sellerGigs, sellerInactiveGigs } from '@gig/controllers/get.controller';
import { gigUpdate, gigUpdateActive } from '@gig/controllers/update.controller';
import express, { Router } from 'express';

const router: Router = express.Router();

const gigRoutes = (): Router => {
  router.get('/:gigId', gigById);
  router.get('/seller/:sellerId', sellerGigs);
  router.get('/seller/pause/:sellerId', sellerInactiveGigs);
  router.post('/create', gigCreate);
  router.put('/:gigId', gigUpdate);
  router.put('/active/:gigId', gigUpdateActive);
  router.delete('/:gigId/:sellerId', gigDelete);

  return router;
};

export { gigRoutes };
