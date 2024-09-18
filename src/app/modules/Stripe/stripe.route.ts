import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { StripeControllers } from './stripe.controller';

const router = Router();

router.post(
  '/connect-account',
  validateAuth(USER_ROLE.USER),
  StripeControllers.createConnectAccount,
);

router.post(
  '/payments/create-intent',
  validateAuth(USER_ROLE.USER),
  StripeControllers.createPaymentIntent,
);
export const StripeRoutes = router;
