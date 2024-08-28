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

const getVerifiedUsersCount = catchAsync(async (req, res) => {
  const result = await UserServices?.getVerifiedUsersCountFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Count of verified users retrieved successfully!',
    data: result,
  });
});

const getUserCountByYear = catchAsync(async (req, res) => {
  const result = await UserServices?.getUserCountByYearFromDB(
    Number(req?.params?.year),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Monthly user counts for ${req?.params?.year} retrieved successfully!`,
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

const getUserFavouritesProperty = catchAsync(async (req, res) => {
  const result = await UserServices?.getUserFavouritesPropertyFromDB(req?.user);

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
  getVerifiedUsersCount,
  getUserCountByYear,
  getAdmins,
  getUserProfile,
  updateUserProfile,
  getUserFavouritesProperty,
};
