import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PropertyServices } from './property.service';

const createProperty = catchAsync(async (req, res) => {
  const result = await PropertyServices.createPropertyToDB(
    req?.user,
    req?.body,
    req?.files,
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

const getPropertyById = catchAsync(async (req, res) => {
  const result = await PropertyServices.getPropertyByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property retrieved successfully!',
    data: result,
  });
});

const getPropertyByUserId = catchAsync(async (req, res) => {
  const result = await PropertyServices.getPropertyByUserIdFromDB(req?.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property retrieved successfully!',
    data: result,
  });
});

const updatePropertyById = catchAsync(async (req, res) => {
  const result = await PropertyServices.updatePropertyByIdToDB(
    req?.user,
    req?.params?.id,
    req?.files,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully!',
    data: result,
  });
});

const updatePropertyStatusToApprove = catchAsync(async (req, res) => {
  const result = await PropertyServices.updatePropertyStatusToApproveToDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property status updated successfully!',
    data: result,
  });
});

const updatePropertyStatusToReject = catchAsync(async (req, res) => {
  const result = await PropertyServices.updatePropertyStatusToRejectToDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property status updated successfully!',
    data: result,
  });
});

const togglePropertyFavouriteStatus = catchAsync(async (req, res) => {
  const result = await PropertyServices.togglePropertyFavouriteStatusToDB(
    req?.user,
    req?.params?.id,
  );

  // Set the message based on the favorite status
  const message = result.isFavourited
    ? 'Property has been added to your favorites.'
    : 'Property has been removed from your favorites.';

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message,
    data: null,
  });
});

export const PropertyControllers = {
  createProperty,
  getAllProperties,
  getApprovedProperties,
  getPropertyById,
  getPropertyByUserId,
  updatePropertyById,
  updatePropertyStatusToApprove,
  updatePropertyStatusToReject,
  togglePropertyFavouriteStatus,
};
