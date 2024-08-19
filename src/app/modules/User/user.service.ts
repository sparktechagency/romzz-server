import httpStatus from 'http-status';
import { IUser } from './user.interface';
import ApiError from '../../errors/ApiError';
import { User } from './user.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserSearchableFields } from './user.constant';

const createUserFromDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    // If user already exists, throw a CONFLICT ApiError
    throw new ApiError(httpStatus.CONFLICT, 'User already exists!');
  }

  // Create userPayload with default values for certain fields
  const userPayload: IUser = {
    ...payload,
    role: 'user', // Set default role
    status: 'in-progress', // Set default status
    isBlocked: false, // Set default blocked status
    isDeleted: false, // Set default deleted status
  };

  // If user does not exist, create the new user
  const result = User.create(userPayload);
  return result;
};

const createAdminFromDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    // If user already exists, throw a CONFLICT ApiError
    throw new ApiError(httpStatus.CONFLICT, 'User already exists!');
  }

  // Create userPayload with default values for certain fields
  const userPayload: IUser = {
    ...payload,
    role: 'admin', // Set default role
    status: 'in-progress', // Set default status
    isBlocked: false, // Set default blocked status
    isDeleted: false, // Set default deleted status
  };

  // If user does not exist, create the new user
  const result = User.create(userPayload);
  return result;
};

const getUsersFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(User.find(), query)
    .search(UserSearchableFields)
    .sort()
    .paginate()
    .fields();

  // Execute the query to get the results
  const result = await usersQuery?.modelQuery;
  return result;
};

export const UserServices = {
  createUserFromDB,
  createAdminFromDB,
  getUsersFromDB,
};
