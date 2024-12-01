import { ENVIRONMENT } from '@notifications/config';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.ELASTIC_SEARCH.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');

const closeConnection = (channel: Channel, connection: Connection): void => {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
};

const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection: Connection = await client.connect(`${ENVIRONMENT.RABBITMQ.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();

    log.info('Notification server connected to queue successfully...');

    // gracefully shut down connection and channel resources when the app is terminated
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', 'NotificationService error createConnection() method:', error);
    return undefined;
  }
};

export { createConnection };
