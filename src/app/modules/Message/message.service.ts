import { JwtPayload } from 'jsonwebtoken';
import { IMessage } from './message.interface';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Message } from './message.model';

const createMessageToDB = async (user: JwtPayload, payload: IMessage) => {
  payload.sender = user?.userId;

  const result = await Message.create(payload);
  return result;
};

const getMessagesFromDB = async () => {
  const result = await Message.find();
  return result;
};

const deleteMessageByIdFromDB = async (MessageId: string) => {
  const result = await Message.findByIdAndDelete(MessageId);

  // Handle case where no Message is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Message with ID: ${MessageId} not found!`,
    );
  }
};

export const MessageServices = {
  createMessageToDB,
  getMessagesFromDB,
  deleteMessageByIdFromDB,
};
