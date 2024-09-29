import amqp from 'amqplib';

import * as connection from '../connection';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '../email.consumer';

jest.mock('@notifications/queues/connection');
jest.mock('amqplib');
jest.mock('@thejuggernaut01/jobberapp-shared');

beforeEach(() => {
  jest.resetAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('consumeAuthEmailMessages', () => {
  it('should be called', async () => {
    const channel = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      consume: jest.fn()
    };

    jest.spyOn(channel, 'assertExchange');
    // assert queue returns an object
    jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: 'auth-email-queue', messageCount: 0, consumerCount: 0 });

    jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
    const connectionChannel: amqp.Channel | undefined = await connection.createConnection();
    await consumeAuthEmailMessages(connectionChannel!);

    expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('jobberapp-email-notification', 'direct');
    expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
    expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
    expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('auth-email-queue', 'jobberapp-email-notification', 'auth-email');
  });
});

describe('consumeOrderEmailMessages', () => {
  it('should be called', async () => {
    const channel = {
      assertExchange: jest.fn(),
      publish: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      consume: jest.fn()
    };

    jest.spyOn(channel, 'assertExchange');
    // assert queue returns an object
    jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: 'order-email-queue', messageCount: 0, consumerCount: 0 });

    jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
    const connectionChannel: amqp.Channel | undefined = await connection.createConnection();
    await consumeOrderEmailMessages(connectionChannel!);

    expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('jobberapp-order-notification', 'direct');
    expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
    expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
    expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('order-email-queue', 'jobberapp-order-notification', 'order-email');
  });
});
