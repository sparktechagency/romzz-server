import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: null,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

// Create the Notification model using the schema
export const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);
