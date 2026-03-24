export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    images: Array<{ url: string; alt: string }>;
  };
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

export interface Cart {
  _id: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  coupon?: {
    code: string;
    discount: number;
  };
  itemCount: number;
}
