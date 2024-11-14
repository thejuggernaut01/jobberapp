import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { ENVIRONMENT } from '@auth/config/environment';
import { ISellerGig, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { GetResponse } from '@elastic/elasticsearch/lib/api/types';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'authElasticSearchServer', 'debug');

// connection to elastic search node
const elasticSearchClient = new Client({
  node: `${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`
});

// connection to check elastic search node health status
const checkConnection = async (): Promise<void> => {
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

const checkIfIndexExist = async (indexName: string): Promise<boolean> => {
  const result: boolean = await elasticSearchClient.indices.exists({ index: indexName });
  return result;
};

const createIndex = async (indexName: string): Promise<void> => {
  try {
    const result: boolean = await checkIfIndexExist(indexName);

    if (result) {
      log.info(`Index "${indexName}" already exists`);
    } else {
      await elasticSearchClient.indices.create({ index: indexName });
      await elasticSearchClient.indices.refresh({ index: indexName });
      log.info(`Index "${indexName}" has been created successfully`);
    }
  } catch (error) {
    log.error(`An error occured while creating the index ${indexName}`);
    log.log('Error', 'AuthService elasticsearch createIndex() method error:', error);
  }
};

const getDocumentById = async (index: string, gigId: string): Promise<ISellerGig> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({
      index,
      id: gigId
    });

    return result._source as ISellerGig;
  } catch (error) {
    log.log('Error', 'AuthService elasticsearch getDocumentById() method error:', error);
    return {} as ISellerGig;
  }
};

export { elasticSearchClient, checkConnection, checkIfIndexExist, createIndex, getDocumentById };
