import httpStatus from 'http-status';
import { IUser } from './user.interface';
import ApiError from '../../errors/ApiError';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserSearchableFields } from './user.constant';
import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

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

  // Create the new user in the database
  const result = User.create(payload);
  return result;
};

const createAdminFromDB = async (payload: IUser) => {
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

  // Find the user by ID
  const result = await User.findById(user?._id);

  // Handle case where no user is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `User with ID: ${user?._id} not found!`,
    );
  }

  return result;
};

export const UserServices = {
  createUserIntoDB,
  createAdminFromDB,
  getUsersFromDB,
  getUserProfileFromDB,
};
