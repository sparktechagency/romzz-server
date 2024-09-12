import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ConversationServices } from './conversation.service';

const createConversation = catchAsync(async (req, res) => {
  const result = await ConversationServices.createConversationToDB(
    req?.user,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Conversation created successfully!',
    data: result,
  });
});

const getConversations = catchAsync(async (req, res) => {
  const result = await ConversationServices.getConversationsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conversations retrieved successfully!',
    data: result,
  });
});

const getConversationById = catchAsync(async (req, res) => {
  const result = await ConversationServices.getConversationByIdFromDB(
    req?.params?.id,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conversations retrieved successfully!',
    data: result,
  });
});

export const ConversationControllers = {
  createConversation,
  getConversationById,
  getConversations,
};
