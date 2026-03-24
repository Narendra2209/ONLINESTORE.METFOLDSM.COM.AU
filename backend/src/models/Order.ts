import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  productSku: string;
  variant: mongoose.Types.ObjectId | null;
  selectedAttributes: Array<{
    attributeName: string;
    value: string;
  }>;
  pricingModel: string;
  unitPrice: number;
  length: number | null;
  quantity: number;
  lineTotal: number;
}

export interface IAddress {
  fullName: string;
  company: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId | null;
  customerEmail: string;
  customerName: string;
  userType: 'retail' | 'trade';

  items: IOrderItem[];

  shippingAddress: IAddress;
  billingAddress: IAddress;

  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  total: number;

  status: string;
  statusHistory: Array<{
    status: string;
    note: string;
    changedBy: mongoose.Types.ObjectId | null;
    changedAt: Date;
  }>;

  payment: {
    method: string;
    stripePaymentIntentId: string;
    status: string;
    paidAt: Date | null;
  };

  deliveryMethod: 'delivery' | 'pickup';
  notes: string;
  internalNotes: string;
  isQuoteRequest: boolean;
  quoteExpiresAt: Date | null;
  couponCode: string;
}

const addressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true },
    company: { type: String, default: '' },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
    country: { type: String, default: 'Australia' },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, required: true },
    productSku: { type: String, required: true },
    variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', default: null },
    selectedAttributes: [
      {
        attributeName: { type: String },
        value: { type: String },
      },
    ],
    pricingModel: { type: String },
    unitPrice: { type: Number, required: true },
    length: { type: Number, default: null },
    quantity: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    userType: { type: String, enum: ['retail', 'trade'], default: 'retail' },

    items: [orderItemSchema],

    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },

    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        note: { type: String, default: '' },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    payment: {
      method: { type: String, default: 'stripe' },
      stripePaymentIntentId: { type: String, default: '' },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: { type: Date, default: null },
    },

    deliveryMethod: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    notes: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    isQuoteRequest: { type: Boolean, default: false },
    quoteExpiresAt: { type: Date, default: null },
    couponCode: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.stripePaymentIntentId': 1 });
orderSchema.index({ customerEmail: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
