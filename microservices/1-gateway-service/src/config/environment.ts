interface IENVIRONMENT {
  APP: {
    ENV: string;
  };
  TOKEN: {
    GATEWAY_JWT: string;
    JWT: string;
  };
  SECRET_KEY_ONE: string;
  SECRET_KEY_TWO: string;
  BASE_URL: {
    CLIENT: string;
    AUTH: string;
    USERS: string;
    GIG: string;
    MESSAGE: string;
    ORDER: string;
    REVIEW: string;
    ELASTIC_SEARCH: string;
    REDIS_HOST: string;
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
  SECRET_KEY_ONE: process.env.SECRET_KEY_ONE || '',
  SECRET_KEY_TWO: process.env.SECRET_KEY_TWO || '',
  BASE_URL: {
    CLIENT: process.env.CLIENT_URL || '',
    AUTH: process.env.AUTH_BASE_URL || '',
    USERS: process.env.USERS_BASE_URL || '',
    GIG: process.env.GIG_BASE_URL || '',
    MESSAGE: process.env.MESSAGE_BASE_URL || '',
    ORDER: process.env.ORDER_BASE_URL || '',
    REVIEW: process.env.REVIEW_BASE_URL || '',
    ELASTIC_SEARCH: process.env.ELASTIC_SEARCH_URL || '',
    REDIS_HOST: process.env.REDIS_HOST || ''
  }
};
