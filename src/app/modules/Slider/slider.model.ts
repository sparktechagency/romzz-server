import { Schema, model } from 'mongoose';
import { ISlider } from './slider.interface';

const sliderSchema = new Schema<ISlider>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Slider model using the schema
export const Slider = model<ISlider>('Slider', sliderSchema);
