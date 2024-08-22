import { JwtPayload } from 'jsonwebtoken';
import { IFeedback } from './feedback.interface';
import { Feedback } from './feedback.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';

const createFeedbackIntoDB = async (user: JwtPayload, payload: IFeedback) => {
  payload.userId = user?.userId; // Set the userId field from the JWT payload
  payload.visibilityStatus = 'hide'; // Set default status for the Feedback

  const result = await Feedback.create(payload);
  return result;
};

const getAllFeedbacksFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const reviewsQuery = new QueryBuilder(
    Feedback.find().populate({
      path: 'userId',
      select: 'fullName avatar',
    }),
    query,
  )
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await reviewsQuery.countTotal();
  // Execute the query to retrieve the reviews
  const result = await reviewsQuery.modelQuery;

  return { meta, result };
};

const getVisibleFeedbacksFromDB = async () => {
  // Build the query using QueryBuilder with the given query parameters
  const result = Feedback.find({ visibilityStatus: 'show' }).populate({
    path: 'userId',
    select: 'fullName avatar',
  });

  return result;
};

const updateFeedbackStatusToShowFromDB = async (feedbackId: string) => {
  // Update the Feedback status to 'show'
  const result = await Feedback.findByIdAndUpdate(
    feedbackId,
    { visibilityStatus: 'show' },
    { new: true }, // Return the updated document
  );

  // Handle case where no Feedback is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Feedback with ID: ${feedbackId} not found!`,
    );
  }

  return result;
};

const updateFeedbackStatusToHideFromDB = async (feedbackId: string) => {
  // Update the Feedback status to 'hide'
  const result = await Feedback.findByIdAndUpdate(
    feedbackId,
    { visibilityStatus: 'hide' },
    { new: true }, // Return the updated document
  );

  // Handle case where no Feedback is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Feedback with ID: ${feedbackId} not found!`,
    );
  }

  return result;
};

export const FeedbackServices = {
  createFeedbackIntoDB,
  getAllFeedbacksFromDB,
  getVisibleFeedbacksFromDB,
  updateFeedbackStatusToShowFromDB,
  updateFeedbackStatusToHideFromDB,
};
