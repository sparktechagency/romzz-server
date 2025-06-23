import { ObjectId } from 'mongoose';
import { SUBSCRIPTION_STATUS } from './subscription.constant';

export type TSubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;

export interface ISubscription {
  _id: ObjectId;
  userId: ObjectId;
  customerId: string;
  packageId: ObjectId;
  amountPaid: number;
  trxId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  subscriptionId: string;
  status: TSubscriptionStatus;
  createdAt: Date;
}
