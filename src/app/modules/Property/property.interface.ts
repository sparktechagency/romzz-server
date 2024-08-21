import { ObjectId } from 'mongoose';

export interface IProperty {
  createdBy: ObjectId;
  ownerType: 'own-property' | 'others-property';
  proofOfOwnership: string[];
  ownerNumber: string;
  propertyTitle: string;
  propertyImages: string[];
  propertyVideo: string;
  address: string;
  category: 'whole-unit' | 'room-mate' | 'flat-mate' | 'house';
  price: string;
  priceType: 'day' | 'week' | 'month' | 'year';
  propertyDetails: string;
  size: string;
  decorationType: 'furnished' | 'unfurnished';
  flore: string;
  propertyType: 'family-house' | 'apartment' | 'lodge' | 'villa' | 'cottage';
  bedType: string;
  bedrooms: number;
  bathroooms: number;
  balcony: number;
  kitchen: number;
  dining: number;
  drawing: number;
  moveOn: Date;
  unavailableDay: Date;
  allowedGender: 'all' | 'male' | 'female' | 'others';
  guestType: 'all' | 'single' | 'couple' | 'family';
  occupation: 'all' | 'student' | 'professional';
  facilities: string[];
  status: 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
}
