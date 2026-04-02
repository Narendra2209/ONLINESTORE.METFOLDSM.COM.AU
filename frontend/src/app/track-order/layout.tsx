import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Your Order - Metfold Sheet Metal',
  description: 'Track your Metfold Sheet Metal order status. Enter your order number and email to check delivery progress, shipping updates, and estimated arrival times.',
  keywords: ['track order', 'order status', 'order tracking', 'Metfold order', 'delivery tracking'],
  openGraph: {
    title: 'Track Your Order - Metfold Sheet Metal',
    description: 'Track the status of your Metfold Sheet Metal order.',
    type: 'website',
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
