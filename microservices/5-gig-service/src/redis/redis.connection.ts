import { ENVIRONMENT } from '@gig/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { createClient } from 'redis';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'gigRedisConnection', 'debug');
type RedisClient = ReturnType<typeof createClient>;
const client: RedisClient = createClient({
  url: ENVIRONMENT.DB.REDIS_HOST
});

const redisConnect = async () => {
  try {
    await client.connect();
    log.info(`GigService Redis Connection: ${await client.ping()}`);
    cacheError();
  } catch (error) {
    log.log('error', 'GigService redisConnect() method error', error);
  }
};

const cacheError = (): void => {
  client.on('error', (error: unknown) => {
    log.error(error);
  });
};

export { redisConnect, client };
