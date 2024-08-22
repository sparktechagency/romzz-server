import { Schema, model } from 'mongoose';
import { IStory } from './story.interface';

const storySchema = new Schema<IStory>(
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
    storyImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// Create the Story model using the schema
export const Story = model<IStory>('Story', storySchema);
