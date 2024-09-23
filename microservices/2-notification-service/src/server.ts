import http from 'http';

import { Logger } from 'winston';
import { ENVIRONMENT } from '@notifications/config';
import { Application } from 'express';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import 'express-async-errors';
import { healthRoutes } from '@notifications/routes';
import { checkConnection } from '@notifications/elasticsearch';
import { Channel } from 'amqplib';

import { createConnection } from './queues/connection';
import { consumeAuthEmailMessages } from './queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${ENVIRONMENT.ELASTIC_SEARCH.ELASTIC_SEARCH_URL}`, 'notificationService', 'debug');

const startQueues = async (): Promise<void> => {
  const emailChannel: Channel = (await createConnection()) as Channel;
  consumeAuthEmailMessages(emailChannel);

  await emailChannel.assertExchange('jobberapp-email-notification', 'direct');
  const message = JSON.stringify({ name: 'jobberapp', service: 'notification service' });

  emailChannel.publish('jobberapp-email-notification', 'auth-email', Buffer.from(message));
};

const startElasticSearch = (): void => {
  checkConnection();
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`worker on process id of ${process.pid} on notification server has started`);

    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    // This will send log messages to elastic search
    log.log('error', 'Notification service startServer() method', error);
  }
};

export const start = (app: Application): void => {
  startServer(app);
  startQueues();
  startElasticSearch();
  app.use('', healthRoutes);
};
