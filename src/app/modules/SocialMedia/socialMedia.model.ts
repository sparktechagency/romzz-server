import { Schema, model } from 'mongoose';
import { ISocialMedia } from './socialMedia.interface';

const socialMediaSchema = new Schema<ISocialMedia>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    mediaName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Social Media model using the schema
export const SocialMedia = model<ISocialMedia>(
  'SocialMedia',
  socialMediaSchema,
);
