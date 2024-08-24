import { IUser } from './user.interface';

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

export const USER_ROLE = {
  user: 'user',
  admin: 'admin',
  superAdmin: 'superAdmin',
} as const;

export const GENDER = {
  male: 'male',
  female: 'female',
  others: 'others',
} as const;

export const USER_STATUS = {
  'in-progress': 'in-progress',
  active: 'active',
  blocked: 'blocked',
  deleted: 'deleted',
} as const;
