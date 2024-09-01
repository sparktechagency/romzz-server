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

const getUsersCount = catchAsync(async (req, res) => {
  const result = await UserServices?.getUsersCountFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Count of users retrieved successfully!',
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

const updateUserStatus = catchAsync(async (req, res) => {
  const result = await UserServices.updateUserStatusToDB(
    req?.params?.id,
    req?.body,
  );

  // Determine the appropriate message based on the user's status
  const statusMessage =
    req?.body?.action === 'block'
      ? result.role === 'admin'
        ? 'Admin user has been blocked successfully!'
        : 'User has been blocked successfully!'
      : result.role === 'admin'
        ? 'Admin user has been unblocked successfully!'
        : 'User has been unblocked successfully!';

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: statusMessage,
    data: null,
  });
});

export const UserControllers = {
  createUser,
  createAdmin,
  getUsers,
  getUsersCount,
  getUserCountByYear,
  getAdmins,
  getUserProfile,
  updateUserProfile,
  getUserFavouritesProperty,
  updateUserStatus,
};
