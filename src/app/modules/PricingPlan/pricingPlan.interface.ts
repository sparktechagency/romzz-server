import { ObjectId } from 'mongoose';

export interface IPricingPlan {
  createdBy: ObjectId;
  title: string;
  price: number;
  features: string[];
  billingCycle: 'monthly' | 'yearly';
}
