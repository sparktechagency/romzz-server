import { ObjectId } from 'mongoose';

export interface IFeedback {
  userId: ObjectId; // Reference to the User
  propertyId: ObjectId;
  feedback: string;
  image: string;
  rating: number;
  facilities: string[];
  visibilityStatus: 'show' | 'hide';
}
