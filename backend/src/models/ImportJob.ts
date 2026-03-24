import mongoose, { Schema, Document } from 'mongoose';

export interface IImportJob extends Document {
  fileName: string;
  type: 'products' | 'prices' | 'stock';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  importErrors: Array<{
    row: number;
    field: string;
    message: string;
    data: Record<string, any>;
  }>;
  createdProductIds: mongoose.Types.ObjectId[];
  createdVariantIds: mongoose.Types.ObjectId[];
  uploadedBy: mongoose.Types.ObjectId;
  completedAt: Date | null;
}

const importJobSchema = new Schema<IImportJob>(
  {
    fileName: { type: String, required: true },
    type: {
      type: String,
      enum: ['products', 'prices', 'stock'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    importErrors: [
      {
        row: Number,
        field: String,
        message: String,
        data: Schema.Types.Mixed,
      },
    ],
    createdProductIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    createdVariantIds: [{ type: Schema.Types.ObjectId, ref: 'ProductVariant' }],
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IImportJob>('ImportJob', importJobSchema);
