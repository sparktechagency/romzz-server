import { Schema, model } from 'mongoose';
import { ISubscription } from './subscription.interface';

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    priceId: {
      type: String,
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'PricingPlan', // Reference to the 'User' model
      required: true,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt timestamps to the schema
);

// Create the 'Pricing Plan' model using the schema
export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema,
);
