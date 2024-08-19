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

  payload.role = 'user'; // Set default role
  payload.status = 'in-progress'; // Set default status
  payload.isBlocked = false; // Set default blocked status
  payload.isDeleted = false; // Set default deleted status

  // If user does not exist, create the new user
  const result = User.create(payload);
  return result;
};

const createAdminFromDB = async (payload: IUser) => {
  // Check if a user with the provided email already exists
  if (await User.isUserExistsByEmail(payload?.email)) {
    // If user already exists, throw a CONFLICT ApiError
    throw new ApiError(httpStatus.CONFLICT, 'User already exists!');
  }

  payload.role = 'admin'; // Set default role
  payload.status = 'in-progress'; // Set default status
  payload.isBlocked = false; // Set default blocked status
  payload.isDeleted = false; // Set default deleted status

  // If user does not exist, create the new user
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

export const UserServices = {
  createUserFromDB,
  createAdminFromDB,
  getUsersFromDB,
};
