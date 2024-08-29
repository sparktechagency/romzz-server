import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import config from '../../config';

const verifyOtp = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyOtpToDB(req?.body);

  // Determine the response message based on the requestType
  const message =
    req?.body?.requestType === 'passwordReset'
      ? 'OTP verified successfully for password reset!'
      : 'Email address verified successfully!';

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message,
    data: result,
  });
});

const resendVerificationEmail = catchAsync(async (req, res) => {
  const result = await AuthServices.resendVerificationEmailToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verification email sent successfully!',
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserToDB(req?.body);

  // Determine maxAge based on 'rememberMe' value
  const rememberMe = req?.body?.rememberMe;
  const maxAge = rememberMe ? 1000 * 60 * 60 * 24 * 30 : 0; // 30 days or session-only

  // Set refresh token cookie with the appropriate maxAge
  res.cookie('refreshToken', result?.refreshToken, {
    secure: config.nodeEnv !== 'development', // Ensure secure cookies in production
    httpOnly: true,
    sameSite: 'none',
    maxAge, // Set maxAge based on rememberMe option
  });

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful. Welcome back!',
    data: { accessToken: result?.accessToken },
  });
});

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePasswordToDB(req?.user, req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password updated successfully!',
    data: result,
  });
});

const requestPasswordReset = catchAsync(async (req, res) => {
  const result = await AuthServices.requestPasswordResetToDB(req?.body);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset instructions sent successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPasswordToDB(
    req?.headers?.authorization as string,
    req?.body,
  );

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password has been reset successfully!',
    data: result,
  });
});

const issueNewAccessToken = catchAsync(async (req, res) => {
  const result = await AuthServices.issueNewAccessToken(
    req?.cookies?.refreshToken,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

export const AuthControllers = {
  verifyOtp,
  resendVerificationEmail,
  loginUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  issueNewAccessToken,
};
