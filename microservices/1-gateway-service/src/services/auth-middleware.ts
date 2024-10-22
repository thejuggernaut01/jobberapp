import { ENVIRONMENT } from '@gateway/config/environment';
import { BadRequestError, IAuthPayload, NotAuthorizedError } from '@thejuggernaut01/jobberapp-shared';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

class AuthMiddleware {
  /**
   * verifyUser
   */
  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again...', 'GatewayService verifyUser() method error');
    }

    try {
      const payload: IAuthPayload = verify(req.session?.jwt, `${ENVIRONMENT.TOKEN.GATEWAY_JWT}`) as IAuthPayload;

      req.currentUser = payload;
    } catch (error) {
      console.log(error);

      throw new NotAuthorizedError(
        'Token is not available. Please login again...',
        'GatewayService verifyUser() method invalid session error'
      );
    }
    next();
  }

  /**
   * checkAuthentication
   */
  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError('Authenticatiton is required to access this route', 'GatewayService checkAuthentication() method error');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
