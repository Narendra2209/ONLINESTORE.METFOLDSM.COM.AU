import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { authLimiter } from '../middlewares/rateLimiter';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  initiateRegistrationSchema,
  verifyOtpSchema,
  resendOtpSchema,
  googleAuthSchema,
} from '../validators/auth.validator';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  authController.register
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.login
);

// OTP registration flow
router.post(
  '/initiate-registration',
  authLimiter,
  validate({ body: initiateRegistrationSchema }),
  authController.initiateRegistration
);

router.post(
  '/verify-otp',
  authLimiter,
  validate({ body: verifyOtpSchema }),
  authController.verifyRegistrationOtp
);

router.post(
  '/resend-otp',
  authLimiter,
  validate({ body: resendOtpSchema }),
  authController.resendOtp
);

// Google auth
router.post(
  '/google',
  validate({ body: googleAuthSchema }),
  authController.googleAuth
);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authenticate, authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword
);

router.post(
  '/change-password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword
);

router.get('/me', authenticate, authController.getMe);

// Address routes
router.get('/addresses', authenticate, authController.getAddresses);
router.post('/addresses', authenticate, authController.createAddress);
router.put('/addresses/:id', authenticate, authController.updateAddress);
router.delete('/addresses/:id', authenticate, authController.deleteAddress);

export default router;
