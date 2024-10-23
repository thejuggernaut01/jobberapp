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
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from './queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${ENVIRONMENT.ELASTIC_SEARCH.ELASTIC_SEARCH_URL}`, 'notificationService', 'debug');

const startQueues = async (): Promise<void> => {
  const emailChannel: Channel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);

  // const verificationLink = `${ENVIRONMENT.APP.CLIENT_URL}/confirm_email?v_token=12345gfkdsmwismowkow`;
  // const authMessageDetails: IEmailMessageDetails = {
  //   receiverEmail: `${ENVIRONMENT.EMAIL.SENDER_EMAIL}`,
  //   verifyLink: verificationLink,
  //   // make sure the template name correspond with the folder name
  //   template: 'verifyEmail'
  // };

  // await emailChannel.assertExchange('jobberapp-email-notification', 'direct');

  // const authMessage = JSON.stringify(authMessageDetails);
  // emailChannel.publish('jobberapp-email-notification', 'auth-email', Buffer.from(authMessage));

  // await emailChannel.assertExchange('jobberapp-order-notification', 'direct');
  // const orderMessage = JSON.stringify({ name: 'jobberapp', service: 'order notification service' });
  // emailChannel.publish('jobberapp-order-notification', 'order-email', Buffer.from(orderMessage));
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
