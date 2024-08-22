import { Schema, model } from 'mongoose';
import { IMedia } from './media.interface';

const mediaSchema = new Schema<IMedia>(
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

// Create the Media model using the schema
export const Media = model<IMedia>('Media', mediaSchema);
