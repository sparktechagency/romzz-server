import { ObjectId } from 'mongoose';
import {
  ALLOWED_GENDER,
  CATEGORY,
  DECORATION_TYPE,
  GUEST_TYPE,
  OCCUPATION,
  OWNER_TYPE,
  PRICE_TYPE,
  PROPERTY_TYPE,
  STATUS,
} from './property.constant';

export type TOwnerType = keyof typeof OWNER_TYPE;
export type TCategory = keyof typeof CATEGORY;
export type TPriceType = keyof typeof PRICE_TYPE;
export type TDecorationType = keyof typeof DECORATION_TYPE;
export type TPropertyType = keyof typeof PROPERTY_TYPE;
export type TAllowedGender = keyof typeof ALLOWED_GENDER;
export type TGuestType = keyof typeof GUEST_TYPE;
export type TOccupation = keyof typeof OCCUPATION;
export type TStatus = keyof typeof STATUS;

export interface IProperty {
  createdBy: ObjectId;
  ownerType: TOwnerType;
  proofOfOwnership: string[];
  ownerNumber: string;
  propertyTitle: string;
  propertyImages: string[];
  propertyVideo: string;
  address: string;
  category: TCategory;
  price: string;
  priceType: TPriceType;
  propertyDetails: string;
  size: string;
  decorationType: TDecorationType;
  flore: string;
  propertyType: TPropertyType;
  bedType: string;
  bedrooms: number;
  bathroooms: number;
  balcony: number;
  kitchen: number;
  dining: number;
  drawing: number;
  moveOn: Date;
  unavailableDay: Date;
  allowedGender: TAllowedGender;
  guestType: TGuestType;
  occupation: TOccupation;
  facilities: string[];
  status: TStatus;
  isApproved: boolean;
  isBooked: boolean;
}
