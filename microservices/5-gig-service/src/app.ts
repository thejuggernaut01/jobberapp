import { cloudinaryConfig } from '@gig/config/cloudinary';
import { databaseConnection } from '@gig/database';
import express, { Express } from 'express';
import { start } from '@gig/server';
import { redisConnect } from './redis/redis.connection';

const initialize = (): void => {
  cloudinaryConfig();
  databaseConnection();
  const app: Express = express();
  start(app);
  redisConnect();
};

initialize();
