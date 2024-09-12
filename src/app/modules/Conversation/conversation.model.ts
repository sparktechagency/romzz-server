import { Schema, model } from 'mongoose';
import { IConversation } from './conversation.interface';

const ConversationSchema = new Schema<IConversation>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    participants: {
      type: [Schema.Types.ObjectId], // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'Message', // Reference to the 'Message' model
      default: null,
    },
  },
  { timestamps: true },
);

// Create the Conversation model using the schema
export const Conversation = model<IConversation>(
  'Conversation',
  ConversationSchema,
);
