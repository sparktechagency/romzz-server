import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { NotificationControllers } from './notification.controller';

const router = Router();

router.get(
  '/',
  validateAuth(USER_ROLE.USER),
  NotificationControllers.getAllNotificationsById,
);

router.get(
  '/admin',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  NotificationControllers.adminNotification
);

router.patch(
  '/mark-as-seen',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  NotificationControllers.markAllNotificationsAsSeenById,
);

router.patch(
  '/mark-as-read',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  NotificationControllers.markAllNotificationsAsReadById,
);

export const NotificationRoutes = router;
