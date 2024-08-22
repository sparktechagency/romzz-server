import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { StoryServices } from './story.service';

const createStory = catchAsync(async (req, res) => {
  const result = await StoryServices.createStoryIntoDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Story created successfully!',
    data: result,
  });
});

const getStories = catchAsync(async (req, res) => {
  const result = await StoryServices.getStoriesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stories retrieved successfully!',
    data: result,
  });
});

const updateStoryById = catchAsync(async (req, res) => {
  const result = await StoryServices.updateStoryByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Story updated successfully!',
    data: result,
  });
});

export const StoryControllers = {
  createStory,
  getStories,
  updateStoryById,
};
