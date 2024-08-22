import { JwtPayload } from 'jsonwebtoken';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createBlogIntoDB = async (user: JwtPayload, payload: IBlog) => {
  payload.createdBy = user?.userId;

  const result = await Blog.create(payload);
  return result;
};

const getBlgosFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const blogsQuery = new QueryBuilder(Blog.find(), query)
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await blogsQuery.countTotal();
  const result = await blogsQuery.modelQuery;

  return { meta, result };
};

export const BlogServices = {
  createBlogIntoDB,
  getBlgosFromDB,
};
