import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPendingRegistration extends Document {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  company: string;
  abn: string;
  userType: 'retail' | 'trade';
  otp: string;
  otpExpiresAt: Date;
  attempts: number;
  createdAt: Date;
  compareOtp(candidateOtp: string): Promise<boolean>;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  abn: { type: String, default: '' },
  userType: { type: String, enum: ['retail', 'trade'], default: 'retail' },
  otp: { type: String, required: true },
  otpExpiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // Auto-delete after 15 minutes
});

// Hash OTP before saving
pendingRegistrationSchema.pre('save', async function (next) {
  if (this.isModified('otp')) {
    this.otp = await bcrypt.hash(this.otp, 10);
  }
  next();
});

pendingRegistrationSchema.methods.compareOtp = async function (candidateOtp: string): Promise<boolean> {
  return bcrypt.compare(candidateOtp, this.otp);
};

export default mongoose.model<IPendingRegistration>('PendingRegistration', pendingRegistrationSchema);
