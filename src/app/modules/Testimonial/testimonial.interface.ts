import { ObjectId } from 'mongoose';

export interface ITestimonial {
  userId: ObjectId; // Reference to the User
  testimonial: string;
  rating: number;
  status: 'show' | 'hide';
}
