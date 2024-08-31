import { Schema, model } from 'mongoose';
import { IFacility } from './facility.interface';

const facilitySchema = new Schema<IFacility>(
  {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Facility model using the schema
export const Facility = model<IFacility>('Facility', facilitySchema);
