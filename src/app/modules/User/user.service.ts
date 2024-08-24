/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import { IUser } from './user.interface';
import ApiError from '../../errors/ApiError';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { userFieldsToExclude, UserSearchableFields } from './user.constant';
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import cron from 'node-cron';
import generateRandomNumber from '../../helpers/generateRandomNumber';
import { sendEmail } from '../../helpers/emailHelpers';
import unlinkFile from '../../helpers/unlinkFile';

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
  const otp = generateRandomNumber();
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
  const otp = generateRandomNumber();
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
  const options = { includeRole: true };

  const result = await User.findById(user?.userId);

  // Ensure result is not null or undefined before calling toJSON
  if (result) {
    return result.toJSON(options);
  }

  return null;
};

const updateUserProfileIntoDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
  files: any,
) => {
  // Find the existing user to get the current avatar path
  const existingUser = await User.findById(user?.userId);

  // If a new avatar is uploaded, update the avatar path in the database
  if (files?.avatar && files?.avatar?.length > 0) {
    const newAvatarPath = files?.avatar[0]?.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency
    payload.avatar = newAvatarPath;

    // If the user already has an existing avatar (and it's not the default avatar), delete the old avatar file
    if (
      existingUser?.avatar &&
      existingUser?.avatar !== 'https://i.ibb.co/z5YHLV9/profile.png'
    ) {
      unlinkFile(existingUser?.avatar);
    }
  }

  // If a new cover image is uploaded, update the coverImage path in the database
  if (files?.coverImage && files?.coverImage?.length > 0) {
    const newCoverImagePath = files?.coverImage[0]?.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes for consistency
    payload.coverImage = newCoverImagePath;

    // If the user already has an existing avatar (and it's not the default avatar), delete the old avatar file
    if (
      existingUser?.coverImage &&
      existingUser?.coverImage !== 'https://i.ibb.co/z5YHLV9/profile.png'
    ) {
      unlinkFile(existingUser?.coverImage);
    }
  }

  // Filter out these fields from the payload
  userFieldsToExclude.forEach((field) => delete payload[field]);

  // Proceed with the update using the filtered data
  const result = await User.findByIdAndUpdate(user?.userId, payload, {
    new: true,
  });

  return result;
};

// Schedule the function to run every 12 hours
cron.schedule('0 */12 * * *', async () => {
  const now = new Date();

  try {
    // Delete users with expired OTPs, 'in-progress' status, and not verified
    const result = await User.deleteMany({
      otpExpiresAt: { $lt: now }, // Condition 1: OTP has expired
      status: 'in-progress', // Condition 2: User registration is in-progress
      isVerified: false, // Condition 3: User is not verified
    });

    console.log(result);
    if (result.deletedCount > 0) {
      console.log(
        `${result.deletedCount} expired unverified users were deleted.`,
      );
    } else {
      console.log('No expired unverified users found for deletion.');
    }
  } catch (error) {
    console.error('Error deleting expired users:', error);
  }
});

export const UserServices = {
  createUserIntoDB,
  createAdminIntoDB,
  getUsersFromDB,
  getUserProfileFromDB,
  updateUserProfileIntoDB,
};
