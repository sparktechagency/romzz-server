import { Schema, model } from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'Chat', // Reference to the 'Chat' model
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Message model using the schema
export const Message = model<IMessage>('Message', messageSchema);
