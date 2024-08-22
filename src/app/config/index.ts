import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  dbURL: process.env.DATABASE_URL,
  collectionName: process.env.COLLECTION_NAME,

  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpiresIn: process.env.JWT_EXPIRES_IN,

  superAdminFullName: process.env.SUPER_ADMIN_FULLNAME,
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL,
  superAdminPhoneNumber: process.env.SUPER_ADMIN_PHONE_NUMBER,
  superAdminNidNumber: process.env.SUPER_ADMIN_NID_NUMBER,
  superAdminPermanentAddress: process.env.SUPER_ADMIN_PERMANENT_ADDRESS,
  superAdminGender: process.env.SUPER_ADMIN_GENDER,
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
  superAdminRole: process.env.SUPER_ADMIN_ROLE,
  superAdminIsVerified: process.env.SUPER_ADMIN_PASSWORD,

  smtpEmailUser: process.env.SMTP_EMAIL_USER,
  smtpEmailPass: process.env.SMTP_EMAIL_PASS,
};
