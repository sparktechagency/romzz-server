import { ObjectId } from 'mongoose';

export interface IChat {
  createdBy: ObjectId;
  lastMessage: ObjectId; // Reference to the User
}
