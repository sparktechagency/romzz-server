import { ObjectId } from 'mongoose';

export interface IBlog {
  createdBy: ObjectId; // Reference to the User
  title: string;
  description: string;
  image: string;
}
