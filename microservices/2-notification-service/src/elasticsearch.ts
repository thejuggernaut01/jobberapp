import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { config } from '@notifications/config';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

// connection to elastic search node
const elasticSearchClient = new Client({
  node: `${config.ELASTIC_SEARCH_URL}`
});

export const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    try {
      // health status will always give us a value -
      // Green (running) | Yellow (running) | Red (not running)
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});

      log.info('NotificationService Elasticsearch health status - ', health.status);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retying...');
      log.log('error', 'NotificationService checkConnection() method:', error);
    }
  }
};
