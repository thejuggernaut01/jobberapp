import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { ENVIRONMENT } from '@auth/config/environment';
import { Sequelize } from 'sequelize';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'authDatabaseServer', 'debug');

export const sequelize = new Sequelize(ENVIRONMENT.DB.MYSQL_DB, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    multipleStatements: true
  }
});

export const databaseConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();

    log.info('AuthService MYSQL database connection has been established successfully');
  } catch (error) {
    log.error('Auth Service - Unable to connect to database');
    log.log('error', 'AuthService databaseConnection() method error:', error);
  }
};
