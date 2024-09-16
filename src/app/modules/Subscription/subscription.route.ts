import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { SubscriptionControllers } from './subscription.controller';

const router = Router();

router.get(
  '/',
  validateAuth(USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  SubscriptionControllers.getSubscribedUsers,
);

export const SubscriptionRoutes = router;
