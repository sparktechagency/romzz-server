import { JwtPayload } from 'jsonwebtoken';
import { Property } from '../Property/property.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import stripe from '../../config/stripe';
import { User } from '../User/user.model';
import { Booking } from './booking.model';
import { UserServices } from '../User/user.service';

const confirmBookingToDB = async (user: JwtPayload, propertyId: string) => {
  // Calculate user profile progress
  const { progress } =
    await UserServices.calculateUserProfileProgressFromDB(user);

  if (progress < 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Complete your profile before booking. Current progress: ${progress}%.`,
    );
  }

  // Find the property based on ID
  const existingProperty = await Property.findById(propertyId);

  // Ensure the property exists
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${propertyId} not found!`,
    );
  }

  // Ensure the property is not already booked
  if (existingProperty.isBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Property with ID: ${propertyId} is already booked.`,
    );
  }

  // Find the user who created the property
  const propertyCreator = await User.findById(existingProperty.createdBy);

  // Ensure the user attempting to book is not the property creator
  if (user.userId === existingProperty.createdBy.toString()) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `You cannot book your own property.`,
    );
  }

  // Ensure the property creator has a connected Stripe account
  if (!propertyCreator?.stripeAccountInfo?.accountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Property creator does not have a connected Stripe account!',
    );
  }

  // Calculate amounts in smallest currency unit (e.g., cents)
  const totalAmount = existingProperty.price * 100;
  const adminFee = totalAmount * 0.2; // 20% fee for admin
  const payoutAmount = totalAmount - adminFee; // 80% payout to property creator

  // Create a transfer to the admin's Stripe account
  const transfer = await stripe.transfers.create({
    amount: adminFee,
    currency: 'usd',
    destination: propertyCreator?.stripeAccountInfo?.accountId,
  });

  // Create a payout to the property creator's Stripe account
  const payout = await stripe.payouts.create(
    {
      amount: payoutAmount,
      currency: 'usd',
      destination: propertyCreator?.stripeAccountInfo?.externalAccountId,
    },
    {
      stripeAccount: propertyCreator?.stripeAccountInfo?.accountId,
    },
  );

  const booking = await Booking.create({
    userId: user?.userId,
    propertyId: existingProperty?._id,
    totalAmount: totalAmount / 100,
    payoutAmount: payoutAmount / 100,
    adminFee: adminFee / 100,
    status: 'confirmed',
    paymentDetails: {
      transferId: transfer?.id,
      payoutId: payout?.id,
    },
  });

  // Mark the property as booked
  existingProperty.isBooked = true;
  await existingProperty.save();

  return { transfer, payout, booking };
};

export const BookingServices = {
  confirmBookingToDB,
};
