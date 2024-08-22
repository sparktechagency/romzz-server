import { Schema, model } from 'mongoose';
import { ITerms } from './terms.interface';

const termsSchema = new Schema<ITerms>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    termsContent: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Terms model using the schema
export const Terms = model<ITerms>('Terms', termsSchema);
