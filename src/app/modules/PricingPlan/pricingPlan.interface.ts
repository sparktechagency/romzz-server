import { ObjectId } from 'mongoose';

export interface IPricingPlan {
  createdBy: ObjectId;
  title: string;
  price: number;
  priceId: string;
  features: string[];
  maxProperties: number | 'infinity';
  maxHighlightedProperties: number;
  billingCycle: 'monthly' | 'yearly';
  subscriptionLink: string;
}
