import { JwtPayload } from 'jsonwebtoken';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const createBlogIntoDB = async (user: JwtPayload, payload: IBlog) => {
  payload.createdBy = user?.userId;

  const result = await Blog.create(payload);
  return result;
};

const getBlogsFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const blogsQuery = new QueryBuilder(Blog.find(), query)
    .sort() // Apply sorting based on the query parameter
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await blogsQuery.countTotal();
  const result = await blogsQuery.modelQuery;

  return { meta, result };
};

const getBlogByIdFromDB = async (blogId: string) => {
  // Find the Blog by ID
  const result = await Blog.findById(blogId);

  // Handle case where no Blog is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Blog with ID: ${blogId} not found!`,
    );
  }

  return result;
};

const updateBlogByIdFromDB = async (
  blogId: string,
  payload: Partial<IBlog>,
) => {
  // Update the blog with the provided status
  const result = await Blog.findByIdAndUpdate(blogId, payload, {
    new: true, // Return the updated document
  });

  // Handle case where no blog is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Blog with ID: ${blogId} not found!`,
    );
  }

  return result;
};

const deleteBlogByIdFromDB = async (blogId: string) => {
  // Find the Blog by ID
  const result = await Blog.findByIdAndDelete(blogId);

  // Handle case where no Blog is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Blog with ID: ${blogId} not found!`,
    );
  }
};

export const BlogServices = {
  createBlogIntoDB,
  getBlogsFromDB,
  getBlogByIdFromDB,
  updateBlogByIdFromDB,
  deleteBlogByIdFromDB,
};
