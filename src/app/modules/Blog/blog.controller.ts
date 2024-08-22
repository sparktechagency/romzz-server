import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { BlogServices } from './blog.service';

const createBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.createBlogIntoDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Blog created successfully!',
    data: result,
  });
});

const getBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getBlgosFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blogs retrieved successfully!',
    data: result,
  });
});

export const BlogControllers = {
  createBlog,
  getBlogs,
};
