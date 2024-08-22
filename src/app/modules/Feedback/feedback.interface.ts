import { ObjectId } from 'mongoose';

export interface IFeedback {
  userId: ObjectId; // Reference to the User
  feedbackMessage: string;
  feedbackImage: string;
  rating: number;
  facilities: string[];
  visibilityStatus: 'show' | 'hide';
}
