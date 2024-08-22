import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { FeedbackServices } from './feedback.service';

const createFeedback = catchAsync(async (req, res) => {
  const result = await FeedbackServices.createFeedbackIntoDB(
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

const updateFeedbackStatusToShow = catchAsync(async (req, res) => {
  const result = await FeedbackServices.updateFeedbackStatusToShowFromDB(
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
  const result = await FeedbackServices.updateFeedbackStatusToHideFromDB(
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
};
