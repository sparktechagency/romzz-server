import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { PropertyServices } from './property.service';

const createProperty = catchAsync(async (req, res) => {
  const result = await PropertyServices.createPropertyIntoDB(
    req?.user,
    req?.files,
    req?.body,
  );

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Property created successfully!',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req, res) => {
  const result = await PropertyServices.getAllPropertiesFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties retrieved successfully!',
    data: result,
  });
});

const getApprovedProperties = catchAsync(async (req, res) => {
  const result = await PropertyServices.getApprovedPropertiesFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties retrieved successfully!',
    data: result,
  });
});

export const PropertyControllers = {
  createProperty,
  getAllProperties,
  getApprovedProperties,
};
