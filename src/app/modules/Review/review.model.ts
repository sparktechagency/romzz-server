import { Schema, model } from 'mongoose';
import { IReview } from './review.interface';

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Review model using the schema
export const Review = model<IReview>('Review', reviewSchema);
