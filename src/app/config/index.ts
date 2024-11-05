import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

export default {
  port: process.env.PORT,
  ipAddress: process.env.IP_ADDRESS,
  nodeEnv: process.env.NODE_ENV,
  corsOrigin: process.env.CORS_ORIGIN,
  dbURL: process.env.DATABASE_URL,

  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,

  superAdminFullName: process.env.SUPER_ADMIN_FULLNAME,
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL,
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
  superAdminRole: process.env.SUPER_ADMIN_ROLE,
  superAdminIsVerified: process.env.SUPER_ADMIN_IS_VERIFIED,
  superAdminStatus: process.env.SUPER_ADMIN_STATUS,

  smtpEmailUser: process.env.SMTP_EMAIL_USER,
  smtpEmailPass: process.env.SMTP_EMAIL_PASS,

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,

  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};
