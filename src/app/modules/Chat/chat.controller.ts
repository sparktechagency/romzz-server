import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ChatServices } from './chat.service';

const createChat = catchAsync(async (req, res) => {
  const result = await ChatServices.createChatToDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Chat created successfully!',
    data: result,
  });
});

const getChatById = catchAsync(async (req, res) => {
  const result = await ChatServices.getChatByIdFromDB(req?.params?.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chat retrieved successfully!',
    data: result,
  });
});

const getChats = catchAsync(async (req, res) => {
  const result = await ChatServices.getChatsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Chats retrieved successfully!',
    data: result,
  });
});

export const ChatControllers = {
  createChat,
  getChatById,
  getChats,
};
