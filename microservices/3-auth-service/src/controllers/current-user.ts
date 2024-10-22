import crypto from 'crypto';

import { getAuthUserById, getUserByEmail, updateVerifyEmailField } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, IEmailMessageDetails, lowerCase } from '@thejuggernaut01/jobberapp-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ENVIRONMENT } from '@auth/config/environment';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';

export async function read(req: Request, res: Response) {
  let user = null;
  const existingUser: IAuthDocument = await getAuthUserById(req.currentUser!.id);

  if (Object.keys(existingUser).length) {
    user = existingUser;
  }

  res.status(StatusCodes.OK).json({ message: 'Authenticated user', user });
}

export async function resendEmail(req: Request, res: Response) {
  const { email, userId } = req.body;

  const checkIfUserExist: IAuthDocument = await getUserByEmail(lowerCase(email));

  if (!checkIfUserExist) {
    throw new BadRequestError('Email is verified', 'CurrentUser resentEmail() method error');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');

  const verificationLink = `${ENVIRONMENT.BASE_URL.CLIENT}/confirm_email?v_token=${randomCharacters}`;

  await updateVerifyEmailField(parseInt(userId), 0, randomCharacters);

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: lowerCase(email),
    verifyLink: verificationLink,
    template: 'verifyEmail'
  };

  await publishDirectMessage(
    authChannel,
    'jobberapp-email-notification',
    'auth-email',
    JSON.stringify(messageDetails),
    'Verify email message has been sent to notification service'
  );

  const updatedUser = await getAuthUserById(parseInt(userId));

  res.status(StatusCodes.OK).json({ message: 'User created successfully', user: updatedUser });
}
