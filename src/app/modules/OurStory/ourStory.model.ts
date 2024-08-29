import { Schema, model } from 'mongoose';
import { IOurStory } from './ourStory.interface';

const ourStorySchema = new Schema<IOurStory>(
  {
    createdBy: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    storyContent: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt timestamps to the schema
);

// Create the 'Our Story' model using the schema
export const OurStory = model<IOurStory>('OurStory', ourStorySchema);
