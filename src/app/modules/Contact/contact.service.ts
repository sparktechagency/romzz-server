import QueryBuilder from '../../builder/QueryBuilder';
import { IContact } from './contact.interface';
import { Contact } from './contact.model';

const saveUserEmailToDB = async (payload: IContact) => {
  const result = await Contact.create(payload);
  return result;
};

const getUserEmailListFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const emailsQuery = new QueryBuilder(Contact.find(), query)
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await emailsQuery.countTotal();

  // Execute the query to retrieve the reviews
  const result = await emailsQuery.modelQuery;

  return { meta, result };
};

export const ContactServices = {
  saveUserEmailToDB,
  getUserEmailListFromDB,
};
