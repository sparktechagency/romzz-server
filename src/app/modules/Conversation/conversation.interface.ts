import { ObjectId } from 'mongoose';

export interface IConversation {
  createdBy: ObjectId;
  participants: ObjectId[];
  lastMessage: ObjectId; // Reference to the User
}
