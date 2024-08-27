import { IUser } from './user.interface';

// Fields that can be searched in user queries.
export const UserSearchableFields = ['email', 'presentAddress'];

// Fields that cannot be updated by the user.
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

// Array of month names
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// User roles within the system.
export const USER_ROLE = {
  user: 'user',
  admin: 'admin',
  superAdmin: 'superAdmin',
} as const;

// Possible user account statuses.
export const USER_STATUS = {
  'in-progress': 'in-progress',
  active: 'active',
  blocked: 'blocked',
  deleted: 'deleted',
} as const;

// Gender options available for users.
export const GENDER = {
  male: 'male',
  female: 'female',
  others: 'others',
} as const;
