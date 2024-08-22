import { ObjectId } from 'mongoose';

export interface ISlider {
  createdBy: ObjectId; // Reference to the User
  title: string;
  sliderImage: string;
}
