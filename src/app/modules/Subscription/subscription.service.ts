import { Subscription } from './subscription.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserSearchableFields } from '../User/user.constant';
import { JwtPayload } from 'jsonwebtoken';

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

const subscriberDetailsFromDB = async (user: JwtPayload) => {

  const result = await Subscription.find({userId: user?.userId})
    .populate("packageId");
  return result;
};

const retrievedDetailsFromDB = async (user: JwtPayload) => {

  const result = await Subscription.findOne({userId: user?.userId})
    .populate("packageId");
  return result;
};



export const SubscriptionServices = {
  getSubscribedUsersFromDB,
  subscriberDetailsFromDB,
  retrievedDetailsFromDB

};
