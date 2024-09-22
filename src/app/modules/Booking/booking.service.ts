import { JwtPayload } from 'jsonwebtoken';
import { Property } from '../Property/property.model';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { Booking } from './booking.model';
import stripe from '../../config/stripe';
import { IBooking } from './booking.interface';
import { UserSearchableFields } from '../User/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import { NotificationServices } from '../Notification/notification.service';
import mongoose from 'mongoose';

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

  // Ensure the user attempting to book is not the property creator
  if (user?.userId === existingProperty.createdBy.toString()) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      `You cannot book your own property.`,
    );
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Calculate amounts in smallest currency unit (e.g., cents)
    const totalAmount = paymentIntent.amount / 100;
    const adminFee = totalAmount * 0.2; // 20% fee for admin
    const payoutAmount = totalAmount - adminFee; // 80% payout to property creator

    const booking = await Booking.create(
      [
        {
          userId: user?.userId,
          propertyId: existingProperty?._id,
          totalAmount: totalAmount,
          payoutAmount: payoutAmount,
          adminFee: adminFee,
          trxId: payload.trxId,
          checkInDate: payload.checkInDate,
          status: 'confirmed',
        },
      ],
      { session },
    );

    // Mark the property as booked
    existingProperty.isBooked = true;
    existingProperty.status = 'booked';

    await existingProperty.save({ session });

    // Notify admins and superadmins of new property creation
    await NotificationServices.notifyPropertyBookingFromDB(
      existingProperty.createdBy.toString(), // ownerId
      user?.userId, // bookingUserId
      propertyId, // propertyId
      session, // session
    );

    // Commit the transaction
    await session.commitTransaction();
    await session.endSession();

    return booking;
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    await session.endSession();

    // Re-throw the error to be handled by the caller
    throw error;
  }
};

const getBookingsHistoryFromDB = async (query: Record<string, unknown>) => {
  // Build the query using QueryBuilder with the given query parameters
  const bookingsQuery = new QueryBuilder(
    Booking.find()
      .populate({
        path: 'userId',
        select: 'avatar fullName email phoneNumber permanentLocation',
      })
      .populate({
        path: 'propertyId',
        select: 'createdBy',
        populate: {
          path: 'createdBy',
          select: 'avatar fullName email phoneNumber permanentLocation',
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
  getBookingsHistoryFromDB,
};
