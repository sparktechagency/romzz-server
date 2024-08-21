import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

export const createJwtToken = (
  payload: {
    userId: ObjectId;
    email: string;
    role: 'user' | 'admin' | 'super-admin';
  },
  secret: Secret,
  expiresIn: string,
) => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};

export const verifyJwtToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
