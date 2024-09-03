/* eslint-disable @typescript-eslint/no-explicit-any */

import { JwtPayload } from 'jsonwebtoken';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';
import QueryBuilder from '../../builder/QueryBuilder';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { unlinkFile } from '../../helpers/fileHandler';
import getPathAfterUploads from '../../helpers/getPathAfterUploads';

const createBlogToDB = async (user: JwtPayload, payload: IBlog, file: any) => {
  if (file && file?.path) {
    payload.image = getPathAfterUploads(file?.path);
  }

  // Set the createdBy field to the ID of the user who is creating the our story
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
  file: any,
) => {
  // Fetch the existing blog entry from the database by its ID
  const existingBlog = await Blog.findById(blogId);

  // If the Blog entry does not exist, throw an error
  if (!existingBlog) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Blog with ID: ${blogId} not found!`,
    );
  }

  // Prevent modification of the createdBy field to maintain integrity
  delete payload.createdBy;

  // If a new image is uploaded, update the image path in the payload
  if (file && file?.path) {
    const newImagePath = getPathAfterUploads(file?.path);

    // If a new image file is uploaded, update the image path in the payload
    if (existingBlog?.image !== newImagePath) {
      payload.image = newImagePath; // Update the payload with the new image path
      unlinkFile(existingBlog?.image); // Remove the old image file
    }
  }

  // Update the blog with the provided status
  const result = await Blog.findByIdAndUpdate(blogId, payload, {
    new: true, // Return the updated document
    runValidators: true,
  });

  return result;
};

const deleteBlogByIdFromDB = async (blogId: string) => {
  // Delete the Blog entry from the database by its ID
  const result = await Blog.findByIdAndDelete(blogId);

  // If the Blog entry has an associated image, remove the image file
  if (result?.image) {
    unlinkFile(result?.image);
  }

  // If the Blog entry does not exist, throw an error
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Blog with ID: ${blogId} not found!`,
    );
  }
};

export const BlogServices = {
  createBlogToDB,
  getBlogsFromDB,
  getBlogByIdFromDB,
  updateBlogByIdFromDB,
  deleteBlogByIdFromDB,
};
