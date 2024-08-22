import { ObjectId } from 'mongoose';

export interface IMedia {
  createdBy: ObjectId; // Reference to the User
  mediaName: string;
  url: string;
}
