import { Create } from '@gateway/controllers/users/seller/create.controller';
import { Get } from '@gateway/controllers/users/seller/get.controller';
import { SellerSeed } from '@gateway/controllers/users/seller/seed.controller';
import { Update } from '@gateway/controllers/users/seller/update.controller';
import express, { Router } from 'express';

class SellerRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/seller/id/:sellerId', Get.prototype.id);
    this.router.get('/seller/username/:username', Get.prototype.username);
    this.router.get('/seller/random/:size', Get.prototype.random);

    this.router.post('/seller/create', Create.prototype.seller);
    this.router.put('/seller/:sellerId', Update.prototype.seller);
    this.router.put('/seller/seed/:count', SellerSeed.prototype.seller);

    return this.router;
  }
}

export const sellerRoutes: SellerRoutes = new SellerRoutes();
