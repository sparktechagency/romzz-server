import { ObjectId } from 'mongoose';

export interface IReview {
  userId: ObjectId; // Reference to the User
  review: string;
}
