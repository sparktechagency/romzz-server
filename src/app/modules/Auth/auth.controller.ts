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

const resendVerificationEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.resendVerificationEmailToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Verification email sent successfully!',
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

const requestPasswordReset = catchAsync(async (req, res) => {
  const result = await AuthServices.requestPasswordResetToDB(req?.body);

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

const resendPasswordResetEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.resendPasswordResetEmailToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Password reset email sent successfully!',
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
  requestPasswordReset,
  resetPassword,
  changePassword,
  verifyEmailAddress,
  verifyResetPassword,
  resendVerificationEmail,
  resendPasswordResetEmail,
};
