import { ObjectId } from 'mongoose';

export interface IStory {
  createdBy: ObjectId; // Reference to the User
  title: string;
  storyImage: string;
}
