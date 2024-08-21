import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import config from '../../config';
import { User } from '../User/user.model';
import { createJwtToken, verifyJwtToken } from '../../helpers/jwtHelpers';
import { JwtPayload } from 'jsonwebtoken';
import generateOtp from '../../helpers/generateOtp';
import path from 'path';
import { sendEmail } from '../../helpers/emailHelpers';
import ejs from 'ejs';

const verifyEmailAddressOtpIntoDB = async (payload: {
  email: string;
  otp: number;
}) => {
  await User.verifyOtp(payload?.email, payload?.otp);
};

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email as string);

  if (!existingUser) {
    // If no user is found with the given email, throw a NOT_FOUND error
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Check if the user is blocked
  if (existingUser?.isBlocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is blocked! Access is restricted.',
    );
  }

  // Check if the user is deleted
  if (existingUser?.isDeleted) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is deleted! Please contact support.',
    );
  }

  // Verify the provided password against the stored hashed password
  const isPasswordValid = await User.isPasswordMatched(
    payload?.password as string,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    // If the password does not match, throw a FORBIDDEN error
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

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
    config.jwtAccessExpiresIn as string,
  );

  return {
    accessToken,
  };
};

const changePasswordIntoDB = async (
  user: JwtPayload,
  payload: { currentPassword: string; newPassword: string },
) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(user?.email);

  // Verify the provided password against the stored hashed password
  const isPasswordValid = await User.isPasswordMatched(
    payload?.currentPassword,
    existingUser?.password,
  );

  if (!isPasswordValid) {
    // If the password does not match, throw a FORBIDDEN error
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid password provided!');
  }

  // Ensure the new password is different from the current password
  const isSamePassword = await User.isPasswordMatched(
    payload?.newPassword,
    existingUser?.password,
  );

  if (isSamePassword) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'The new password must be different from the current password!',
    );
  }

  // Hash the new password using bcrypt with the configured salt rounds
  const hashPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcryptSaltRounds),
  );

  // Prepare the data to be updated
  const updatedData = {
    password: hashPassword,
    passwordChangedAt: new Date(), // Update the password change timestamp
  };

  await User.findByIdAndUpdate(user?.userId, updatedData);
};

const forgetPasswordIntoDB = async (payload: { email: string }) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email);

  if (!existingUser) {
    // If no user is found with the given email, throw a NOT_FOUND error
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Check if the user is blocked
  if (existingUser?.isBlocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is blocked! Access is restricted.',
    );
  }

  // Check if the user is deleted
  if (existingUser?.isDeleted) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is deleted! Please contact support.',
    );
  }

  // Generate a one-time password (OTP) for email verification
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Define the path to the email verification template
  const forgetPasswordTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'forgetPasswordTemplate.ejs',
  );

  // Render the verify email template with provided payload data
  const forgetPasswordTemplate = await ejs.renderFile(
    forgetPasswordTemplatePath,
    {
      fullName: existingUser.fullName,
      otp,
    },
  );

  // Define the mail options for sending thank-you email to the user
  const emailOptions = {
    to: payload.email, // Receiver's email address (user's email)
    subject: 'Reset Your Password - Roomz', // Subject of the email
    html: forgetPasswordTemplate, // HTML content of the email
  };

  // Send the verification email to the user
  await sendEmail(emailOptions);

  await User.findOneAndUpdate(
    { email: payload?.email },
    { $set: { otp, otpExpiresAt } },
  );
};

const verifyResetPasswordOtpIntoDB = async (payload: {
  email: string;
  otp: number;
}) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email as string);

  if (!existingUser) {
    // If no user is found with the given email, throw a NOT_FOUND error
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

const resetPasswordIntoDB = async (
  token: string,
  payload: { userId: string; newPassword: string },
) => {
  if (!token) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  const decoded = verifyJwtToken(
    token,
    config.jwtAccessSecret as string,
  ) as JwtPayload;

  // checking if the user is exist
  const existingUser = await User.isUserExistsByEmail(decoded?.email);

  if (!existingUser) {
    // If no user is found with the given email, throw a NOT_FOUND error
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Check if the user is blocked
  if (existingUser?.isBlocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is blocked! Access is restricted.',
    );
  }

  // Check if the user is deleted
  if (existingUser?.isDeleted) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'User account is deleted! Please contact support.',
    );
  }

  if (payload?.userId !== decoded?.userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  // Ensure the new password is different from the current password
  const isSamePassword = await User.isPasswordMatched(
    payload?.newPassword,
    existingUser?.password,
  );

  if (isSamePassword) {
    throw new ApiError(
      httpStatus.NOT_ACCEPTABLE,
      'The new password must be different from the current password!',
    );
  }

  // Hash the new password using bcrypt with the configured salt rounds
  const hashPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcryptSaltRounds),
  );

  await User.findByIdAndUpdate(decoded?.userId, {
    password: hashPassword,
    passwordChangedAt: new Date(),
  });
};

export const AuthServices = {
  loginUserIntoDB,
  resetPasswordIntoDB,
  changePasswordIntoDB,
  forgetPasswordIntoDB,
  verifyEmailAddressOtpIntoDB,
  verifyResetPasswordOtpIntoDB,
};
