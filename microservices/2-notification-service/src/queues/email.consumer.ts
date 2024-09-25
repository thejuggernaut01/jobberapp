import { ENVIRONMENT } from '@notifications/config';
import { IEmailLocals, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { Channel, ConsumeMessage } from 'amqplib';

import { createConnection } from './connection';
import { sendMail } from './mail.transport';

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
      const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        appLink: ENVIRONMENT.APP.CLIENT_URL,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        verifyLink,
        resetLink
      };

      // send emails
      await sendMail(template, receiverEmail, locals);
      // acknowledge
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeAuthEmailMessages() method error:', error);
  }
};

const consumeOrderEmailMessages = async (channel: Channel): Promise<void> => {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    const exchangeName = 'jobberapp-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';

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
      const {
        receiverEmail,
        username,
        template,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        appLink: `${ENVIRONMENT.APP.CLIENT_URL}`,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      };
      if (template === 'orderPlaced') {
        await sendMail('orderPlaced', receiverEmail, locals);
        await sendMail('orderReceipt', receiverEmail, locals);
      } else {
        await sendMail(template, receiverEmail, locals);
      }

      // send emails

      // acknowledge
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeOrderEmailMessages() method error:', error);
  }
};

export { consumeAuthEmailMessages, consumeOrderEmailMessages };
