import { JwtPayload } from 'jsonwebtoken';
import { IMessage } from './message.interface';
import { Message } from './message.model';

const createMessageToDB = async (user: JwtPayload, payload: IMessage) => {
  payload.senderId = user?.userId;

  const result = await Message.create(payload);
  return result;
};

const getMessagesFromDB = async () => {
  const result = await Message.find();
  return result;
};

export const MessageServices = {
  createMessageToDB,
  getMessagesFromDB,
};
