import { JwtPayload } from 'jsonwebtoken';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { Types } from 'mongoose';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { ReviewSearchableFields } from './review.constant';

const createReviewIntoDB = async (user: JwtPayload, payload: IReview) => {
  // Prepare the review payload with additional fields
  const reviewPayload: IReview = {
    ...payload,
    userId: user?._id, // Set the userId field from the JWT payload
  };

  const result = await Review.create(reviewPayload);
  return result;
};

const getReviewsFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const reviewsQuery = new QueryBuilder(Review.find().populate('userId'), query)
    .search(ReviewSearchableFields) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await reviewsQuery.countTotal();
  // Execute the query to retrieve the reviews
  const result = await reviewsQuery.modelQuery;

  return { meta, result };
};

const getReviewByIdFromDB = async (reviewId: string) => {
  // Validate the format of the review ID
  if (!Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The provided review ID is invalid!',
    );
  }

  // Find the Review by ID and populate the userId field
  const result = await Review.findById(reviewId).populate('userId');

  // Handle the case where the review is not found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Review with ID: ${reviewId} not found!`,
    );
  }

  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
  getReviewsFromDB,
  getReviewByIdFromDB,
};
