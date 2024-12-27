import { ENVIRONMENT } from '@chat/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(ENVIRONMENT.BASE_URL.ELASTIC_SEARCH, 'chatQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(ENVIRONMENT.BASE_URL.RABBITMQ_ENDPOINT);
    const channel: Channel = await connection.createChannel();
    log.info('Chat server connected to queue successfully...');
    closeConnection(channel, connection);
    return channel;
  } catch (error) {
    log.log('error', 'ChatService createConnection() method error:', error);
    return undefined;
  }
}

function closeConnection(channel: Channel, connection: Connection): void {
  process.once('SIGINT', async () => {
    await channel.close();
    await connection.close();
  });
}

export { createConnection };
