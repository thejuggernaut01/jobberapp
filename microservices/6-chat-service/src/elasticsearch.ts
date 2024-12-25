import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { ENVIRONMENT } from '@chat/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'chatElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    log.info('ChatService connecting to Elasticsearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});

      log.info(`ChatService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retying...');
      log.log('error', 'ChatService checkConnection() method:', error);
    }
  }
};

export { checkConnection };
