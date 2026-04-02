import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Information - Metfold Sheet Metal | Delivery & Pickup',
  description: 'Metfold Sheet Metal shipping and delivery information. Learn about delivery options, shipping costs, pickup locations, delivery times and tracking your order.',
  keywords: ['shipping info', 'delivery', 'pickup', 'Metfold delivery', 'roofing delivery Melbourne', 'sheet metal shipping'],
  openGraph: {
    title: 'Shipping Information - Metfold Sheet Metal',
    description: 'Delivery options, shipping costs, and pickup locations for Metfold Sheet Metal products.',
    type: 'website',
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
