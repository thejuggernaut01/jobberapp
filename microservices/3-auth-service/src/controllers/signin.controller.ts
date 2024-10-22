import { AuthModel } from '@auth/models/auth.model';
import { signupSchema } from '@auth/schema/signup.schema';
import { getUserByEmail, getUserByUsername, signToken } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument, isEmail } from '@thejuggernaut01/jobberapp-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';

export async function read(req: Request, res: Response) {
  const { error } = await Promise.resolve(signupSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'SignIn read() method error');
  }

  const { username, password } = req.body;
  const isValidEmail: boolean = isEmail(username);

  const existingUser: IAuthDocument = !isValidEmail ? await getUserByUsername(username) : await getUserByEmail(username);

  if (!existingUser) {
    throw new BadRequestError('Invlaid credentials', 'SignIn read() method error');
  }

  const passwordsMatch: boolean = await AuthModel.prototype.comparePassword(password, existingUser.password!);

  if (!passwordsMatch) {
    throw new BadRequestError('Invlaid credentials', 'SignIn read() method error');
  }

  const userJWT: string = signToken(existingUser.id!, existingUser.email!, existingUser.username!);

  const userData: IAuthDocument = omit(existingUser, ['password']);

  res.status(StatusCodes.OK).json({ message: 'User login successfully', user: userData, token: userJWT });
}
