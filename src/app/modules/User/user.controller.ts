import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { UserServices } from './user.service';

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Thanks for registering!',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const result = await UserServices.createAdminFromDB(req.body);

  return sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Thanks for registering!',
    data: result,
  });
});

const getUsers = catchAsync(async (req, res) => {
  const result = await UserServices?.getUsersFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User list retrieved successfully!',
    data: result,
  });
});

export const UserControllers = {
  createUser,
  createAdmin,
  getUsers,
};
