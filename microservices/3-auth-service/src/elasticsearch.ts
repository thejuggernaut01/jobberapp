import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { ENVIRONMENT } from '@auth/config/environment';
import { winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'authElasticSearchServer', 'debug');

// connection to elastic search node
export const elasticSearchClient = new Client({
  node: `${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`
});

// connection to check elastic search node health status
export const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    log.info('AuthService connecting to Elasticsearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});

      log.info(`AuthService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retying...');
      log.log('error', 'AuthService checkConnection() method:', error);
    }
  }
};
