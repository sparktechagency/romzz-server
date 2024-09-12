import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import { Conversation } from '../Conversation/conversation.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';

const createMessageToDB = async (
  user: JwtPayload,
  payload: IMessage,
  conversationId: string,
) => {
  // Check if the conversation exists
  const existingConversation = await Conversation.findById(conversationId);

  if (!existingConversation) {
    // If conversation doesn't exist, throw a 404 error
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Conversation with ID: ${conversationId} not found!`,
    );
  }

  // Check if the user is a participant in the conversation
  const isParticipant = existingConversation?.participants?.some(
    (participantId) => participantId?.toString() === user?.userId,
  );

  if (!isParticipant) {
    // If the user is not a participant, throw a 403 Forbidden error
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not allowed to send a message in this conversation!',
    );
  }

  // Set senderId and conversationId
  payload.senderId = user?.userId;
  payload.conversationId = new Types.ObjectId(conversationId);

  // Create the message
  const newMessage = await Message.create(payload);

  // Update the Conversation with the new lastMessage
  await Conversation.findByIdAndUpdate(
    conversationId,
    { lastMessage: newMessage?._id }, // Set lastMessage to the newly created message ID
    { new: true },
  );

  return newMessage;
};

export const MessageServices = {
  createMessageToDB,
};
