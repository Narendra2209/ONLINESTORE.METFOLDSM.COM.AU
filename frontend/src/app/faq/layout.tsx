import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Metfold Sheet Metal | Frequently Asked Questions',
  description: 'Find answers to common questions about Metfold Sheet Metal products, ordering, delivery, returns, custom flashing, roof sheets, trade accounts, and more.',
  keywords: ['FAQ', 'frequently asked questions', 'Metfold help', 'roofing questions', 'sheet metal FAQ', 'Colorbond FAQ'],
  openGraph: {
    title: 'FAQ - Metfold Sheet Metal',
    description: 'Frequently asked questions about our products, ordering, delivery, and services.',
    type: 'website',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
