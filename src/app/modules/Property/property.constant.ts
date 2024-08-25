import { IProperty } from './property.interface';

export const PropertySearchableFields = ['email', 'presentAddress'];

// Define fields that cannot be updated by the user
export const propertyFieldsToExclude: (keyof IProperty)[] = [
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

export const OWNER_TYPE = {
  'own-property': 'own-property',
  'others-property': 'others-property',
} as const;

export const CATEGORY = {
  'whole-unit': 'whole-unit',
  'room-mate': 'room-mate',
  'flat-mate': 'flat-mate',
  house: 'house',
} as const;

export const PRICE_TYPE = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
} as const;

export const DECORATION_TYPE = {
  furnished: 'furnished',
  unfurnished: 'unfurnished',
} as const;

export const PROPERTY_TYPE = {
  'family-house': 'family-house',
  apartment: 'apartment',
  lodge: 'lodge',
  villa: 'villa',
  cottage: 'cottage',
} as const;

export const ALLOWED_GENDER = {
  all: 'all',
  male: 'male',
  female: 'female',
  others: 'others',
} as const;

export const GUEST_TYPE = {
  all: 'all',
  single: 'single',
  couple: 'couple',
  family: 'family',
} as const;

export const OCCUPATION = {
  all: 'all',
  student: 'student',
  professional: 'professional',
} as const;

export const STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
} as const;
