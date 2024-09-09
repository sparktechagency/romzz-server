import { ObjectId } from 'mongoose';

export interface IMessage {
  chatId: ObjectId; // Reference to the Chat
  sender: ObjectId; // Reference to the User
  content: string;
  attachments?: string[];
}
