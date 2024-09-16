import { Schema, model } from 'mongoose';
import { BOOKING_STATUS } from './booking.constant';
import { IBooking } from './booking.interface';

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'User', // Reference to the 'User' model
      required: true,
    },
    propertyId: {
      type: Schema.Types.ObjectId, // MongoDB ObjectId type
      ref: 'Property', // Reference to the 'Property' model
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    adminFee: {
      type: Number,
      required: true,
    },
    payoutAmount: {
      type: Number,
      required: true,
    },
    paymentDetails: {
      transferId: {
        type: String,
        required: true,
      },
      payoutId: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
    },
  },
  { timestamps: true },
);

// Create the booking model using the schema
export const Booking = model<IBooking>('Booking', bookingSchema);
