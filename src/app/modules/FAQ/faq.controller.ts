import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { FaqServices } from './faq.service';

const createFaq = catchAsync(async (req, res) => {
  const result = await FaqServices.createFaqToDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Faq created successfully!',
    data: result,
  });
});

const getFaqs = catchAsync(async (req, res) => {
  const result = await FaqServices.getFaqsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faqs retrieved successfully!',
    data: result,
  });
});

const updateFaqById = catchAsync(async (req, res) => {
  const result = await FaqServices.updateFaqByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Faq updated successfully!',
    data: result,
  });
});

export const FaqControllers = {
  createFaq,
  getFaqs,
  updateFaqById,
};
