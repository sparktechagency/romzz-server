import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { NotificationControllers } from './notification.controller';

const router = Router();

router.get(
  '/',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  NotificationControllers.getAllNotificationsById,
);

router.patch(
  '/mark-as-seen',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  NotificationControllers.markAllNotificationsAsSeenById,
);

export const NotificationRoutes = router;
