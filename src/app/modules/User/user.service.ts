/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import { IUser } from './user.interface';
import ApiError from '../../errors/ApiError';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { keysToExclude, UserSearchableFields } from './user.constant';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { excludeKeys } from '../../helpers/objectHelpers';
import deleteFile from '../../helpers/deleteFile';
import path from 'path';
import ejs from 'ejs';
import generateOtp from '../../helpers/generateOtp';
import { sendEmail } from '../../helpers/test';

const createUserIntoDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    // If user already exists, throw a CONFLICT ApiError
    throw new ApiError(
      httpStatus.CONFLICT,
      'A user with this email already exists!',
    );
  }

  // Set default values for new users
  payload.role = 'user'; // Set the role to 'user'
  payload.status = 'in-progress'; // Set the status to 'in-progress'
  payload.isBlocked = false; // Set the blocked status to false
  payload.isDeleted = false; // Set the deleted status to false

  // Generate a one-time password (OTP) for email verification
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Add OTP and expiration time to the payload
  payload.otp = Number(otp); // Store OTP as a number
  payload.otpExpiresAt = otpExpiresAt;

  // Define the path to the email verification template
  const verifyEmailTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'verifyEmailTemplate.ejs',
  );

  // Render the verify email template with provided payload data
  const verifyEmailTemplate = await ejs.renderFile(verifyEmailTemplatePath, {
    fullName: payload.fullName,
    otp,
  });

  // Define the mail options for sending thank-you email to the user
  const emailOptions = {
    to: payload.email, // Receiver's email address (user's email)
    subject: 'Verify Your Email Address - Roomz', // Subject of the email
    html: verifyEmailTemplate, // HTML content of the email
  };

  // Send the verification email to the user
  await sendEmail(emailOptions);

  // Create the new user in the database
  const result = User.create(payload);
  return result;
};

const createAdminIntoDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    // If user already exists, throw a CONFLICT ApiError
    throw new ApiError(
      httpStatus.CONFLICT,
      'An admin with this email already exists.',
    );
  }

  // Set default values for new admins
  payload.role = 'admin'; // Set the role to 'admin'
  payload.status = 'in-progress'; // Set the status to 'in-progress'
  payload.isBlocked = false; // Set the blocked status to false
  payload.isDeleted = false; // Set the deleted status to false

  // Generate a one-time password (OTP) for email verification
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  // Add OTP and expiration time to the payload
  payload.otp = Number(otp); // Store OTP as a number
  payload.otpExpiresAt = otpExpiresAt;

  // Define the path to the email verification template
  const verifyEmailTemplatePath = path.join(
    process.cwd(),
    'src',
    'app',
    'templates',
    'verifyEmailTemplate.ejs',
  );

  // Render the verify email template with provided payload data
  const verifyEmailTemplate = await ejs.renderFile(verifyEmailTemplatePath, {
    fullName: payload.fullName,
    otp,
  });

  // Define the mail options for sending thank-you email to the user
  const emailOptions = {
    to: payload.email, // Receiver's email address (user's email)
    subject: 'Verify Your Email - Roomz', // Subject of the email
    html: verifyEmailTemplate, // HTML content of the email
  };

  // Send the verification email to the user
  await sendEmail(emailOptions);

  // Create the new admin in the database
  const result = User.create(payload);
  return result;
};

const getUsersFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(User.find(), query)
    .search(UserSearchableFields) // Apply search conditions based on searchable fields
    .sort() // Apply sorting based on the query parameter
    .paginate() // Apply pagination based on the query parameter
    .fields(); // Select specific fields to include/exclude in the result

  // Get the total count of matching documents and total pages for pagination
  const meta = await usersQuery.countTotal();
  // Execute the query to retrieve the users
  const result = await usersQuery.modelQuery;

  return { meta, result };
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  // Validate the ID format
  if (!Types.ObjectId.isValid(user?._id)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The provided user ID is invalid!',
    );
  }

  const result = await User.findById(user?._id);
  return result;
};

const updateUserProfileIntoDB = async (
  user: JwtPayload,
  file: any,
  payload: Partial<IUser>,
) => {
  // Validate the ID format
  if (!Types.ObjectId.isValid(user?._id)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The provided user ID is invalid!',
    );
  }

  // Find the existing user to get the current avatar path
  const existingUser = await User.findById(user._id);

  // Filter out fields that should not be updated
  const updatedData = excludeKeys(payload, keysToExclude);

  // If a new avatar is uploaded, update the avatar path in the database
  if (file && file.path) {
    updatedData.avatar = file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency

    // If the user already has an existing avatar (and it's not the default avatar), delete the old avatar file
    if (
      existingUser?.avatar &&
      existingUser?.avatar !== 'https://i.ibb.co/z5YHLV9/profile.png'
    ) {
      deleteFile(existingUser?.avatar);
    }
  }

  // If no valid fields are provided for update, throw an error
  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'No valid fields provided for update!',
    );
  }

  // Proceed with the update using the filtered data
  const result = await User.findByIdAndUpdate(user?._id, updatedData, {
    new: true,
  });

  return result;
};

export const UserServices = {
  createUserIntoDB,
  createAdminIntoDB,
  getUsersFromDB,
  getUserProfileFromDB,
  updateUserProfileIntoDB,
};
