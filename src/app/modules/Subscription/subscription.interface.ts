import { ObjectId } from 'mongoose';

export interface ISubscription {
  userId: ObjectId;
  customerId: string;
  priceId: string;
  packageId: ObjectId;
}
