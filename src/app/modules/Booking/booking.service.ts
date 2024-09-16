import { JwtPayload } from 'jsonwebtoken';
import { Property } from '../Property/property.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { User } from '../User/user.model';
import { Booking } from './booking.model';
import stripe from '../../config/stripe';
import { IBooking } from './booking.interface';

const confirmBookingToDB = async (user: JwtPayload, payload: IBooking) => {
  // Retrieve and verify the PaymentIntent
  const paymentIntent = await stripe.paymentIntents.retrieve(
    payload?.transactionId,
  );

  if (paymentIntent?.status !== 'succeeded') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Payment not completed. Please try again.',
    );
  }

  // Find the property based on ID
  const existingProperty = await Property.findById(payload?.propertyId);

  // Ensure the property exists
  if (!existingProperty) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Property with ID: ${payload?.propertyId} not found!`,
    );
  }

  // Ensure the property is not already booked
  if (existingProperty.isBooked) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Property with ID: ${payload?.propertyId} is already booked.`,
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

  const booking = await Booking.create({
    userId: user?.userId,
    propertyId: existingProperty?._id,
    totalAmount: totalAmount / 100,
    payoutAmount: payoutAmount / 100,
    adminFee: adminFee / 100,
    transactionId: payload.transactionId,
    checkInDate: payload.checkInDate,
    status: 'confirmed',
  });

  // Mark the property as booked
  existingProperty.isBooked = true;
  await existingProperty.save();

  return { booking };
};

export const BookingServices = {
  confirmBookingToDB,
};
