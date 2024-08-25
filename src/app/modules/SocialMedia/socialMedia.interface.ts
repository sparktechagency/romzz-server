import { ObjectId } from 'mongoose';

export interface ISocialMedia {
  createdBy: ObjectId; // Reference to the User
  name: string;
  url: string;
}
