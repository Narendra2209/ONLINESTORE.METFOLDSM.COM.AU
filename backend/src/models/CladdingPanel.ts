import mongoose, { Schema, Document } from 'mongoose';

export interface ICladdingPanel extends Document {
  product: string;       // Interlocking, Nailstrip, NailstriP, Snaplock, Standing Seam
  material: string;      // Colorbond, Ultra, Matt Colorbond, Galvanised, Zinc
  rib: string;           // 25mm, 38mm
  cover: number;         // cover width in mm (200, 300, 500, etc.)
  basePrice: number;     // price per linear metre
  gauge: string;         // e.g. "0.55mm"
  sku: string;           // e.g. CB25RIL200C, CBU25RNS195C
  uom: string;           // LM (linear metre)
  isActive: boolean;
}

const claddingPanelSchema = new Schema<ICladdingPanel>(
  {
    product: { type: String, required: true, trim: true },
    material: { type: String, required: true, trim: true },
    rib: { type: String, required: true, trim: true },
    cover: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    gauge: { type: String, default: '' },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    uom: { type: String, default: 'LM' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

claddingPanelSchema.index({ sku: 1 }, { unique: true });
claddingPanelSchema.index({ product: 1, material: 1, rib: 1, cover: 1 });
claddingPanelSchema.index({ material: 1, isActive: 1 });

export default mongoose.model<ICladdingPanel>('CladdingPanel', claddingPanelSchema);
