import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BlogServices } from './blog.service';

const createBlog = catchAsync(async (req, res) => {
  const result = await BlogServices.createBlogToDB(
    req?.user,
    req?.body,
    req?.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Blog created successfully!',
    data: result,
  });
});

const getBlogs = catchAsync(async (req, res) => {
  const result = await BlogServices.getBlogsFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blogs retrieved successfully!',
    data: result,
  });
});

const getBlogById = catchAsync(async (req, res) => {
  const result = await BlogServices.getBlogByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog retrieved successfully!',
    data: result,
  });
});

const updateBlogById = catchAsync(async (req, res) => {
  const result = await BlogServices.updateBlogByIdFromDB(
    req?.params?.id,
    req?.body,
    req?.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog updated successfully!',
    data: result,
  });
});

const deleteBlogById = catchAsync(async (req, res) => {
  const result = await BlogServices.deleteBlogByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Blog deleted successfully!',
    data: result,
  });
});

export const BlogControllers = {
  createBlog,
  getBlogs,
  getBlogById,
  deleteBlogById,
  updateBlogById,
};
