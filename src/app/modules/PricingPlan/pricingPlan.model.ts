import { Schema, model } from 'mongoose';
import { IPricingPlan } from './pricingPlan.interface';

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    priceId: { type: String, required: true },
    duration: { type: String, required: true },
    limitation: { type: Schema.Types.Mixed, required: true },
    highlight: { type: Number, required: true },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    subscriptionLink: { type: String, required: true },
    productId: {type: String, required: true},
    paymentLink: {type: String, required: true}
  },
  { timestamps: true }
);

export const PricingPlan = model<IPricingPlan>('PricingPlan', PricingPlanSchema);