export interface IPricingPlan {
  title: string;
  price: number;
  priceId: string;
  limitation: number | 'infinity';
  highlight: number;
  duration: string;
  productId?: string;
  paymentLink?: string;
  billingCycle: 'monthly' | 'yearly';
  subscriptionLink: string;
}
