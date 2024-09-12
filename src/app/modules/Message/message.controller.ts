import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MessageServices } from './message.service';

const createMessage = catchAsync(async (req, res) => {
  const result = await MessageServices.createMessageToDB(
    req?.user,
    req?.body,
    req?.files,
    req?.params?.conversationId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Message created successfully!',
    data: result,
  });
});

export const MessageControllers = {
  createMessage,
};
