import { Subscription } from './subscription.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { UserSearchableFields } from '../User/user.constant';

const getSubscribedUsersFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const usersQuery = new QueryBuilder(
    Subscription.find()
      .populate({
        path: 'userId',
        select: 'avatar fullName',
      })
      .populate({
        path: 'packageId',
        select: 'title price',
      }),
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

export const SubscriptionServices = {
  getSubscribedUsersFromDB,
};
