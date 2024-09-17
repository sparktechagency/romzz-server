import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Your account has been successfully created!',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Admin account created successfully!',
    data: result,
  });
});

const getUsers = catchAsync(async (req, res) => {
  const result = await UserServices?.getUsersFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users list retrieved successfully!',
    data: result,
  });
});

const getAdmins = catchAsync(async (req, res) => {
  const result = await UserServices?.getAdminsFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admins list retrieved successfully!',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const result = await UserServices?.getUserProfileFromDB(req?.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const getUserSubscriptions = catchAsync(async (req, res) => {
  const result = await UserServices.getUserSubscriptionsByIdFromDB(
    req?.user,
    req?.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User subscriptions retrieved successfully!',
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const result = await UserServices?.updateUserProfileToDB(
    req?.user,
    req?.body,
    req?.files,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile updated successfully!',
    data: result,
  });
});

const getUserProfileById = catchAsync(async (req, res) => {
  const result = await UserServices.getUserProfileByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const getPartialUserProfileById = catchAsync(async (req, res) => {
  const result = await UserServices.getPartialUserProfileByIdFromDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully!',
    data: result,
  });
});

const toggleUserStatus = catchAsync(async (req, res) => {
  const result = await UserServices.toggleUserStatusToDB(
    req?.params?.id,
    req?.body,
  );

  // Determine the appropriate message based on the user's status
  const message =
    result.role === 'ADMIN'
      ? `Admin user has been ${req?.body?.status === 'block' ? 'blocked' : 'unblocked'} successfully!`
      : `User has been ${req?.body?.status === 'block' ? 'blocked' : 'unblocked'} successfully!`;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message,
    data: null,
  });
});

const getUserProfileProgress = catchAsync(async (req, res) => {
  const progress = await UserServices.calculateUserProfileProgressFromDB(
    req?.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile progress retrieved successfully!',
    data: progress,
  });
});

const getUserFavouriteProperties = catchAsync(async (req, res) => {
  const result = await UserServices?.getUserFavouritePropertiesFromDB(
    req?.user,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User favorite properties retrived successfully!',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  createAdmin,
  getUsers,
  getAdmins,
  getUserProfile,
  getUserSubscriptions,
  updateUserProfile,
  getUserProfileById,
  getPartialUserProfileById,
  toggleUserStatus,
  getUserProfileProgress,
  getUserFavouriteProperties,
};
