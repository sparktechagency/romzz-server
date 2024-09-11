import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IPricingPlan } from './pricingPlan.interface';
import { PricingPlan } from './pricingPlan.model';

const createPricingPlanToDB = async (
  user: JwtPayload,
  payload: IPricingPlan,
) => {
  // Check the total number of monthly and yearly pricing plans in the database
  const monthlyPlanCount = await PricingPlan.countDocuments({
    billingCycle: 'monthly',
  });
  const yearlyPlanCount = await PricingPlan.countDocuments({
    billingCycle: 'yearly',
  });

  // Allow only 3 monthly and 3 yearly plans
  if (payload.billingCycle === 'monthly' && monthlyPlanCount >= 3) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Monthly Pricing Plan creation limit reached!',
    );
  }

  if (payload.billingCycle === 'yearly' && yearlyPlanCount >= 3) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Yearly Pricing Plan creation limit reached!',
    );
  }

  // Set the createdBy field to the ID of the user who is creating the Pricing Plan
  payload.createdBy = user?.userId;

  // Create the new Pricing Plan entry in the database
  const result = await PricingPlan.create(payload);
  return result;
};

const getPricingPlansFromDB = async () => {
  // Fetch all our stories entries from the database
  const result = await PricingPlan.find().sort('price');
  return result;
};

const updatePricingPlanByIdFromDB = async (
  pricingPlanId: string,
  payload: Partial<IPricingPlan>,
) => {
  // Prevent modification of the createdBy field to maintain integrity
  delete payload.createdBy;

  // Fetch the existing our stories entry from the database by its ID
  const existingPricingPlan = await PricingPlan.findById(pricingPlanId);

  // If the Pricing Plan entry does not exist, throw an error
  if (!existingPricingPlan) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Pricing Plan with ID: ${pricingPlanId} not found!`,
    );
  }

  // Update the Pricing Plan entry in the database with the new data
  const result = await PricingPlan.findByIdAndUpdate(pricingPlanId, payload, {
    new: true, // Return the updated document
    runValidators: true,
  });

  return result;
};

const deletePricingPlanByIdFromDB = async (pricingPlanId: string) => {
  // Update the PricingPlan with the provided status
  const result = await PricingPlan.findByIdAndDelete(pricingPlanId);

  // Handle case where no PricingPlan is found
  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `PricingPlan with ID: ${pricingPlanId} not found!`,
    );
  }
};

export const PricingPlanServices = {
  createPricingPlanToDB,
  getPricingPlansFromDB,
  updatePricingPlanByIdFromDB,
  deletePricingPlanByIdFromDB,
};
