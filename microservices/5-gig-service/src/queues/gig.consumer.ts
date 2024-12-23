import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { createConnection } from '@gig/queues/connection';
import { Channel, ConsumeMessage } from 'amqplib';
import { ENVIRONMENT } from '@gig/config/environment';
import { seedData, updateGigReview } from '@gig/services/gig.service';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'gigServiceConsumer', 'debug');

const consumeGigDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-update-gig';
    const routingKey = 'update-gig';
    const queueName = 'gig-update-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberappQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberappQueue.queue, exchangeName, routingKey);

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      const msgContent = JSON.parse(msg!.content.toString());
      const { gigReview } = msgContent;
      await updateGigReview(JSON.parse(gigReview));

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'GigService GigConsumer consumeBuyerDirectMessage() method error:', error);
  }
};

const consumeSeedDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-seed-gig';
    const routingKey = 'receive-sellers';
    const queueName = 'seed-gig-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberappQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberappQueue.queue, exchangeName, routingKey);

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      const { seller, count } = JSON.parse(msg!.content.toString());
      await seedData(seller, count);

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'GigService GigConsumer consumeBuyerDirectMessage() method error:', error);
  }
};

export { consumeGigDirectMessage, consumeSeedDirectMessage };
