import { JwtPayload } from 'jsonwebtoken';
import { IStory } from './story.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Story } from './story.model';

const createStoryIntoDB = async (user: JwtPayload, payload: IStory) => {
  // Check the total number of Storys in the database
  const storyCount = await Story.countDocuments();

  // Enforce the global limit of 1 Story
  if (storyCount >= 1) {
    throw new ApiError(httpStatus.CONFLICT, 'Story creation limit reached!');
  }

  payload.createdBy = user?.userId;

  const result = await Story.create(payload);
  return result;
};

const getStoriesFromDB = async () => {
  const result = await Story.find();

  return result;
};

const updateStoryByIdFromDB = async (
  storyId: string,
  payload: Partial<IStory>,
) => {
  // Update the Story with the provided status
  const result = await Story.findByIdAndUpdate(storyId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no Story is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Story with ID: ${storyId} not found!`,
    );
  }

  return result;
};

export const StoryServices = {
  createStoryIntoDB,
  getStoriesFromDB,
  updateStoryByIdFromDB,
};
