import { getAuthUserById, getAuthUserByVerificationToken, updateVerifyEmailField } from '@auth/services/auth.service';
import { BadRequestError, IAuthDocument } from '@thejuggernaut01/jobberapp-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function update(req: Request, res: Response) {
  const { token } = req.body;

  const checkIfUserExist: IAuthDocument = await getAuthUserByVerificationToken(token);

  if (!checkIfUserExist) {
    throw new BadRequestError('Verification token is either invalid or is already used.', 'VerifyEmail update() method');
  }

  await updateVerifyEmailField(checkIfUserExist.id!, 1, '');
  const updateUser = await getAuthUserById(checkIfUserExist.id!);

  res.status(StatusCodes.OK).json({ message: 'Email verified successfully', user: updateUser });
}
