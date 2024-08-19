import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { UserServices } from './auth.service';

const verifyEmail = catchAsync(async (req, res) => {
  const result = await UserServices.createUserFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Thanks for registering!',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await UserServices.loginUserFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful! Welcome back.',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password reset request received!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

export const UserControllers = {
  verifyEmail,
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
};
