import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: { url: string; publicId: string };
  link?: string;
  linkText?: string;
  position: 'hero' | 'category' | 'promo';
  sortOrder: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    link: { type: String },
    linkText: { type: String },
    position: {
      type: String,
      enum: ['hero', 'category', 'promo'],
      default: 'hero',
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

bannerSchema.index({ position: 1, isActive: 1, sortOrder: 1 });

export default mongoose.model<IBanner>('Banner', bannerSchema);
