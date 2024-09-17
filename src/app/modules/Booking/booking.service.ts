import { JwtPayload } from 'jsonwebtoken';
import { Property } from '../Property/property.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { User } from '../User/user.model';
import { Booking } from './booking.model';
import stripe from '../../config/stripe';
import { IBooking } from './booking.interface';
import { UserSearchableFields } from '../User/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';

const confirmBookingToDB = async (
  user: JwtPayload,
  payload: IBooking,
  propertyId: string,
) => {
  // Retrieve and verify the PaymentIntent
  const paymentIntent = await stripe.paymentIntents.retrieve(payload?.trxId);

  if (paymentIntent?.status !== 'succeeded') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Payment not completed. Please try again.',
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

  const booking = await Booking.create({
    userId: user?.userId,
    propertyId: existingProperty?._id,
    totalAmount: totalAmount / 100,
    payoutAmount: payoutAmount / 100,
    adminFee: adminFee / 100,
    trxId: payload.trxId,
    checkInDate: payload.checkInDate,
    status: 'confirmed',
  });

  // Mark the property as booked
  existingProperty.isBooked = true;
  await existingProperty.save();

  return booking;
};

const getBookingsFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const bookingsQuery = new QueryBuilder(
    Booking.find()
      .populate({
        path: 'userId',
        select: 'avatar fullName email',
      })
      .populate({
        path: 'propertyId',
        populate: {
          path: 'createdBy',
          select: 'avatar fullName email',
        },
      }),
    query,
  )
    .search(UserSearchableFields) // Apply search conditions based on searchable fields
    .filter()
    .paginate(); // Apply pagination based on the query parameter

  // Get the total count of matching documents and total pages for pagination
  const meta = await bookingsQuery.countTotal();
  // Execute the query to retrieve the users
  const result = await bookingsQuery.modelQuery;

  return { meta, result };
};

export const BookingServices = {
  confirmBookingToDB,
  getBookingsFromDB,
};
