import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TermsServices } from './terms.service';

const createTerms = catchAsync(async (req, res) => {
  const result = await TermsServices.createTermsToDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Terms and conditions created successfully!',
    data: result,
  });
});

const getTerms = catchAsync(async (req, res) => {
  const result = await TermsServices.getTermsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terms and conditions retrieved successfully!',
    data: result,
  });
});

const updateTermsById = catchAsync(async (req, res) => {
  const result = await TermsServices.updateTermsByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Terms and conditions updated successfully!',
    data: result,
  });
});

export const TermsControllers = {
  createTerms,
  getTerms,
  updateTermsById,
};
