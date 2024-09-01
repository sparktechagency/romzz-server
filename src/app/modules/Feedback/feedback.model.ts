import { Schema, model } from 'mongoose';
import { IFeedback } from './feedback.interface';
import { nonEmptyArray, nonEmptyStrings } from '../../helpers/validators';

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'Property', // Reference to the 'Property' model
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum value for rating is 1
      max: 5, // Maximum value for rating is 5
    },
    facilities: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Facility',
        },
      ],
      required: true,
      validate: [
        {
          validator: nonEmptyArray,
          message: 'At least one facilities is required.',
        },
        {
          validator: nonEmptyStrings,
          message: 'Each facilities must be a non-empty string.',
        },
      ],
    },
    visibilityStatus: {
      type: String,
      enum: ['show', 'hide'],
      default: 'hide',
    },
  },
  { timestamps: true },
);

// Create the Feedback model using the schema
export const Feedback = model<IFeedback>('Feedback', feedbackSchema);
