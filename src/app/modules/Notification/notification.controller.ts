import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationServices } from './notification.service';

const getAllNotificationsById = catchAsync(async (req, res) => {
  const result = await NotificationServices.getAllNotificationsByIdFromDB(
    req?.user,
    req?.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications retrieved successfully!',
    data: result,
  });
});

const markAllNotificationsAsSeenById = catchAsync(async (req, res) => {
  const result =
    await NotificationServices.markAllNotificationsAsSeenByIdFromDB(req?.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as seen successfully!',
    data: result,
  });
});

const markAllNotificationsAsReadById = catchAsync(async (req, res) => {
  const result =
    await NotificationServices.markAllNotificationsAsReadByIdFromDB(req?.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read successfully!',
    data: result,
  });
});

const adminNotification = catchAsync(async (req, res) => {
  const result =
    await NotificationServices.adminNotificationFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications Retrieved successfully!',
    data: result,
  });
});

export const NotificationControllers = {
  getAllNotificationsById,
  markAllNotificationsAsSeenById,
  markAllNotificationsAsReadById,
  adminNotification
};
