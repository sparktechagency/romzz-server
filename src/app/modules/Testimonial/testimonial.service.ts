import { JwtPayload } from 'jsonwebtoken';
import { ITestimonial } from './testimonial.interface';
import { Testimonial } from './testimonial.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

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

const getTestimonialsFromDB = async () => {
  const result = await Testimonial.find().populate('userId');
  return result;
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
