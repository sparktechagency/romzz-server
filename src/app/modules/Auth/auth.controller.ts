import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { AuthServices } from './auth.service';

const verifyEmailAddress = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyEmailAddressOtpToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Email address verified successfully!',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful! Welcome back.',
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePasswordToDB(req?.user, req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password has been updated successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgetPasswordToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password reset instructions sent successfully!',
    data: result,
  });
});

const verifyResetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyResetPasswordOtpToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'OTP verified successfully for password reset!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPasswordToDB(
    req?.headers?.authorization as string,
    req?.body,
  );

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password reset successfully completed!',
    data: result,
  });
});

export const AuthControllers = {
  loginUser,
  forgetPassword,
  resetPassword,
  changePassword,
  verifyEmailAddress,
  verifyResetPassword,
};
