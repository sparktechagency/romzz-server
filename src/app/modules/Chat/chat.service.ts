import { JwtPayload } from 'jsonwebtoken';
import { IChat } from './chat.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Chat } from './chat.model';

const createChatToDB = async (user: JwtPayload, payload: IChat) => {
  payload.createdBy = user?.userId;

  const result = await Chat.create(payload);
  return result;
};

const getChatsFromDB = async () => {
  const result = await Chat.find();
  return result;
};

const getChatByIdFromDB = async (chatId: string) => {
  const result = await Chat.findById(chatId);

  // Handle case where no Chat is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Chat with ID: ${chatId} not found!`,
    );
  }
};

export const ChatServices = {
  createChatToDB,
  getChatByIdFromDB,
  getChatsFromDB,
};
