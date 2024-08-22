import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { ContactServices } from './contact.service';

const saveUserEmail = catchAsync(async (req, res) => {
  const result = await ContactServices.saveUserEmailToDB(req?.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Email submitted successfully!',
    data: result,
  });
});

const getUserEmailList = catchAsync(async (req, res) => {
  const result = await ContactServices.getUserEmailListFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submitted emails retrieved successfully!',
    data: result,
  });
});

export const ContactControllers = {
  saveUserEmail,
  getUserEmailList,
};
