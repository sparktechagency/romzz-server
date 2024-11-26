import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SubscriptionServices } from './subscription.service';

const getSubscribedUsers = catchAsync(async (req, res) => {
  const result = await SubscriptionServices.getSubscribedUsersFromDB(
    req?.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Subscribed users retrived successfully!',
    data: result,
  });
});

const subscriberDetails = catchAsync(async (req, res) => {
  const result = await SubscriptionServices.subscriberDetailsFromDB(req?.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscriber Details retrieved successfully!',
    data: result,
  });
});

export const SubscriptionControllers = {
  getSubscribedUsers,
  subscriberDetails
};
