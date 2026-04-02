import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Metfold Sheet Metal',
  description: 'Terms and conditions for purchasing products from Metfold Sheet Metal. Read our terms of use, ordering, payment, delivery and warranty policies.',
  keywords: ['terms and conditions', 'terms of use', 'Metfold terms', 'purchase terms', 'sheet metal terms'],
  openGraph: {
    title: 'Terms & Conditions - Metfold Sheet Metal',
    description: 'Terms and conditions for purchasing products from Metfold Sheet Metal.',
    type: 'website',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
