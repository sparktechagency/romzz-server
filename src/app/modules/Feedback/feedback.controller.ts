import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeedbackServices } from './feedback.service';

const createFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackServices.createFeedbackToDB(
    req?.user,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Feedback created successfully!',
    data: result,
  });
});

const getAllFeedbacks = catchAsync(async (req, res) => {
  const result = await FeedbackServices.getAllFeedbacksFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedbacks retrieved successfully!',
    data: result,
  });
});

const getVisibleFeedbacks = catchAsync(async (req, res) => {
  const result = await FeedbackServices.getVisibleFeedbacksFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedbacks retrieved successfully!',
    data: result,
  });
});

const getUserProfileFeedbacks = catchAsync(async (req, res) => {
  const result = await FeedbackServices.getUserProfileFeedbacksFromDB(
    req?.params?.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile feedbacks retrived successfully!',
    data: result,
  });
});

const getUserProfileFeedbackSummary = catchAsync(async (req, res) => {
  const result = await FeedbackServices.getUserProfileFeedbackSummaryFromDB(
    req?.params?.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile feedback summary retrived successfully!',
    data: result,
  });
});

const updateFeedbackStatusToShow = catchAsync(async (req, res) => {
  const result = await FeedbackServices.updateFeedbackStatusToShowToDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback status updated successfully!',
    data: result,
  });
});

const updateFeedbackStatusToHide = catchAsync(async (req, res) => {
  const result = await FeedbackServices.updateFeedbackStatusToHideToDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback status updated successfully!',
    data: result,
  });
});

export const FeedbackControllers = {
  createFeedback,
  getAllFeedbacks,
  getVisibleFeedbacks,
  updateFeedbackStatusToShow,
  updateFeedbackStatusToHide,
  getUserProfileFeedbacks,
  getUserProfileFeedbackSummary,
};
