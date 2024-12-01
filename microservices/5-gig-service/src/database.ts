import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { ENVIRONMENT } from '@gig/config/environment';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'gigDatabaseServer', 'debug');

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(ENVIRONMENT.DB.MONGO);

    log.info('Gig service successfully connected to database');
  } catch (error) {
    log.error('Gig Service - Unable to connect to database');
    log.log('error', 'GigService databaseConnection() method error:', error);
  }
};
