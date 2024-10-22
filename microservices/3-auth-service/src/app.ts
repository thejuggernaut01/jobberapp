import express, { Express } from 'express';
import { start } from '@auth/server';
import { databaseConnection } from '@auth/database';
import { cloudinaryConfig } from '@auth/config/cloudinary';

const initialize = (): void => {
  cloudinaryConfig();

  const app: Express = express();
  databaseConnection();
  start(app);
};

initialize();
