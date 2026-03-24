export interface Address {
  _id?: string;
  fullName: string;
  company?: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  productName: string;
  productSku: string;
  selectedAttributes: Array<{
    attributeName: string;
    value: string;
  }>;
  pricingModel: string;
  unitPrice: number;
  length?: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  total: number;
  status: string;
  statusHistory: Array<{
    status: string;
    note?: string;
    changedAt: string;
  }>;
  payment: {
    method: string;
    status: string;
    paidAt?: string;
  };
  notes?: string;
  isQuoteRequest: boolean;
  createdAt: string;
  updatedAt: string;
}
