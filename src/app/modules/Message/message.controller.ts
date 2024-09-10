import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageServices } from './message.service';

const createMessage = catchAsync(async (req, res) => {
  const result = await MessageServices.createMessageToDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Message created successfully!',
    data: result,
  });
});

const getMessages = catchAsync(async (req, res) => {
  const result = await MessageServices.getMessagesFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully!',
    data: result,
  });
});

const deleteMessageById = catchAsync(async (req, res) => {
  const result = await MessageServices.deleteMessageByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message deleted successfully!',
    data: result,
  });
});

export const MessageControllers = {
  createMessage,
  getMessages,
  deleteMessageById,
};
