import { JwtPayload } from 'jsonwebtoken';
import { IFeedback } from './feedback.interface';
import { Feedback } from './feedback.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Property } from '../Property/property.model';
import { User } from '../User/user.model';

const createFeedbackToDB = async (user: JwtPayload, payload: IFeedback) => {
  // Check if the property with the provided propertyId exists
  const propertyExists = await Property.findById(payload.propertyId);

  // Handle case where no Feedback is found
  if (!propertyExists) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${payload?.propertyId} not found!`,
    );
  }

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

const getUserProfileFeedbacksFromDB = async (userId: string) => {
  // Find properties posted by the user
  const properties = await Property.find({ createdBy: userId });

  if (!properties) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No properties found for this user!',
    );
  }

  // Extract property IDs
  const propertyIds = properties?.map((property) => property?._id);

  // Find feedback for these properties and populate the property owner data
  const result = await Feedback.find({
    propertyId: { $in: propertyIds },
  }).populate({
    path: 'userId', // Populate the user who gave the feedback
    select: 'fullName avatar', // Adjust the fields to select the user's details
  });

  return result;
};

const getUserProfileFeedbackSummaryFromDB = async (userId: string) => {
  // Fetch user profile
  const user = await User.findById(userId).select(
    'fullName email avater coverImage address',
  ); // Adjust fields as necessary

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Find properties posted by the user
  const properties = await Property.find({ createdBy: userId });

  if (!properties) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No properties found for this user',
    );
  }

  // Extract property IDs
  const propertyIds = properties?.map((property) => property?._id);

  // Find feedback for these properties
  const feedbacks = await Feedback.find({
    propertyId: { $in: propertyIds },
  });

  // Calculate the average rating given by the user
  const userRatings = feedbacks?.map((feedback) => feedback?.rating);
  const averageRating =
    userRatings?.length > 0
      ? (
          userRatings?.reduce((sum, rating) => sum + rating, 0) /
          userRatings?.length
        ).toFixed(1)
      : null;

  // Return user profile and average rating
  return {
    user,
    averageRating,
  };
};

export const FeedbackServices = {
  createFeedbackToDB,
  getAllFeedbacksFromDB,
  getVisibleFeedbacksFromDB,
  updateFeedbackStatusToShowFromDB,
  updateFeedbackStatusToHideFromDB,
  getUserProfileFeedbacksFromDB,
  getUserProfileFeedbackSummaryFromDB,
};
