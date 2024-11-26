import { ObjectId } from 'mongoose';

export interface INotification {
  userId?: ObjectId;
  message: string;
  url: string;
  type?: string;
  isSeen: boolean;
  isRead: boolean;
}
