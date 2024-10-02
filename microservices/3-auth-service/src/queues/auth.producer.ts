import { Channel } from 'amqplib';
import { ENVIRONMENT } from '@auth/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { createConnection } from './connection';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'authServiceProducer', 'debug');

export const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange(exchangeName, 'direct');
    channel.publish(exchangeName, routingKey, Buffer.from(message));

    log.info(logMessage);
  } catch (error) {
    log.log('error', 'AuthService provider publishDirectMessage() method error:', error);
  }
};
