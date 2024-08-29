import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import bcrypt from 'bcrypt';
import config from '../../config';
import { User } from '../User/user.model';
import { createJwtToken, verifyJwtToken } from '../../helpers/tokenUtils';
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { sendEmail } from '../../helpers/emailService';
import ejs from 'ejs';
import generateOtp from '../../helpers/generateOtp';

const verifyOtpToDB = async (payload: {
  email: string;
  otp: number;
  verificationType: 'emailVerification' | 'passwordReset';
}) => {
  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(payload?.email);

  // Handle case where the user does not exist
  if (!existingUser && payload?.verificationType === 'passwordReset') {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User with this email does not exist!',
    );
  }

  // Verify the OTP
  await User.verifyOtp(payload?.email, payload?.otp);

  // If verification type is password reset, generate an access token
  if (payload?.verificationType === 'passwordReset') {
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
  }
};

const resendVerificationEmailToDB = async (payload: { email: string }) => {
  // Find the user by ID
  const existingUser = await User.isUserExistsByEmail(payload?.email);

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
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

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
    subject: 'Verify Your Email Address - Romzz',
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

  if (existingUser?.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
  }

  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted.');
  }

  // Generate OTP for password reset and set its expiration
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

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
    subject: 'Reset Your Password - Romzz',
    html: forgetPasswordTemplate, // HTML content of the email
  };

  // Send password reset email to user
  await sendEmail(emailOptions);

  // Save OTP and expiration time to user document
  await User.findByIdAndUpdate(existingUser?._id, {
    $set: { otp, otpExpiresAt },
  });
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

const issueNewAccessToken = async (token: string) => {
  // Check if the token is provided
  if (!token) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Token is required!');
  }

  // checking if the given token is valid
  const decoded = verifyJwtToken(token, config.jwtRefreshSecret as string);

  // Check if a user with the provided email exists in the database
  const existingUser = await User.isUserExistsByEmail(decoded?.email);

  // Handle case where no User is found
  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User with ID: ${decoded?.userId} not found!`,
    );
  }

  // If the user is blocked, throw a FORBIDDEN error.
  if (existingUser?.isBlocked) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is blocked!');
  }

  // If the user is deleted, throw a FORBIDDEN error.
  if (existingUser?.isDeleted) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User account is deleted!');
  }

  if (
    existingUser.passwordChangedAt &&
    (await User.isJWTIssuedBeforePasswordChanged(
      existingUser?.passwordChangedAt,
      decoded?.iat as number,
    ))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

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

  return {
    accessToken,
  };
};

export const AuthServices = {
  verifyOtpToDB,
  resendVerificationEmailToDB,
  loginUserToDB,
  changePasswordToDB,
  resetPasswordToDB,
  requestPasswordResetToDB,
  issueNewAccessToken,
};
