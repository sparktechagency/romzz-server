import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createJwtToken = (payload: object, secret: Secret, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
};

const verifyJwtToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export { createJwtToken, verifyJwtToken };
