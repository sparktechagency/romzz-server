import { Schema, model } from 'mongoose';
import {
  BOOKING_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './booking.constant';
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
    bookingDate: {
      type: Date,
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: 'pending', // Default status is pending
    },
  },
  { timestamps: true },
);

// Method to remove sensitive fields before returning booking object as JSON
bookingSchema.methods.toJSON = function () {
  const bookingObject = this.toObject();
  // Customize as needed to remove sensitive information
  return bookingObject;
};

// Create the booking model using the schema
export const Booking = model<IBooking>('Booking', bookingSchema);
