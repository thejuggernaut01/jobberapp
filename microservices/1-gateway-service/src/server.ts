import http from 'http';

import { CustomError, IErrorResponse, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import cookieSession from 'cookie-session';
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { StatusCodes } from 'http-status-codes';
import { ENVIRONMENT } from '@gateway/config/environment';
import { elasticSearch } from '@gateway/elasticsearch';
import { appRoutes } from '@gateway/routes';
import { axiosAuthInstance } from '@gateway/services/api/auth.service';
import { axiosBuyerInstance } from '@gateway/services/api/buyer.service';
import { axiosSellerInstance } from '@gateway/services/api/seller.service';
import { axiosGigInstance } from '@gateway/services/api/gig.service';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOAppHandler } from '@gateway/sockets/socket';

const SERVER_PORT = 4000;
const log: Logger = winstonLogger(`${ENVIRONMENT.BASE_URL.ELASTIC_SEARCH}`, 'apiGatewayServer', 'debug');

export let socketIO: Server;

export class GatewayServer {
  constructor(private app: Application) {}

  /**
   * start
   */
  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.startElasticSearch();
    this.errorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.set('trust-proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${ENVIRONMENT.SECRET_KEY_ONE}`, `${ENVIRONMENT.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 36000000,
        secure: ENVIRONMENT.APP.ENV !== 'development'
        // sameSite: none
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: ENVIRONMENT.BASE_URL.CLIENT,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session?.jwt) {
        axiosAuthInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosBuyerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosSellerInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        axiosGigInstance.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
      }

      next();
    });
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ limit: '200mb', extended: true }));
  }

  private routesMiddleware(app: Application): void {
    appRoutes(app);
  }

  private startElasticSearch(): void {
    elasticSearch.checkConnection();
  }

  private errorHandler(app: Application): void {
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
      const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      log.log('error', `${fullUrl} endpoint does not exist.`, '');
      res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exists' });

      next();
    });

    app.use('*', (error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      log.log('error', `GatewayService ${error.comingFrom}:`, error);

      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeError());
      }

      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io = new Server(httpServer, {
      cors: {
        origin: ENVIRONMENT.BASE_URL.CLIENT,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });

    const pubClient = createClient({ url: ENVIRONMENT.BASE_URL.REDIS_HOST });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    io.adapter(createAdapter(pubClient, subClient));
    socketIO = io;
    return io;
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      log.info(`Gateway server has started with process id: ${process.pid}`);
      httpServer.listen(SERVER_PORT, () => {
        log.info(`Gateway server running on port: ${SERVER_PORT}`);
      });
    } catch (error) {
      log.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  private socketIOConnections(io: Server): void {
    const socketIOApp = new SocketIOAppHandler(io);
    socketIOApp.listen();
  }
}
