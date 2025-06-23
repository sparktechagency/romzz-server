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

router.post('/subscribe',
  validateAuth(USER_ROLE.USER),
  SubscriptionControllers.getSubscribedUsers,
);

router.get('/details',
  validateAuth(USER_ROLE.USER),
  SubscriptionControllers.subscriberDetails,
);


router.get('/retrieve',
  validateAuth(USER_ROLE.USER),
  SubscriptionControllers.retrievedDetails,
);

export const SubscriptionRoutes = router;
