import { ObjectId } from 'mongoose';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

export type TSubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

export interface ISubscription {
  userId: ObjectId;
  customerId: string;
  priceId: string;
  packageId: ObjectId;
  trxId: string;
  status: TSubscriptionStatus;
}
