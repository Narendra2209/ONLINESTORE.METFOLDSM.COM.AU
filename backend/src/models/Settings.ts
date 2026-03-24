import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: any;
  group: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: { type: String, default: 'general' },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', settingsSchema);
