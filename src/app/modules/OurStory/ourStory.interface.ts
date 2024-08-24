import { ObjectId } from 'mongoose';

export interface IOurStory {
  createdBy: ObjectId; // Reference to the User
  title: string;
  image: string;
}
