import { ENVIRONMENT } from '@gateway/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { createClient } from 'redis';

type RedisClient = ReturnType<typeof createClient>;

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'gigRedisConnection', 'debug');

class RedisConnection {
  client: RedisClient;

  constructor() {
    this.client = createClient({ url: ENVIRONMENT.BASE_URL.REDIS_HOST });
  }

  async redisConnect(): Promise<void> {
    try {
      await this.client.connect();
      log.info(`GatewayService Redis Connection: ${await this.client.ping()}`);
      this.cacheError();
    } catch (error) {
      log.log('error', 'GatewayService redisConnect() method error', error);
    }
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      log.error(error);
    });
  }
}

export const redisConnection = new RedisConnection();
