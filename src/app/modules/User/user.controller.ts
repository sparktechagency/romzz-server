import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserIntoDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Your account has been successfully created!',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminIntoDB(req?.body);

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

const updateUserProfile = catchAsync(async (req, res) => {
  const result = await UserServices?.updateUserProfileIntoDB(
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

export const UserControllers = {
  createUser,
  createAdmin,
  getUsers,
  getAdmins,
  getUserProfile,
  updateUserProfile,
};
