import { ObjectId } from 'mongoose';
import { BOOKING_STATUS } from './booking.constant';

export type TBookingStatus = keyof typeof BOOKING_STATUS;

export interface IBooking {
  userId: ObjectId;
  propertyId: ObjectId;
  totalAmount: number;
  adminFee: number;
  payoutAmount: number;
  checkInDate: Date;
  trxId: string;
  status: TBookingStatus;
}
