export interface IPricingPlan {
  title: string;
  price: number;
  limitation: number | 'infinity';
  highlight: number;
  duration: string;
  productId?: string;
  description: string;
  billingCycle: 'monthly' | 'yearly';
  paymentLink: string;
}
