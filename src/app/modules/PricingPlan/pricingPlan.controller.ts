import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PricingPlanServices } from './pricingPlan.service';

const createPricingPlan = catchAsync(async (req, res) => {
  const result = await PricingPlanServices.createPricingPlanToDB(
    req?.user,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Pricing Plan created successfully!',
    data: result,
  });
});

const getPricingPlans = catchAsync(async (req, res) => {
  const result = await PricingPlanServices.getPricingPlansFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pricing Plans retrieved successfully!',
    data: result,
  });
});

const updatePricingPlanById = catchAsync(async (req, res) => {
  const result = await PricingPlanServices.updatePricingPlanByIdFromDB(
    req?.params?.id,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Pricing Plan updated successfully!',
    data: result,
  });
});

export const PricingPlanControllers = {
  createPricingPlan,
  getPricingPlans,
  updatePricingPlanById,
};
