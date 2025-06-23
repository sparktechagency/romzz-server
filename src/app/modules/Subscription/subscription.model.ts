import { Schema, model } from 'mongoose';
import { ISubscription } from './subscription.interface';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    packageId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'PricingPlan', // Reference to the 'User' model
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    trxId: { type: String },
    currentPeriodStart: { type: String },
    currentPeriodEnd: { type: String },
    subscriptionId: { type: String },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt timestamps to the schema
);

// Create the 'Pricing Plan' model using the schema
export const Subscription = model<ISubscription>(
  'Subscription',
  subscriptionSchema,
);
