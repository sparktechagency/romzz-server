import { Schema, model } from 'mongoose';
import { IChat } from './chat.interface';

const chatSchema = new Schema<IChat>(
  {
    lastMessage: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'Message', // Reference to the 'Message' model
      required: true,
    },
    participants: {
      type: [Schema.Types.ObjectId], // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Chat model using the schema
export const Chat = model<IChat>('Chat', chatSchema);
