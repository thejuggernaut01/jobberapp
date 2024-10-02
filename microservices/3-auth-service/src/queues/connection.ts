import { ENVIRONMENT } from '@auth/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'authQueueConnection', 'debug');

const closeConnection = (channel: Channel, connection: Connection): void => {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
};

const createConnection = async (): Promise<Channel | undefined> => {
  try {
    const connection: Connection = await client.connect(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`);
    const channel: Channel = await connection.createChannel();

    log.info('Auth server connected to queue successfully...');

    // gracefully shut down connection and channel resources when the app is terminated
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', 'AuthService error createConnection() method error:', error);
    return undefined;
  }
};

export { createConnection };
