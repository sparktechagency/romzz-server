import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import loginValidationSchema from './auth.validation';

const router = Router();

// Log in a user
router.post(
  '/login',
  validateRequest(loginValidationSchema),
  AuthControllers.loginUser,
);

// Request password reset
router.post('/forgot-password', AuthControllers.requestPasswordReset);

// Reset password using token
router.post('/reset-password', AuthControllers.resetPassword);

// Verify email with OTP
router.post('/verify-email', AuthControllers.verifyEmailAddress);

// Verify OTP for password reset
router.post('/verify-reset-otp', AuthControllers.verifyResetPassword);

// Resend verification or password reset email
router.post('/resend-email', AuthControllers.resendVerificationOrPasswordReset);

// Change password for authenticated users
router.post(
  '/change-password',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  AuthControllers.changePassword,
);

// Change password for authenticated users
router.post('/refresh-token', AuthControllers.issueNewAccessToken);

export const AuthRoutes = router;
