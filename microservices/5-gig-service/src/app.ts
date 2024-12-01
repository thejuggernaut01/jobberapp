import { cloudinaryConfig } from '@gig/config/cloudinary';
import { databaseConnection } from '@gig/database';
import express, { Express } from 'express';
import { start } from '@gig/server';

const initialize = (): void => {
  cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
};

initialize();
