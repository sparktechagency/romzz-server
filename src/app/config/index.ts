import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  port: process.env.PORT,
  dbURL: process.env.DATABASE_URL,
  collectionName: process.env.COLLECTION_NAME,
  nodeEnv: process.env.NODE_ENV,
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: process.env.JWT_EXPIRES_IN,
  superAdminPassword: process.env.JWT_EXPIRES_IN,
  smtpEmailUser: process.env.SMTP_EMAIL_USER,
  smtpEmailPass: process.env.SMTP_EMAIL_PASS,
};
