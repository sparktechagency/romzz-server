import { IUser } from './user.interface';

export const USER_ROLE = {
  user: 'user',
  admin: 'admin',
  superAdmin: 'superAdmin',
} as const;

export const UserSearchableFields = ['email', 'presentAddress'];

// Define fields that cannot be updated by the user
export const fieldsToExclude: (keyof IUser)[] = [
  'email',
  'password',
  'passwordChangedAt',
  'role',
  'status',
  'isBlocked',
  'isDeleted',
  'isVerified',
  'otp',
  'otpExpiresAt',
];
