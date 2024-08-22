import { Schema, model } from 'mongoose';
import { IFeedback } from './feedback.interface';

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    feedbackMessage: {
      type: String,
      required: true,
    },
    feedbackImage: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum value for rating is 1
      max: 5, // Maximum value for rating is 5
    },
    facilities: {
      type: [String],
      required: true,
    },
    visibilityStatus: {
      type: String,
      enum: ['show', 'hide'],
      default: 'hide',
    },
  },
  { timestamps: true },
);

// Method to remove sensitive fields before returning user object as JSON
feedbackSchema.methods.toJSON = function () {
  const feedbackObject = this.toObject();

  delete feedbackObject?.visibilityStatus;
  return feedbackObject;
};

// Create the Feedback model using the schema
export const Feedback = model<IFeedback>('Feedback', feedbackSchema);
