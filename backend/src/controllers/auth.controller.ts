import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth';
import Address from '../models/Address';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' as const : 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);

  ApiResponse.created({
    res,
    message: 'Registration successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);

  ApiResponse.success({
    res,
    message: 'Login successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) {
    return ApiResponse.success({ res, statusCode: 401, message: 'Refresh token required' });
  }

  const result = await authService.refreshToken(token);

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);

  ApiResponse.success({
    res,
    message: 'Token refreshed',
    data: { accessToken: result.tokens.accessToken },
  });
});

export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  const refreshTokenValue = req.cookies?.refreshToken;
  if (req.user) {
    await authService.logout(req.user._id, refreshTokenValue);
  }

  res.clearCookie('refreshToken');
  ApiResponse.success({ res, message: 'Logged out successfully' });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.success({
    res,
    message: 'If that email exists, a password reset link has been sent',
  });
});

export const verifyResetOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.verifyResetOtp(req.body.email, req.body.otp);
  ApiResponse.success({
    res,
    message: 'OTP verified',
    data: { resetToken: result.resetToken },
  });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password);
  ApiResponse.success({ res, message: 'Password reset successful' });
});

export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  await authService.changePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  res.clearCookie('refreshToken');
  ApiResponse.success({ res, message: 'Password changed. Please log in again.' });
});

export const initiateRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.initiateRegistration(req.body);
  ApiResponse.success({ res, message: result.message });
});

export const verifyRegistrationOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await authService.verifyRegistrationOtp(email, otp);

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);

  ApiResponse.created({
    res,
    message: 'Email verified and account created successfully',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.resendOtp(req.body.email);
  ApiResponse.success({ res, message: result.message });
});

export const googleAuth = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.googleAuth(req.body.idToken);

  res.cookie('refreshToken', result.tokens.refreshToken, COOKIE_OPTIONS);

  ApiResponse.success({
    res,
    message: 'Google authentication successful',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  ApiResponse.success({ res, data: req.user });
});

// Address CRUD
export const getAddresses = catchAsync(async (req: AuthRequest, res: Response) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  ApiResponse.success({ res, data: addresses });
});

export const createAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const { isDefault, ...rest } = req.body;

  // If setting as default, unset existing defaults
  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const address = await Address.create({ ...rest, isDefault: !!isDefault, user: req.user._id });
  ApiResponse.created({ res, data: address });
});

export const updateAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    return ApiResponse.success({ res, statusCode: 404, message: 'Address not found' });
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id, _id: { $ne: req.params.id } }, { isDefault: false });
  }

  const updated = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  ApiResponse.success({ res, data: updated });
});

export const deleteAddress = catchAsync(async (req: AuthRequest, res: Response) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) {
    return ApiResponse.success({ res, statusCode: 404, message: 'Address not found' });
  }
  ApiResponse.success({ res, message: 'Address deleted' });
});
