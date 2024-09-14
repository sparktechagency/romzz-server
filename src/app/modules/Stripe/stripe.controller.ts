import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StripeServices } from './stripe.service';

const createConnectAccount = catchAsync(async (req, res) => {
  const result = await StripeServices.createConnectAccount(
    req?.user,
    req?.body,
    req?.files,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Connect Account created successfully!',
    data: result,
  });
});

export const StripeControllers = {
  createConnectAccount,
};
