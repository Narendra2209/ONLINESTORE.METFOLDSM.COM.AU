import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Role from '../models/Role';
import PendingRegistration from '../models/PendingRegistration';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { emailService } from './email.service';
import { OAuth2Client } from 'google-auth-library';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateTokens = (user: IUser): TokenPair => {
  const accessToken = jwt.sign(
    { userId: user._id, role: (user.role as any)?.name || 'customer' },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY } as any
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY } as any
  );

  return { accessToken, refreshToken };
};

export const authService = {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    abn?: string;
    userType?: 'retail' | 'trade';
  }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      throw ApiError.internal('Default customer role not found. Run seed first.');
    }

    const user = await User.create({
      ...data,
      role: customerRole._id,
      isApproved: data.userType === 'trade' ? false : true,
    });

    const populatedUser = await User.findById(user._id).populate('role', 'name displayName');
    if (!populatedUser) throw ApiError.internal();

    const tokens = generateTokens(populatedUser);

    // Save refresh token
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    return {
      user: {
        id: populatedUser._id,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        email: populatedUser.email,
        userType: populatedUser.userType,
        role: (populatedUser.role as any).name,
      },
      tokens,
    };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ email })
      .select('+password')
      .populate('role', 'name displayName permissions');

    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    if (!user.isApproved) {
      throw ApiError.forbidden('Account is pending approval');
    }

    const tokens = generateTokens(user);

    // Save refresh token and update last login
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
      lastLogin: new Date(),
    });

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        role: (user.role as any).name,
        permissions: (user.role as any).permissions,
      },
      tokens,
    };
  },

  async refreshToken(token: string) {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };

    const user = await User.findById(decoded.userId)
      .select('+refreshTokens')
      .populate('role', 'name displayName permissions');

    if (!user) throw ApiError.unauthorized('Invalid refresh token');

    if (!user.refreshTokens.includes(token)) {
      // Token reuse detected — revoke all tokens
      await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
      throw ApiError.unauthorized('Token reuse detected. All sessions revoked.');
    }

    const tokens = generateTokens(user);

    // Rotate: remove old refresh token, add new one
    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: token },
      $push: { refreshTokens: tokens.refreshToken },
    });

    return { tokens };
  },

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    } else {
      // Logout all sessions
      await User.findByIdAndUpdate(userId, { refreshTokens: [] });
    }
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) return; // Don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // TODO: Send email with reset link containing resetToken
    return resetToken;
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    // Revoke all refresh tokens on password reset
    await User.findByIdAndUpdate(user._id, { refreshTokens: [] });
  },

  async initiateRegistration(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    company?: string;
    abn?: string;
    userType?: 'retail' | 'trade';
  }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const otp = generateOtp();

    // Upsert pending registration (allows resend)
    await PendingRegistration.findOneAndUpdate(
      { email: data.email },
      {
        ...data,
        otp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await emailService.sendOtpEmail(data.email, otp, data.firstName);

    return { message: 'OTP sent to your email' };
  },

  async verifyRegistrationOtp(email: string, otp: string) {
    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      throw ApiError.badRequest('No pending registration found. Please register again.');
    }

    if (pending.otpExpiresAt < new Date()) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      throw ApiError.badRequest('OTP has expired. Please register again.');
    }

    if (pending.attempts >= 5) {
      await PendingRegistration.deleteOne({ _id: pending._id });
      throw ApiError.badRequest('Too many attempts. Please register again.');
    }

    pending.attempts += 1;
    await pending.save();

    const isValid = await pending.compareOtp(otp);
    if (!isValid) {
      throw ApiError.badRequest(`Invalid OTP. ${5 - pending.attempts} attempts remaining.`);
    }

    // OTP verified — create the actual user
    const customerRole = await Role.findOne({ name: 'customer' });
    if (!customerRole) {
      throw ApiError.internal('Default customer role not found. Run seed first.');
    }

    const user = await User.create({
      firstName: pending.firstName,
      lastName: pending.lastName,
      email: pending.email,
      password: pending.password,
      phone: pending.phone,
      company: pending.company,
      abn: pending.abn,
      userType: pending.userType,
      role: customerRole._id,
      isVerified: true,
      isApproved: pending.userType === 'trade' ? false : true,
    });

    // Clean up pending registration
    await PendingRegistration.deleteOne({ _id: pending._id });

    const populatedUser = await User.findById(user._id).populate('role', 'name displayName');
    if (!populatedUser) throw ApiError.internal();

    const tokens = generateTokens(populatedUser);

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: tokens.refreshToken },
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(populatedUser.email, populatedUser.firstName);

    return {
      user: {
        id: populatedUser._id,
        firstName: populatedUser.firstName,
        lastName: populatedUser.lastName,
        email: populatedUser.email,
        userType: populatedUser.userType,
        role: (populatedUser.role as any).name,
      },
      tokens,
    };
  },

  async resendOtp(email: string) {
    const pending = await PendingRegistration.findOne({ email });
    if (!pending) {
      throw ApiError.badRequest('No pending registration found. Please register again.');
    }

    const otp = generateOtp();
    pending.otp = otp;
    pending.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    pending.attempts = 0;
    await pending.save();

    await emailService.sendOtpEmail(email, otp, pending.firstName);

    return { message: 'New OTP sent to your email' };
  },

  async googleAuth(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw ApiError.badRequest('Invalid Google token');
    }

    const { email, given_name, family_name, sub: googleId, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email }).populate('role', 'name displayName permissions');

    if (user) {
      // Link Google to existing account if not already linked
      if (!user.authProvider.includes('google')) {
        await User.findByIdAndUpdate(user._id, {
          $addToSet: { authProvider: 'google' },
          googleId,
        });
      }
    } else {
      // Create new user
      const customerRole = await Role.findOne({ name: 'customer' });
      if (!customerRole) {
        throw ApiError.internal('Default customer role not found. Run seed first.');
      }

      user = await User.create({
        firstName: given_name || 'User',
        lastName: family_name || given_name || 'User',
        email,
        googleId,
        authProvider: ['google'],
        role: customerRole._id,
        isVerified: true,
        isApproved: true,
      });

      user = await User.findById(user._id).populate('role', 'name displayName permissions') as any;
      await emailService.sendWelcomeEmail(email!, given_name || 'User');
    }

    if (!user!.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    const tokens = generateTokens(user!);

    await User.findByIdAndUpdate(user!._id, {
      $push: { refreshTokens: tokens.refreshToken },
      lastLogin: new Date(),
    });

    return {
      user: {
        id: user!._id,
        firstName: user!.firstName,
        lastName: user!.lastName,
        email: user!.email,
        userType: user!.userType,
        role: (user!.role as any).name,
        permissions: (user!.role as any).permissions,
      },
      tokens,
    };
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    if (!(await user.comparePassword(currentPassword))) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens
    await User.findByIdAndUpdate(userId, { refreshTokens: [] });
  },
};
