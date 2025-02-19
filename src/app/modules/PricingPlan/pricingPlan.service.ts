import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { IPricingPlan } from './pricingPlan.interface';
import { PricingPlan } from './pricingPlan.model';
import { createStripeProductCatalog } from '../../helpers/createStripeProductCatalog';
import mongoose from 'mongoose';
import { updateStripeProductCatalog } from '../../helpers/updateStripeProductCatalog';

const createPricingPlanToDB = async (user: JwtPayload, payload: IPricingPlan) => {


  const productPayload = {
    title: payload.title,
    duration: payload.duration,
    price: Number(payload.price),
  }
  const product = await createStripeProductCatalog(productPayload);


  if (!product) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create subscription product")
  }

  if (product) {
    payload.paymentLink = product.paymentLink
    payload.productId = product.productId
  }

  const result = await PricingPlan.create(payload);
  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to created Package")
  }

  return result;
};



const getPricingPlansFromDB = async () => {
  // Fetch all our stories entries from the database
  const result = await PricingPlan.find().sort('price');

  return result;
};

const updatePricingPlanByIdFromDB = async (
  pricingPlanId: string,
  payload: IPricingPlan,
) => {

  if (!mongoose.Types.ObjectId.isValid(pricingPlanId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID")
  }
  const isExistProduct: IPricingPlan | null = await PricingPlan.findById(pricingPlanId).lean();

  if (!isExistProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Package not found")
  }

  if (isExistProduct?.price < payload?.price) {
    const payloadData: any = {
      duration: payload.duration,
      price: Number(payload.price)
    };

    Object.keys(payload).forEach((key) => {
      const typedKey = key as keyof IPricingPlan;
      if (typedKey !== "price" && typedKey !== "duration" && isExistProduct[typedKey] !== payload[typedKey]) {
        payloadData[typedKey] = payload[typedKey];
      }
    });

    const updatedProduct = await updateStripeProductCatalog(isExistProduct.productId as string, payloadData);
    if (!updatedProduct) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Failed to update subscription product")
    }
    payload.paymentLink = updatedProduct
  }

  const result = await PricingPlan.findByIdAndUpdate(
    { _id: pricingPlanId },
    payload,
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to Update Package")
  }

  return null;
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
