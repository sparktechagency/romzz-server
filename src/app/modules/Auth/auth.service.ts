import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import config from '../../config';
import { User } from '../User/user.model';
import { createJwtToken, verifyJwtToken } from '../../helpers/jwtUtils';
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { sendEmail } from '../../helpers/emailService';
import ejs from 'ejs';
import generateRandomNumber from '../../helpers/generateRandomNumber';

const verifyEmailAddressOtpToDB = async (payload: {
  userId: string;
  otp: number;
}) => {
  // Verify the OTP for the given user ID
  await User.verifyOtp(payload?.userId, payload?.otp);
};

const resendVerificationEmailToDB = async (payload: { userId: string }) => {
  // Find the user by ID
  const existingUser = await User.findById(payload?.userId);

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  if (existingUser?.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is already verified!');
  }

  // Generate new OTP and set its expiration time
  const otp = generateRandomNumber();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Load the email verification template and render it with user-specific data
  const verifyEmailTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'verifyEmailTemplate.ejs',
  );

  const verifyEmailTemplate = await ejs.renderFile(verifyEmailTemplatePath, {
    fullName: existingUser?.fullName,
    otp,
  });

  const emailOptions = {
    to: existingUser?.email, // Receiver's email address
    subject: 'Verify Your Email Address - Roomz',
    html: verifyEmailTemplate, // HTML content of the email
  };

  // Send verification email to user
  await sendEmail(emailOptions);

  // Save OTP and expiration time to user document
  await User.findByIdAndUpdate(existingUser?._id, {
    $set: { otp, otpExpiresAt },
  });
};

const loginUserToDB = async (payload: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  // Check if the user exists with the given email
  const existingUser = await User.isUserExistsByEmail(payload?.email as string);

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Check if the user's account is verified, active, and not deleted
  if (!existingUser?.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is not verified!');
  }

  if (existingUser?.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
  }

  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted.');
  }

  // Verify the provided password
  const isPasswordValid = await User.isPasswordMatched(
    payload?.password as string,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

  // Generate JWT token for user authentication
  const jwtPayload = {
    userId: existingUser?._id,
    email: existingUser?.email,
    role: existingUser?.role,
  };

  const accessToken = createJwtToken(
    jwtPayload,
    config.jwtAccessSecret as string,
    config.jwtAccessExpiresIn as string,
  );

  const refreshToken = createJwtToken(
    jwtPayload,
    config.jwtRefreshSecret as string,
    config.jwtRefreshExpiresIn as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePasswordToDB = async (
  user: JwtPayload,
  payload: { currentPassword: string; newPassword: string },
) => {
  // Verify user's current password
  const existingUser = await User.isUserExistsByEmail(user?.email);

  const isPasswordValid = await User.isPasswordMatched(
    payload?.currentPassword,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

  // Check if the new password is different from the current one
  const isSamePassword = await User.isPasswordMatched(
    payload?.newPassword,
    existingUser?.password,
  );

  if (isSamePassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'New password must differ from the current one!',
    );
  }

  // Hash the new password before saving
  const hashPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcryptSaltRounds),
  );

  const updatedData = {
    password: hashPassword,
    passwordChangedAt: new Date(), // Update the password change timestamp
  };

  // Update user with new password
  await User.findByIdAndUpdate(user?.userId, updatedData);
};

const requestPasswordResetToDB = async (payload: { email: string }) => {
  // Check if user exists and is eligible for password reset
  const existingUser = await User.isUserExistsByEmail(payload?.email);

  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  if (!existingUser?.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is not verified!');
  }

  if (existingUser?.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
  }

  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted.');
  }

  // Generate OTP for password reset and set its expiration
  const otp = generateRandomNumber();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Load the password reset email template and render it with user-specific data
  const forgetPasswordTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'forgetPasswordTemplate.ejs',
  );

  const forgetPasswordTemplate = await ejs.renderFile(
    forgetPasswordTemplatePath,
    {
      fullName: existingUser?.fullName,
      otp,
    },
  );

  const emailOptions = {
    to: payload?.email,
    subject: 'Reset Your Password - Roomz',
    html: forgetPasswordTemplate, // HTML content of the email
  };

  // Send password reset email to user
  await sendEmail(emailOptions);

  // Save OTP and expiration time to user document
  await User.findByIdAndUpdate(existingUser?._id, {
    $set: { otp, otpExpiresAt },
  });
};

const resendPasswordResetEmailToDB = async (payload: { email: string }) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email);

  // If no user is found with the given email, throw a NOT_FOUND error
  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // If the user is not verified, throw a FORBIDDEN error
  if (!existingUser?.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is not verified!');
  }

  // If the user is blocked, throw a FORBIDDEN error.
  if (existingUser?.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
  }

  // If the user is deleted, throw a FORBIDDEN error.
  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted!');
  }

  // Generate a one-time password (OTP) for email verification
  const otp = generateRandomNumber();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Define the path to the email template for password reset.
  const forgetPasswordTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'forgetPasswordTemplate.ejs',
  );

  // Render the email template with the OTP and user details.
  const forgetPasswordTemplate = await ejs.renderFile(
    forgetPasswordTemplatePath,
    {
      fullName: existingUser?.fullName,
      otp,
    },
  );

  // Define the mail options for sending the OTP email.
  const emailOptions = {
    to: existingUser?.email,
    subject: 'Reset Your Password - Roomz',
    html: forgetPasswordTemplate, // HTML content of the email
  };

  // Send the OTP email to the user.
  await sendEmail(emailOptions);

  await User.findByIdAndUpdate(existingUser?._id, {
    $set: { otp, otpExpiresAt },
  });
};

const verifyResetPasswordOtpToDB = async (payload: {
  email: string;
  otp: number;
}) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email as string);

  // If no user is found with the given email, throw a NOT_FOUND error
  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  await User.verifyOtp(payload?.email, payload?.otp);

  // Prepare the payload for JWT token generation
  const jwtPayload = {
    userId: existingUser?._id,
    email: existingUser?.email,
    role: existingUser?.role,
  };

  // Generate a JWT access token for the authenticated user
  const accessToken = createJwtToken(
    jwtPayload,
    config.jwtAccessSecret as string,
    '10m',
  );

  return {
    accessToken,
  };
};

const resetPasswordToDB = async (
  token: string,
  payload: { newPassword: string },
) => {
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const decoded = verifyJwtToken(
    token,
    config.jwtAccessSecret as string,
  ) as JwtPayload;

  // checking if the user is exist
  const existingUser = await User.isUserExistsByEmail(decoded?.email);

  // If no user is found with the given email, throw a NOT_FOUND error
  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  if (!existingUser?.isVerified) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is not verified!');
  }

  if (existingUser?.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
  }

  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted.');
  }

  // Ensure the new password is different from the current password
  const isSamePassword = await User.isPasswordMatched(
    payload?.newPassword,
    existingUser?.password,
  );

  if (isSamePassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'New password must differ from the current one!',
    );
  }

  // Hash the new password using bcrypt with the configured salt rounds
  const hashPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcryptSaltRounds),
  );

  await User.findByIdAndUpdate(existingUser?._id, {
    password: hashPassword,
    passwordChangedAt: new Date(),
  });
};

export const AuthServices = {
  loginUserToDB,
  resetPasswordToDB,
  changePasswordToDB,
  requestPasswordResetToDB,
  verifyEmailAddressOtpToDB,
  verifyResetPasswordOtpToDB,
  resendPasswordResetEmailToDB,
  resendVerificationEmailToDB,
};
