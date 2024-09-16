import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { BookingControllers } from './booking.controller';

const router = Router();

router.post(
  '/confirm/:propertyId',
  validateAuth(USER_ROLE.USER),
  BookingControllers.confirmBooking,
);

export const BookingRoutes = router;
