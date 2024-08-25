import { ObjectId } from 'mongoose';
import {
  BOOKING_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from './booking.constant';

export type TPaymentStatus = keyof typeof PAYMENT_STATUS;
export type TPaymentMethod = keyof typeof PAYMENT_METHOD;
export type TBookingStatus = keyof typeof BOOKING_STATUS;

export interface IBooking {
  userId: ObjectId;
  propertyId: ObjectId;
  bookingDate: Date;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;
  bookingStatus: TBookingStatus;
}
