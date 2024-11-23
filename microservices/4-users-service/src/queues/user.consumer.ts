import { IBuyerDocument, ISellerDocument, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { ENVIRONMENT } from '@users/config/environment';
import { Logger } from 'winston';
import { Channel, ConsumeMessage } from 'amqplib';
import { createBuyer, updateBuyerPurchasedGigsProp } from '@users/services/buyer.service';
import {
  getRandomSellers,
  updateSellerCancelledJobsProp,
  updateSellerCompletedJobsProps,
  updateSellerOngoingJobsProp,
  updateSellerReview,
  updateTotalGigsCount
} from '@users/services/seller.service';
import { createConnection } from '@users/queues/connection';
import { publishDirectMessage } from '@users/queues/user.producer';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'usersServiceConsumer', 'debug');

const consumeBuyerDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-buyer-update';
    const routingKey = 'user-buyer';
    const queueName = 'user-buyer-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberappQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberappQueue.queue, exchangeName, routingKey);

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      const msgContent = JSON.parse(msg!.content.toString());
      const { type } = msgContent;

      if (type === 'auth') {
        const { username, email, profilePicture, country, createdAt } = msgContent;

        const buyer: IBuyerDocument = {
          username,
          email,
          profilePicture,
          country,
          purchasedGigs: [],
          createdAt
        };

        await createBuyer(buyer);
      } else {
        const { buyerId, purchasedGigs } = msgContent;
        await updateBuyerPurchasedGigsProp(buyerId, purchasedGigs, type);
      }
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeBuyerDirectMessage() method error:', error);
  }
};

const consumeSellerDirectMessage = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-seller-update';
    const routingKey = 'user-seller';
    const queueName = 'user-seller-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberappQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberappQueue.queue, exchangeName, routingKey);

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      const msgContent = JSON.parse(msg!.content.toString());
      const { type, sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery, gigSellerId, count } = msgContent;

      if (type === 'create-order') {
        await updateSellerOngoingJobsProp(sellerId, ongoingJobs);
      } else if (type === 'approve-order') {
        await updateSellerCompletedJobsProps({
          sellerId,
          ongoingJobs,
          completedJobs,
          totalEarnings,
          recentDelivery
        });
      } else if (type === 'update-gig-count') {
        await updateTotalGigsCount(gigSellerId, count);
      } else if (type === 'cancel-order') {
        await updateSellerCancelledJobsProp(sellerId);
      }

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeSellerDirectMessage() method error:', error);
  }
};

const consumeReviewFanoutMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-review';
    const queueName = 'seller-review-queue';

    await channel.assertExchange(exchangeName, 'fanout');
    const jobberappQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberappQueue.queue, exchangeName, '');

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      const msgContent = JSON.parse(msg!.content.toString());
      const { type } = msgContent;

      if (type === 'buyer-review') {
        await updateSellerReview(msgContent);
        await publishDirectMessage(
          channel,
          'jobberapp-update-gig',
          'update-gig',
          JSON.stringify({ type: 'updateGig', gigReview: msgContent }),
          'Message sent to gig service'
        );
      }

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeReviewFanoutMessages() method error:', error);
  }
};

const consumeSeedGigDirectMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-gig';
    const routingKey = 'get-sellers';
    const queueName = 'user-gig-queue';

    await channel.assertExchange(exchangeName, 'direct');
    const jobberappQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobberappQueue.queue, exchangeName, routingKey);

    channel.consume(jobberappQueue.queue, async (msg: ConsumeMessage | null) => {
      const msgContent = JSON.parse(msg!.content.toString());
      const { type, count } = msgContent;

      if (type === 'getSellers') {
        const sellers: ISellerDocument[] = await getRandomSellers(parseInt(count, 10));
        await publishDirectMessage(
          channel,
          'jobberapp-seed-gig',
          'receive-sellers',
          JSON.stringify({ type: 'receiveSellers', sellers, count }),
          'Message sent to gig service'
        );
      }

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'UsersService UserConsumer consumeSeedGigDirectMessages() method error:', error);
  }
};

export { consumeBuyerDirectMessage, consumeSellerDirectMessage, consumeReviewFanoutMessages, consumeSeedGigDirectMessages };
