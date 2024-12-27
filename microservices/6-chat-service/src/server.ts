import http from 'http';

import { CustomError, IAuthPayload, IErrorResponse, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { ENVIRONMENT } from '@chat/config/environment';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import { verify } from 'jsonwebtoken';
import compression from 'compression';
import { checkConnection } from '@chat/elasticsearch';
import { appRoutes } from '@chat/routes';
// import { createConnection } from '@chat/queues/connection';
import { Channel } from 'amqplib';
import { Server } from 'socket.io';

const SERVER_PORT = 4005;
const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'chatServer', 'debug');
let chatChannel: Channel;
let socketIOChatObject: Server;

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
  // chatChannel = (await createConnection()) as Channel;
};

const startElasticSearch = (): void => {
  checkConnection();
};

const chatErrorMiddleware = (app: Application): void => {
  app.use('*', (error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    log.log('error', `ChatService ${error.comingFrom}:`, error);

    if (error instanceof CustomError) {
      res.status(error.statusCode).json(error.serializeError());
    }

    next();
  });
};

const startServer = async (app: Application): Promise<void> => {
  try {
    const httpServer: http.Server = new http.Server(app);
    const socketIO: Server = await createSocketIO(httpServer);
    startHttpServer(httpServer);
    socketIOChatObject = socketIO;
  } catch (error) {
    log.log('error', 'ChatService startServer() method error:', error);
  }
};

const createSocketIO = async (httpServer: http.Server): Promise<Server> => {
  const io: Server = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }
  });
  return io;
};

const startHttpServer = (httpServer: http.Server): void => {
  try {
    log.info(`Chat server has started with process id ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Chat server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'ChatService startHttpServer() method error:', error);
  }
};

const start = (app: Application): void => {
  securityMiddleware(app);
  standardMiddleware(app);
  routesMiddleware(app);
  startQueues();
  startElasticSearch();
  chatErrorMiddleware(app);
  startServer(app);
};

export { start, chatChannel, socketIOChatObject };
