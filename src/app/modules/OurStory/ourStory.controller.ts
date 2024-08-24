import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { OurStoryServices } from './ourStory.service';

const createOurStory = catchAsync(async (req, res) => {
  const result = await OurStoryServices.createOurStoryToDB(
    req?.user,
    req?.body,
    req?.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Our Story created successfully!',
    data: result,
  });
});

const getOurStories = catchAsync(async (req, res) => {
  const result = await OurStoryServices.getOurStoriesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Our Stories retrieved successfully!',
    data: result,
  });
});

const updateOurStoryById = catchAsync(async (req, res) => {
  const result = await OurStoryServices.updateOurStoryByIdFromDB(
    req?.params?.id,
    req?.body,
    req?.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Our Story updated successfully!',
    data: result,
  });
});

export const OurStoryControllers = {
  createOurStory,
  getOurStories,
  updateOurStoryById,
};
