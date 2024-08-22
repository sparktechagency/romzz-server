import { JwtPayload } from 'jsonwebtoken';
import { IBlog } from './blog.interface';
import { Blog } from './blog.model';

const createBlogIntoDB = async (user: JwtPayload, payload: IBlog) => {
  payload.createdBy = user?.userId;

  const result = await Blog.create(payload);
  return result;
};

export const BlogServices = {
  createBlogIntoDB,
};
