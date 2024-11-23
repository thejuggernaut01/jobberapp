import http from 'http';

import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { ENVIRONMENT } from '@users/config/environment';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from '@users/elasticsearch';
import { appRoutes } from '@users/routes';
import { createConnection } from '@users/queues/connection';
import { Channel } from 'amqplib';
import {
  consumeBuyerDirectMessage,
  consumeReviewFanoutMessages,
  consumeSeedGigDirectMessages,
  consumeSellerDirectMessage
} from '@users/queues/user.consumer';

const SERVER_PORT = 4003;
const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'usersDatabaseServer', 'debug');

const securityMiddleware = (app: Application): void => {
  app.set('trust proxy', 1);
  app.use(hpp());
  app.use(helmet());
  app.use(
    cors({
      origin: ENVIRONMENT.BASE_URL.API_GATEWAY,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    })
  );

  app.use((req: Request) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const payload: IAuthPayload = verify(token, ENVIRONMENT.TOKEN.JWT) as IAuthPayload;

      req.currentUser = payload;
    }
  });
};

const standardMiddleware = (app: Application): void => {
  app.use(compression());
  app.use(json({ limit: '200mb' }));
  app.use(urlencoded({ limit: '200mb', extended: true }));
};

const routesMiddleware = (app: Application): void => {
  appRoutes(app);
};

const startQueues = async (): Promise<void> => {
  const userChannel: Channel = (await createConnection()) as Channel;
  await consumeBuyerDirectMessage(userChannel);
  await consumeSellerDirectMessage(userChannel);
  await consumeReviewFanoutMessages(userChannel);
  await consumeSeedGigDirectMessages(userChannel);
};

const startElasticSearch = (): void => {
  checkConnection();
};

const usersErrorMiddleware = (app: Application): void => {
  app.use('*', (error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `UsersService ${error.comingFrom}:`, error);

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeError());
    }

    next();
  });
};

const startServer = (app: Application): void => {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Users server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Users server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'UsersService startServer() method error: ', error);
  }
};

export const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  usersErrorMiddleware(app);
  startServer(app);
};
