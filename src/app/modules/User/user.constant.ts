import { IUser } from './user.interface';

// Fields that can be searched in the user model
export const UserSearchableFields = ['email', 'presentAddress'];

// Fields that are not allowed to be updated by the user
export const userFieldsToExclude: (keyof IUser)[] = [
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

export const USER_STATUS = {
  'in-progress': 'in-progress',
  active: 'active',
  blocked: 'blocked',
  deleted: 'deleted',
} as const;

export const GENDER = {
  male: 'male',
  female: 'female',
  others: 'others',
} as const;
