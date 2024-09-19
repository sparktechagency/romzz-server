import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { BookingControllers } from './booking.controller';

const router = Router();

router.get(
  '/',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  BookingControllers.getBookingsHistory,
);

router.post(
  '/confirm/:propertyId',
  validateAuth(USER_ROLE.USER),
  BookingControllers.confirmBooking,
);

export const BookingRoutes = router;
