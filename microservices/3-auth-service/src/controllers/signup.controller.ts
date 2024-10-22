import crypto from 'crypto';

import { signupSchema } from '@auth/schema/signup.schema';
import { createUser, getUserByUsernameOrEmail, signToken } from '@auth/services/auth.service';
import {
  BadRequestError,
  firstLetterUppercase,
  IAuthDocument,
  IEmailMessageDetails,
  lowerCase,
  upload
} from '@thejuggernaut01/jobberapp-shared';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ENVIRONMENT } from '@auth/config/environment';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { StatusCodes } from 'http-status-codes';

export const create = async (req: Request, res: Response) => {
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Signup create() method error');
  }

  const { email, username, password, country, profilePicture } = req.body;
  const checkIfUserExist: IAuthDocument = await getUserByUsernameOrEmail(username, email);

  if (checkIfUserExist) {
    throw new BadRequestError('Invalid credentials. Email or Username', 'Signup create() method error');
  }

  const profilePublicId = uuidv4();
  const uploadResult: UploadApiResponse = (await upload(profilePicture, `${profilePublicId}`, true, true)) as UploadApiResponse;

  // if there's an error with upload
  if (uploadResult.public_id) {
    throw new BadRequestError('File upload error. Try again', 'Signup create() method error');
  }

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');

  const authData: IAuthDocument = {
    username: firstLetterUppercase(username),
    email: lowerCase(email),
    profilePublicId,
    password,
    country,
    profilePicture: uploadResult.secure_url,
    emailVerificationToken: randomCharacters
  } as IAuthDocument;

  const result: IAuthDocument = await createUser(authData);

  const verificationLink = `${ENVIRONMENT.BASE_URL.CLIENT}/confirm_email?v_token=${randomCharacters}`;

  const messageDetails: IEmailMessageDetails = {
    receiverEmail: result.email,
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

  const userJWT = signToken(result.id!, result.email!, result.username!);
  res.status(StatusCodes.CREATED).json({ message: 'User created successfully', user: result, token: userJWT });
};
