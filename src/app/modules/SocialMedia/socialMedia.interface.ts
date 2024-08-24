import { ObjectId } from 'mongoose';

export interface ISocialMedia {
  createdBy: ObjectId; // Reference to the User
  mediaName: string;
  url: string;
}
