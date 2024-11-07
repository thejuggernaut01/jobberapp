import { IAuthPayload, IAuthDocument } from '@thejuggernaut01/jobberapp-shared';
import { Response } from 'express';

export const authMockRequest = (sessionData: IJWT, body: IAuthMock, currentUser?: IAuthPayload | null, params?: unknown) => ({
  session: sessionData,
  body,
  params,
  currentUser
});

export const authMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IAuthMock {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  createdAt?: Date | string;
}

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'Ayoola',
  email: 'test@test.com',
  iat: 123456789
};

export const authMock: IAuthDocument = {
  id: 1,
  profilePublicId: '1234567890987',
  username: 'Ayoola',
  email: 'test@test.com',
  country: 'Malta',
  profilePicture: '',
  emailVerified: 1,
  createdAt: '2024-10-24T07:42:24.431Z',
  comparePassword: () => {},
  hashPassword: () => false
} as unknown as IAuthDocument;
