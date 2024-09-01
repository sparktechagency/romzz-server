import { ObjectId } from 'mongoose';

export interface INotification {
  userId: ObjectId;
  message: string;
  url: string;
  isSeen: boolean;
  isRead: boolean;
}
