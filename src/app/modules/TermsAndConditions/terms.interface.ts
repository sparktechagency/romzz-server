import { ObjectId } from 'mongoose';

export interface ITerms {
  createdBy: ObjectId; // Reference to the User
  termsContent: string;
}
