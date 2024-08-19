import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { TestimonialServices } from './testimonial.service';

const createTestimonial = catchAsync(async (req, res) => {
  const result = await TestimonialServices.createTestimonialIntoDB(
    req?.user,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Testimonial created successfully!',
    data: result,
  });
});

const getTestimonials = catchAsync(async (req, res) => {
  const result = await TestimonialServices.getTestimonialsFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Testimonials retrieved successfully!',
    data: result,
  });
});

const getTestimonialById = catchAsync(async (req, res) => {
  const result = await TestimonialServices.getTestimonialByIdFromDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Testimonial retrieved successfully!',
    data: result,
  });
});

const updateTestimonialStatusById = catchAsync(async (req, res) => {
  const result = await TestimonialServices.updateTestimonialStatusByIdFromDB(
    req?.params?.id,
    req?.body?.status,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Testimonial status updated successfully!',
    data: result,
  });
});

export const TestimonialControllers = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonialStatusById,
};
