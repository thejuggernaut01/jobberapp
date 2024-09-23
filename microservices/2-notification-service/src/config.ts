import dotenv from 'dotenv';

dotenv.config({});

type IENVIRONMENT = {
  APP: {
    NODE_ENV: string;
    CLIENT_URL: string;
  };
  EMAIL: {
    SENDER_EMAIL: string;
    SENDER_EMAIL_PASSWORD: string;
  };
  RABBITMQ: {
    RABBITMQ_ENDPOINT: string;
  };
  ELASTIC_SEARCH: {
    ELASTIC_SEARCH_URL: string;
  };
};

export const ENVIRONMENT: IENVIRONMENT = {
  APP: {
    NODE_ENV: process.env.NODE_ENV || '',
    CLIENT_URL: process.env.CLIENT_URL || ''
  },
  EMAIL: {
    SENDER_EMAIL: process.env.SENDER_EMAIL || '',
    SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD || ''
  },
  RABBITMQ: {
    RABBITMQ_ENDPOINT: process.env.RABBITMQ_ENDPOINT || ''
  },
  ELASTIC_SEARCH: {
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL || ''
  }
};

// class ENV_CONFIG {
//   public NODE_ENV: string | undefined;
//   public CLIENT_URL: string | undefined;
//   public SENDER_EMAIL: string | undefined;
//   public SENDER_EMAIL_PASSWORD: string | undefined;
//   public RABBITMQ_ENDPOINT: string | undefined;
//   public ELASTIC_SEARCH_URL: string | undefined;

//   constructor() {
//     this.NODE_ENV = process.env.NODE_ENV || '';
//     this.CLIENT_URL = process.env.CLIENT_URL || '';
//     this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
//     this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
//     this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
//     this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
//   }
// }

// export const config: ENV_CONFIG = new ENV_CONFIG();
