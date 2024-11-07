import { Request, Response } from 'express';
import * as auth from '@auth/services/auth.service';
import * as helper from '@thejuggernaut01/jobberapp-shared';
import { Sequelize } from 'sequelize';
import { ENVIRONMENT } from '@auth/config/environment';

import { read, resendEmail } from '../current-user';

import { authMockRequest, authUserPayload, authMockResponse, authMock } from './mocks/auth.mock';

jest.mock('@auth/services/auth.service');
jest.mock('@thejuggernaut01/jobberapp-shared');
jest.mock('@auth/queues/auth.producer');
jest.mock('@elastic/elasticsearch');

const USERNAME = 'Ayoola';
const PASSWORD = 'ayoola1';

let mockConnection: Sequelize;

describe('CurrentUser', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    mockConnection = new Sequelize(ENVIRONMENT.DB.MYSQL_DB, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        multipleStatements: true
      }
    });
    await mockConnection.sync({ force: true });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await mockConnection.close();
  });

  describe('CurrentUser read method', () => {
    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;

      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getAuthUserById').mockResolvedValue(authMock);

      await read(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: authMock
      });
    });

    it('should return empty user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;

      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getAuthUserById').mockResolvedValue({} as never);

      await read(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authenticated user',
        user: null
      });
    });
  });

  describe('CurrentUser read method', () => {
    it('should call BadRequestError for invalid email', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;

      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getUserByEmail').mockResolvedValue({} as never);

      resendEmail(req, res).catch(() => {
        expect(helper.BadRequestError).toHaveBeenCalledWith('Email is invalid', 'CurrentUser resentEmail() method error');
      });
    });

    it('should call updateVerifyEmailField method', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;

      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(authMock);

      await resendEmail(req, res);
      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
    });

    it('should return authenticated user', async () => {
      const req: Request = authMockRequest({}, { username: USERNAME, password: PASSWORD }, authUserPayload) as unknown as Request;

      const res: Response = authMockResponse();
      jest.spyOn(auth, 'getUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(auth, 'getAuthUserById').mockResolvedValue(authMock);

      await resendEmail(req, res);

      expect(auth.updateVerifyEmailField).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email verification sent',
        user: authMock
      });
    });
  });
});
