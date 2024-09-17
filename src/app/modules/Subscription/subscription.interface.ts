import { ObjectId } from 'mongoose';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

export type TSubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

export interface ISubscription {
  userId: ObjectId;
  customerId: string;
  packageId: ObjectId;
  amountPaid: number;
  trxId: string;
  status: TSubscriptionStatus;
}
