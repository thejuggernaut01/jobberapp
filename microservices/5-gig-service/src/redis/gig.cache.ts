import { ENVIRONMENT } from '@gig/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { client } from '@gig/redis/redis.connection';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'gigCache', 'debug');

const getUserSelectedGigCategory = async (key: string): Promise<string> => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    const response: string = (await client.GET(key)) as string;
    return response;
  } catch (error) {
    log.log('error', 'GigService GigCache getUserSelectedGigCategory() method error', error);
    return '';
  }
};

export { getUserSelectedGigCategory };
