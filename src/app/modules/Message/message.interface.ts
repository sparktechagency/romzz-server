import { ObjectId, Types } from 'mongoose';

export interface IMessage {
  conversationId: Types.ObjectId; // Reference to the Chat
  senderId: ObjectId; // Reference to the User
  content: string;
  attachments?: string[];
}
