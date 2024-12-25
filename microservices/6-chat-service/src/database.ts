import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { ENVIRONMENT } from '@chat/config/environment';
import mongoose from 'mongoose';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'chatDatabaseServer', 'debug');

export const databaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connect(ENVIRONMENT.DB.MONGO);

    log.info('Chat service successfully connected to database');
  } catch (error) {
    log.error('Chat Service - Unable to connect to database');
    log.log('error', 'ChatService databaseConnection() method error:', error);
  }
};
