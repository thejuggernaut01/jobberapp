import { ENVIRONMENT } from '@notifications/config';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { Channel, ConsumeMessage } from 'amqplib';

import { createConnection } from './connection';

const log: Logger = winstonLogger(`${ENVIRONMENT.ELASTIC_SEARCH.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

const consumeAuthEmailMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-email-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';

    // check if exchange exists
    await channel.assertExchange(exchangeName, 'direct');

    // check if queue exists
    const jobberappQueue = await channel.assertQueue(queueName, {
      durable: true, // persist message if queue restarts as long as it hasn't been consumed
      autoDelete: false
    });

    // create routing path between the exchange and queue using the routing key
    await channel.bindQueue(jobberappQueue.queue, exchangeName, routingKey);

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      console.log(JSON.parse(msg!.content.toString()));

      // send emails

      // acknowledge
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error:', error);
  }
};

export { consumeAuthEmailMessages };
