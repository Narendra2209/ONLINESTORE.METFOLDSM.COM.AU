import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  company: string;
  abn: string;
  userType: 'retail' | 'trade';
  role: mongoose.Types.ObjectId;
  authProvider: string[];
  googleId?: string;
  isActive: boolean;
  isVerified: boolean;
  isApproved: boolean;
  refreshTokens: string[];
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  fullName: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, minlength: 8, select: false },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    abn: { type: String, default: '' },
    userType: {
      type: String,
      enum: ['retail', 'trade'],
      default: 'retail',
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    authProvider: {
      type: [String],
      enum: ['local', 'google'],
      default: ['local'],
    },
    googleId: { type: String, sparse: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    refreshTokens: { type: [String], select: false, default: [] },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ userType: 1, isActive: 1 });

export default mongoose.model<IUser>('User', userSchema);
