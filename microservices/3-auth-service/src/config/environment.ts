import dotenv from 'dotenv';
dotenv.config();

interface IENVIRONMENT {
  APP: {
    ENV: string;
  };
  TOKEN: {
    GATEWAY_JWT: string;
    JWT: string;
  };
  BASE_URL: {
    CLIENT: string;
    API_GATEWAY: string;
    RABBITMQ_ENDPOINT: string;
    ELASTIC_SEARCH: string;
  };
  DB: {
    MYSQL_DB: string;
    CLOUD_NAME: string;
    CLOUD_API_KEY: string;
    CLOUD_API_SECRET: string;
  };
}

export const ENVIRONMENT: IENVIRONMENT = {
  APP: {
    ENV: process.env.NODE_ENV || ''
  },
  TOKEN: {
    GATEWAY_JWT: process.env.GATEWAY_JWT_TOKEN || '',
    JWT: process.env.JWT_TOKEN || ''
  },
  BASE_URL: {
    CLIENT: process.env.CLIENT_URL || '',
    API_GATEWAY: process.env.API_GATEWAY_URL || '',
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT || '',
    ELASTIC_SEARCH: process.env.ELASTIC_SEARCH_URL || ''
  },
  DB: {
    MYSQL_DB: process.env.MYSQL_DB || '',
    CLOUD_NAME: process.env.CLOUD_NAME || '',
    CLOUD_API_KEY: process.env.CLOUD_API_KEY || '',
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET || ''
  }
};
