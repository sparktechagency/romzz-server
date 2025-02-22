import { IProperty } from './property.interface';

export const MAX_PROPERTY_IMAGES = 11;

// Fields that can be searched in property queries.
export const PropertySearchableFields = [
  'fullName',
  'email',
  'phoneNumber',
  'nidNumber',
  'presentLocation.address',
];

// Define fields that cannot be updated by the user
export const propertyFieldsToExclude: (keyof IProperty)[] = [
  'createdBy',
  'ownerType',
  'ownerNumber',
  'ownershipImages',
  'address',
  'location',
  'category',
  'price',
  'priceType',
  'size',
  'decorationType',
  'flore',
  'propertyType',
  'bedType',
  'status',
  'isApproved',
  'isBooked',
  'isHighlighted',
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

export const BED_TYPE = {
  sofa: 'sofa',
  "sofa-dev": 'sofa-bed',
  'single-bed': 'single-bed',
  'double-bed': 'double-bed',
} as const;

export const ALLOWED_GENDER = {
  any: 'any',
  male: 'male',
  female: 'female',
  others: 'others',
} as const;

export const GUEST_TYPE = {
  male: 'Male',
  female: 'Female',
  all: 'All',
} as const;

export const OCCUPATION = {
  any: 'any',
  student: 'student',
  professional: 'professional',
} as const;

export const STATUS = {
  pending: 'pending',
  approved: 'approved',
  booked: 'booked',
  rejected: 'rejected',
} as const;
