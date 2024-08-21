import { IProperty } from './property.interface';

export const UserSearchableFields = ['email', 'presentAddress'];

// Define fields that cannot be updated by the user
export const keysToExclude: (keyof IProperty)[] = [
  'ownerType',
  'ownerNumber',
  'proofOfOwnership',
  'address',
  'category',
  'price',
  'priceType',
  'size',
  'decorationType',
  'flore',
  'propertyType',
  'bedType',
  'createdBy',
  'status',
  'isApproved',
  'isBooked',
];
