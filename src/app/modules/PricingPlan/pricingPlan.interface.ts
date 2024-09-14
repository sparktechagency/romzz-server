import { ObjectId } from 'mongoose';

export interface IPricingPlan {
  createdBy: ObjectId;
  title: string;
  price: number;
  priceId: string;
  features: string[];
  billingCycle: 'monthly' | 'yearly';
  subscriptionLink: string;
}
