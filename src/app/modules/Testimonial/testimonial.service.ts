import { JwtPayload } from 'jsonwebtoken';
import { ITestimonial } from './testimonial.interface';
import { Testimonial } from './testimonial.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { ReviewSearchableFields } from '../Review/review.constant';

const createTestimonialIntoDB = async (
  user: JwtPayload,
  payload: ITestimonial,
) => {
  // Prepare the testimonial payload with additional fields
  const testimonialPayload: ITestimonial = {
    ...payload,
    status: 'hide', // Set default status for the testimonial
    userId: user?._id, // Set the userId field from the JWT payload
  };

  const result = await Testimonial.create(testimonialPayload);
  return result;
};

const getTestimonialsFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const reviewsQuery = new QueryBuilder(
    Testimonial.find().populate('userId'),
    query,
  )
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

const getTestimonialByIdFromDB = async (testimonialId: string) => {
  // Validate the ID format
  if (!Types.ObjectId.isValid(testimonialId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid testimonial ID format.',
    );
  }

  // Find the testimonial by ID and populate the userId field
  const result = await Testimonial.findById(testimonialId).populate('userId');

  // Handle case where no testimonial is found
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Testimonial not found.');
  }

  return result;
};

const updateTestimonialStatusByIdFromDB = async (
  testimonialId: string,
  status: 'show' | 'hide',
) => {
  // Validate the ID format
  if (!Types.ObjectId.isValid(testimonialId)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid testimonial ID format.',
    );
  }

  // Validate the status value
  if (status !== 'show' && status !== 'hide') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Invalid status value. Only "show" or "hide" are allowed.',
    );
  }

  // Update the testimonial with the provided status
  const result = await Testimonial.findByIdAndUpdate(
    testimonialId,
    { status },
    {
      new: true, // Return the updated document
    },
  ).populate('userId');

  // Handle case where no testimonial is found
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Testimonial not found.');
  }

  return result;
};

export const TestimonialServices = {
  createTestimonialIntoDB,
  getTestimonialsFromDB,
  getTestimonialByIdFromDB,
  updateTestimonialStatusByIdFromDB,
};
