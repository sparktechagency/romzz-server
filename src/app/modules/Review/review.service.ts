import { JwtPayload } from 'jsonwebtoken';
import { IReview } from './review.interface';
import { Review } from './review.model';

const createReviewIntoDB = async (user: JwtPayload, payload: IReview) => {
  // Prepare the review payload with additional fields
  const reviewPayload: IReview = {
    ...payload,
    userId: user?._id, // Set the userId field from the JWT payload
  };

  const result = await Review.create(reviewPayload);
  return result;
};

const getReviewsFromDB = async () => {
  const result = await Review.find().populate('userId');
  return result;
};

export const ReviewServices = {
  createReviewIntoDB,
  getReviewsFromDB,
};
