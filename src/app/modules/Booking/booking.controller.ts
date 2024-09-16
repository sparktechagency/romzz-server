import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingServices } from './booking.service';

const confirmBooking = catchAsync(async (req, res) => {
  const result = await BookingServices.confirmBookingToDB(
    req?.user,
    req?.body,
    req?.params?.propertyId,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking confirmed successfully!',
    data: result,
  });
});

const getBookings = catchAsync(async (req, res) => {
  const result = await BookingServices.getBookingsFromDB(req?.query);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Bookings retrived successfully!',
    data: result,
  });
});

export const BookingControllers = {
  confirmBooking,
  getBookings,
};
