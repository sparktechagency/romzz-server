import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';

const router = Router();

router.post('/login', AuthControllers.loginUser);
router.post('/forgot-password', AuthControllers.requestPasswordReset);
router.post('/reset-password', AuthControllers.resetPassword);

router.post('/verify-email', AuthControllers.verifyEmailAddress);
router.post('/verify-reset-otp', AuthControllers.verifyResetPassword);

router.post(
  '/resend-verification-email',
  AuthControllers.resendVerificationEmail,
);
router.post(
  '/resend-password-reset-email',
  AuthControllers.resendPasswordResetEmail,
);

router.post(
  '/change-password',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  AuthControllers.changePassword,
);

export const AuthRoutes = router;
