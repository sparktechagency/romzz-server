import mongoose from "mongoose";
import { IPricingPlan } from "./pricingPlan.interface";
import { createStripeProductCatalog } from "../../helpers/createStripeProductCatalog";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";
import { PricingPlan } from "./pricingPlan.model";
import stripe from "../../config/stripe";
import { updateStripeProductCatalog } from "../../helpers/updateStripeProductCatalog";
import { deleteStripeProductCatalog } from "../../helpers/deleteStripeProductCatalog";

const createPackageToDB = async (payload: IPricingPlan): Promise<IPricingPlan | null> => {

  const productPayload = {
    title: payload.title,
    description: payload.description,
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
    await stripe.products.del(product.productId);
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to created Package")
  }

  return result;
}

const updatePackageToDB = async (id: string, payload: IPricingPlan): Promise<IPricingPlan | null> => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID")
  }
  const isExistProduct: IPricingPlan | null = await PricingPlan.findById(id).lean();

  if (!isExistProduct) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Package not found")
  }

  if (isExistProduct?.price < payload.price) {
    const payloadData: Record<string, any> = {
      duration: payload.duration ? payload.duration : isExistProduct.duration,
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
    { _id: id },
    payload,
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to Update Package")
  }

  return null;
}


const getPackageFromDB = async (): Promise<IPricingPlan[]> => {
  const result = await PricingPlan.find({ status: "Active" }).select("-__v -createdAt -updatedAt -status -productId");
  return result;
}

const getPackageDetailsFromDB = async (id: string): Promise<IPricingPlan | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID")
  }
  const result = await PricingPlan.findById(id);
  return result;
}

const deletePackageToDB = async (id: string): Promise<IPricingPlan | null> => {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID")
  }

  const isExistPackage = await PricingPlan.findById(id);
  if (!isExistPackage) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Package not found")
  }

  const deleteProductFromStripe = await deleteStripeProductCatalog(isExistPackage.productId as string);

  if (deleteProductFromStripe.success === false) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to delete subscription product")
  }

  const result = await PricingPlan.findByIdAndUpdate(
    { _id: id },
    { $set: { status: "Delete" } },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Failed to deleted Package")
  }

  return result;
}

export const PricingPlanService = {
  createPackageToDB,
  updatePackageToDB,
  getPackageFromDB,
  getPackageDetailsFromDB,
  deletePackageToDB
}