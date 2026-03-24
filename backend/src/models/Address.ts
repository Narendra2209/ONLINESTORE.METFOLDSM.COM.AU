import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedAddress extends Document {
  user: mongoose.Types.ObjectId;
  label: string;
  fullName: string;
  company: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

const savedAddressSchema = new Schema<ISavedAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, default: 'Home' },
    fullName: { type: String, default: '' },
    company: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, default: 'Australia' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

savedAddressSchema.index({ user: 1 });

export default mongoose.model<ISavedAddress>('Address', savedAddressSchema);
