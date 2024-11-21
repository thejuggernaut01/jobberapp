import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { ENVIRONMENT } from '@users/config/environment';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'usersDatabaseServer', 'debug');

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(ENVIRONMENT.DB.MONGO);

    log.info('Users service successfully connected to database');
  } catch (error) {
    log.error('Userss Service - Unable to connect to database');
    log.log('error', 'UsersService databaseConnection() method error:', error);
  }
};
