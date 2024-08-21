import { Schema, model } from 'mongoose';
import { IProperty } from './property.interface';

const propertySchema = new Schema<IProperty>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    ownerType: {
      type: String,
      enum: ['own-property', 'others-property'],
      required: true,
    },
    proofOfOwnership: {
      type: [String], // Array of strings for ownership proof documents
      required: true,
    },
    ownerNumber: {
      type: String,
      required: true,
    },
    propertyTitle: {
      type: String,
      required: true,
    },
    propertyImages: {
      type: [String], // Array of strings for image URLs
      required: true,
    },
    propertyVideo: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['whole-unit', 'room-mate', 'flat-mate', 'house'],
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    priceType: {
      type: String,
      enum: ['day', 'week', 'month', 'year'],
      required: true,
    },
    propertyDetails: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    decorationType: {
      type: String,
      enum: ['furnished', 'unfurnished'],
      required: true,
    },
    flore: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['family-house', 'apartment', 'lodge', 'villa', 'cottage'],
      required: true,
    },
    bedType: {
      type: String,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathroooms: {
      type: Number,
      required: true,
    },
    balcony: {
      type: Number,
      required: true,
    },
    kitchen: {
      type: Number,
      required: true,
    },
    dining: {
      type: Number,
      required: true,
    },
    drawing: {
      type: Number,
      required: true,
    },
    moveOn: {
      type: Date,
    },
    unavailableDay: {
      type: Date,
    },
    allowedGender: {
      type: String,
      enum: ['all', 'male', 'female', 'others'],
    },
    guestType: {
      type: String,
      enum: ['all', 'single', 'couple', 'family'],
    },
    occupation: {
      type: String,
      enum: ['all', 'student', 'professional'],
    },
    facilities: {
      type: [String], // Array of strings for facilities
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Method to remove sensitive fields before returning property object as JSON
propertySchema.methods.toJSON = function () {
  const propertyObject = this.toObject();

  // Remove password and role fields from the user object
  delete propertyObject?.status;
  delete propertyObject?.isApproved;
  delete propertyObject?.isBooked;

  return propertyObject;
};

// Create the property model using the schema
export const Property = model<IProperty>('Property', propertySchema);
