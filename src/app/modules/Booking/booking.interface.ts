import { ObjectId } from 'mongoose';
import { BOOKING_STATUS } from './booking.constant';

export type TBookingStatus = keyof typeof BOOKING_STATUS;

interface IPaymentDetails {
  transferId: string;
  payoutId: string;
}

export interface IBooking {
  userId: ObjectId;
  propertyId: ObjectId;
  checkInDate: Date;
  totalAmount: number;
  adminFee: number;
  payoutAmount: number;
  paymentDetails: IPaymentDetails;
  status: TBookingStatus;
}
