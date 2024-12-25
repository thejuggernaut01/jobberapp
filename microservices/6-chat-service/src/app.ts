import { cloudinaryConfig } from '@chat/config/cloudinary';
import { databaseConnection } from '@chat/database';
import express, { Express } from 'express';
import { start } from '@chat/server';

const initialize = (): void => {
  cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
};

initialize();
