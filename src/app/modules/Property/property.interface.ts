import { ObjectId } from 'mongoose';
import {
  ALLOWED_GENDER,
  BED_TYPE,
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
export type TBedType = keyof typeof BED_TYPE;
export type TAllowedGender = keyof typeof ALLOWED_GENDER;
export type TGuestType = keyof typeof GUEST_TYPE;
export type TOccupation = keyof typeof OCCUPATION;
export type TStatus = keyof typeof STATUS;

interface ILocation {
  address: string;
  latitude: string;
  longitude: string;
}

export interface IProperty {
  _id: ObjectId;
  createdBy: ObjectId;
  ownerType: TOwnerType;
  ownershipImages: string[];
  ownerNumber: string;
  title: string;
  propertyImages: string[];
  propertyVideo: string;
  location: ILocation;
  category: TCategory;
  price: number;
  priceType: TPriceType;
  description: string;
  size: string;
  decorationType: TDecorationType;
  flore: number;
  propertyType: TPropertyType;
  bedType: TBedType;
  bedrooms: number;
  bathrooms: number;
  balcony: number;
  kitchen: number;
  dining: number;
  drawing: number;
  moveOn: Date;
  unavailableDay: Date[];
  allowedGender: TAllowedGender;
  guestType: TGuestType;
  occupation: TOccupation;
  facilities: ObjectId[];
  status: TStatus;
  isApproved: boolean;
  isBooked: boolean;
  isHighlighted: boolean;
}
