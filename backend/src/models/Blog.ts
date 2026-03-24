import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: { url: string; publicId: string };
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  viewCount: number;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: {
      url: String,
      publicId: String,
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'general' },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    publishedAt: { type: Date },
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });

export default mongoose.model<IBlog>('Blog', blogSchema);
