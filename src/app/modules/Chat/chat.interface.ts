import { ObjectId } from 'mongoose';

export interface IChat {
  lastMessage: ObjectId; // Reference to the User
  participants: ObjectId[];
}
