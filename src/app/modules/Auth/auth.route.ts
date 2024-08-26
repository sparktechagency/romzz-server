import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';

const router = Router();

// Log in a user
router.post('/login', AuthControllers.loginUser);

// Request password reset
router.post('/forgot-password', AuthControllers.requestPasswordReset);

// Reset password using token
router.post('/reset-password', AuthControllers.resetPassword);

// Verify email with OTP
router.post('/verify-email', AuthControllers.verifyEmailAddress);

// Verify OTP for password reset
router.post('/verify-reset-otp', AuthControllers.verifyResetPassword);

// Resend email verification
router.post(
  '/resend-verification-email',
  AuthControllers.resendVerificationEmail,
);

// Resend password reset email
router.post(
  '/resend-password-reset-email',
  AuthControllers.resendPasswordResetEmail,
);

// Change password for authenticated users
router.post(
  '/change-password',
  validateAuth(USER_ROLE.user, USER_ROLE.admin, USER_ROLE.superAdmin),
  AuthControllers.changePassword,
);

export const AuthRoutes = router;
