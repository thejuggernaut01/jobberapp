import { IAuthPayload, IBuyerDocument } from '@thejuggernaut01/jobberapp-shared';
import { Response } from 'express';

export const buyerMockRequest = (sessionData: IJWT, currentUser?: IAuthPayload | null, params?: IParams) => ({
  session: sessionData,
  params,
  currentUser
});

export const buyerMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export interface IJWT {
  jwt?: string;
}

export interface IParams {
  username?: string;
}

export const authUserPayload: IAuthPayload = {
  id: 1,
  username: 'Ayoola',
  email: 'test@test.com',
  iat: 123456789
};

export const buyerDocument: IBuyerDocument = {
  _id: '8765432345678',
  username: 'Ayoola',
  email: 'test@test.com',
  country: 'Malta',
  profilePicture: '',
  isSeller: false,
  purchasedGigs: [],
  createdAt: '2024-10-24T07:42:24.431Z'
};
