import { Router } from 'express';
import validateAuth from '../../middlewares/validateAuth';
import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import loginValidationSchema from './auth.validation';

const router = Router();

// Verify email with OTP
router.post('/verify-otp', AuthControllers.verifyOtp);

// Resend verification email
router.post('/resend-email', AuthControllers.resendVerificationEmail);

// Request password reset
router.post('/forgot-password', AuthControllers.requestPasswordReset);

// Reset password using token
router.post('/reset-password', AuthControllers.resetPassword);

// Log in a user
router.post(
  '/login',
  validateRequest(loginValidationSchema),
  AuthControllers.loginUser,
);

// Change password for authenticated users
router.post(
  '/change-password',
  validateAuth(USER_ROLE.USER, USER_ROLE.ADMIN, USER_ROLE['SUPER-ADMIN']),
  AuthControllers.changePassword,
);

// Change password for authenticated users
router.post('/refresh-token', AuthControllers.issueNewAccessToken);

export const AuthRoutes = router;
