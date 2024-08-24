import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { ObjectId } from 'mongoose';
import { TUserRole } from '../modules/User/user.interface';

export const createJwtToken = (
  payload: {
    userId: ObjectId;
    email: string;
    role: TUserRole;
  },
  secret: Secret,
  expiresIn: string,
) => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};

export const verifyJwtToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
