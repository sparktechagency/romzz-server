/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IFeedback } from './feedback.interface';
import { Feedback } from './feedback.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Property } from '../Property/property.model';
import { User } from '../User/user.model';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';
import mongoose from 'mongoose';

const createFeedbackToDB = async (
  user: JwtPayload,
  payload: IFeedback,
  file: any,
) => {
  const session = await mongoose.startSession();

  // Check if the property with the provided propertyId exists
  const existingProperty = await Property.findById(payload?.propertyId);

  // Handle case where no property is found
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${payload?.propertyId} not found!`,
    );
  }

  try {
    // Add userId from the JWT payload to the feedback
    payload.userId = user?.userId;
    payload.visibilityStatus = 'hide'; // Set default visibility status

    if (file && file?.path) {
      payload.image = getPathAfterUploads(file?.path); // If image file exists, set it
    }

    // Create the new feedback entry
    const feedback = await Feedback.create(payload);

    // Recalculate the average rating for the property owner (user who owns the property)
    const propertyOwnerId = existingProperty?.createdBy; // Assuming `createdBy` is the owner of the property

    // Find all feedbacks for this user's properties
    const userProperties = await Property.find({
      createdBy: propertyOwnerId,
    });

    const propertyIds = userProperties?.map((property) => property?._id);

    const feedbacks = await Feedback.find({
      propertyId: { $in: propertyIds },
    });

    // Calculate the average rating
    const userRatings = feedbacks?.map((feedback) => feedback?.rating);
    const averageRating =
      userRatings?.length > 0
        ? (
            userRatings?.reduce((sum, rating) => sum + rating, 0) /
            userRatings?.length
          ).toFixed(1)
        : 0;

    // Update the user's rating
    await User.findByIdAndUpdate(propertyOwnerId, {
      rating: averageRating,
    });

    return feedback;
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    await session.endSession();

    // Re-throw the error to be handled by the caller
    throw error;
  }
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

const getUserProfileFeedbacksFromDB = async (userId: string) => {
  // Find properties posted by the user
  const properties = await Property.find({ createdBy: userId });

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

const updateFeedbackVisibilityStatusToDB = async (
  feedbackId: string,
  payload: { visibilityStatus: 'show' | 'hide' },
) => {
  // Validate visibility status
  if (
    payload?.visibilityStatus !== 'show' &&
    payload?.visibilityStatus !== 'hide'
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid visibility status! Must be 'show' or 'hide'.`,
    );
  }

  // Update the Feedback status
  const result = await Feedback.findByIdAndUpdate(feedbackId, {
    visibilityStatus: payload?.visibilityStatus,
  });

  // Handle case where no Feedback is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Feedback with ID: ${feedbackId} not found!`,
    );
  }
};

export const FeedbackServices = {
  createFeedbackToDB,
  getAllFeedbacksFromDB,
  getVisibleFeedbacksFromDB,
  updateFeedbackVisibilityStatusToDB,
  getUserProfileFeedbacksFromDB,
};
