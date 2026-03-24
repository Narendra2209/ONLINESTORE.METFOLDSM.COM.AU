import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission {
  resource: string;
  actions: string[];
}

export interface IRole extends Document {
  name: string;
  displayName: string;
  description: string;
  permissions: IPermission[];
  isSystem: boolean;
  isActive: boolean;
}

const permissionSchema = new Schema<IPermission>(
  {
    resource: { type: String, required: true },
    actions: [{ type: String, required: true }],
  },
  { _id: false }
);

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: { type: String, required: true },
    description: { type: String, default: '' },
    permissions: [permissionSchema],
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRole>('Role', roleSchema);
