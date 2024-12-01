import { Client } from '@elastic/elasticsearch';
import { CountResponse } from '@elastic/elasticsearch/lib/api/types';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { ENVIRONMENT } from '@gig/config/environment';
import { ISellerGig, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'gigElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
  node: `${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`
});

const checkConnection = async (): Promise<void> => {
  let isConnected = false;

  while (!isConnected) {
    log.info('GigService connecting to Elasticsearch...');
    try {
      const health: ClusterHealthResponse = await elasticSearchClient.cluster.health({});

      log.info(`GigService Elasticsearch health status - ${health.status}`);
      isConnected = true;
    } catch (error) {
      log.error('Connection to Elasticsearch failed. Retying...');
      log.log('error', 'GigService checkConnection() method:', error);
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
    log.log('Error', 'GigService elasticsearch createIndex() method error:', error);
  }
};

const getDocumentCount = async (index: string): Promise<number> => {
  try {
    const result: CountResponse = await elasticSearchClient.count({ index });
    return result.count;
  } catch (error) {
    log.log('error', 'GigService elasticsearch getDocumentCount() method error:', error);
    return 0;
  }
};

const getIndexedGig = async (index: string, itemId: string): Promise<ISellerGig> => {
  try {
    const result: GetResponse = await elasticSearchClient.get({ index, id: itemId });
    return result._source as ISellerGig;
  } catch (error) {
    log.log('error', 'GigService elasticsearch getIndexedGig() method error:', error);
    return {} as ISellerGig;
  }
};

const addDataToIndex = async (index: string, itemId: string, gigDocument: ISellerGig): Promise<void> => {
  try {
    await elasticSearchClient.index({ index, id: itemId, document: gigDocument });
  } catch (error) {
    log.log('error', 'GigService elasticsearch addDataToIndex() method error:', error);
  }
};

const updateIndexedData = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  try {
    await elasticSearchClient.update({ index, id: itemId, doc: gigDocument });
  } catch (error) {
    log.log('error', 'GigService elasticsearch updateIndexedData() method error:', error);
  }
};

const deleteIndexedData = async (index: string, itemId: string): Promise<void> => {
  try {
    await elasticSearchClient.delete({ index, id: itemId });
  } catch (error) {
    log.log('error', 'GigService elasticsearch deleteIndexedData() method error:', error);
  }
};

export {
  checkConnection,
  createIndex,
  elasticSearchClient,
  getIndexedGig,
  addDataToIndex,
  updateIndexedData,
  deleteIndexedData,
  getDocumentCount
};
