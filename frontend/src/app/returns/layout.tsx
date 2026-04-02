import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns Policy - Metfold Sheet Metal | Refunds & Exchanges',
  description: 'Metfold Sheet Metal returns policy. Learn about our refund process, exchange policy, and conditions for returning roofing, cladding, and sheet metal products.',
  keywords: ['returns policy', 'refund policy', 'exchange policy', 'Metfold returns', 'sheet metal returns'],
  openGraph: {
    title: 'Returns Policy - Metfold Sheet Metal',
    description: 'Our returns and refund policy for roofing, cladding, fascia, gutter and sheet metal products.',
    type: 'website',
  },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
