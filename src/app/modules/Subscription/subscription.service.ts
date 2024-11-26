import { Subscription } from './subscription.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserSearchableFields } from '../User/user.constant';
import mongoose from 'mongoose';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const getSubscribedUsersFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(
    Subscription.find()
      .populate("userId")
      .populate("packageId"),
    query,
  )
    .search(UserSearchableFields) // Apply search conditions based on searchable fields
    .filter()
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await usersQuery.countTotal();
  // Execute the query to retrieve the users
  const result = await usersQuery.modelQuery;

  return { meta, result };
};

const subscriberDetailsFromDB = async (id: string) => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID");
  }

  const result = Subscription.findById(id)
    .populate("userId")
    .populate("packageId");

  return result;
};


export const SubscriptionServices = {
  getSubscribedUsersFromDB,
  subscriberDetailsFromDB

};
