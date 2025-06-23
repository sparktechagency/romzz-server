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
  const result = await SubscriptionServices.subscriberDetailsFromDB(req?.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Retrieved Subscription successfully!',
    data: result,
  });
});

const retrievedDetails = catchAsync(async (req, res) => {
  const result = await SubscriptionServices.retrievedDetailsFromDB(req?.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Retrieved Subscription Details successfully!',
    data: result,
  });
});

export const SubscriptionControllers = {
  getSubscribedUsers,
  subscriberDetails,
  retrievedDetails
};
