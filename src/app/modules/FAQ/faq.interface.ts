import { ObjectId } from 'mongoose';

export interface IFaq {
  createdBy: ObjectId; // Reference to the User
  question: string;
  answer: string;
}
