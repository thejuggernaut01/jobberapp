import { ENVIRONMENT } from '@auth/config/environment';
import { AuthModel } from '@auth/models/auth.model';
import { publishDirectMessage } from '@auth/queues/auth.producer';
import { authChannel } from '@auth/server';
import { firstLetterUppercase, IAuthBuyerMessageDetails, IAuthDocument, lowerCase } from '@thejuggernaut01/jobberapp-shared';
import { sign } from 'jsonwebtoken';
// import { omit } from 'lodash';
import { Model, Op } from 'sequelize';

export const createUser = async (data: IAuthDocument): Promise<IAuthDocument> => {
  const result: Model = await AuthModel.create(data);
  const messageDetails: IAuthBuyerMessageDetails = {
    username: result.dataValues.username,
    email: result.dataValues.email,
    profilePicture: result.dataValues.profilePicture,
    country: result.dataValues.country,
    createdAt: result.dataValues.createdAt
  };

  await publishDirectMessage(
    authChannel,
    'jobberapp-buyer-update',
    'user-buyer',
    JSON.stringify(messageDetails),
    'Buyer details sent to buyer service'
  );

  const { password, ...userData } = result.dataValues as IAuthDocument;
  // const userData: IAuthDocument = omit(result.dataValues, ['password']) as IAuthDocument;
  return userData;
};

export const getAuthUserById = async (authId: number): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { id: authId },
    attributes: {
      exclude: ['password']
    }
  })) as Model;

  return user.dataValues;
};

export const getUserByUsernameOrEmail = async (username: string, email: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: {
      [Op.or]: [{ username: firstLetterUppercase(username) }, { email: lowerCase(email) }]
    }
  })) as Model;

  return user.dataValues;
};

export const getUserByUsername = async (username: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: {
      username: firstLetterUppercase(username)
    }
  })) as Model;

  return user.dataValues;
};

export const getUserByEmail = async (email: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: {
      email: lowerCase(email)
    }
  })) as Model;

  return user.dataValues;
};

export const getAuthUserByVerificationToken = async (token: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: { emailVerificationToken: token },
    attributes: {
      exclude: ['password']
    }
  })) as Model;

  return user.dataValues;
};

export const getAuthUserByPasswordToken = async (token: string): Promise<IAuthDocument> => {
  const user: Model = (await AuthModel.findOne({
    where: {
      [Op.and]: [{ passwordResetToken: token }, { passwordResetExpires: { [Op.gt]: new Date() } }]
    }
  })) as Model;

  return user.dataValues;
};

export const updateVerifyEmailField = async (authId: number, emailVerified: number, emailVerificationToken: string): Promise<void> => {
  await AuthModel.update(
    {
      emailVerified,
      emailVerificationToken
    },
    {
      where: { id: authId }
    }
  );
};

export async function updatePasswordToken(authId: number, token: string, tokenExpiration: Date): Promise<void> {
  await AuthModel.update(
    {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    },
    { where: { id: authId } }
  );
}

export async function updatePassword(authId: number, password: string): Promise<void> {
  await AuthModel.update(
    {
      password,
      passwordResetToken: '',
      passwordResetExpires: new Date()
    },
    { where: { id: authId } }
  );
}

export function signToken(id: number, email: string, username: string): string {
  return sign(
    {
      id,
      email,
      username
    },
    ENVIRONMENT.TOKEN.JWT
  );
}
