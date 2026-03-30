import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Metfold Sheet Metal | Get in Touch',
  description: 'Contact Metfold Sheet Metal for roofing, cladding, fascia, gutter and sheet metal supplies. Visit our branches in Sunbury, Melton, Pakenham and Moama or send us a message.',
  keywords: ['contact Metfold', 'Metfold phone number', 'sheet metal supplier contact', 'roofing supplier Melbourne', 'Metfold Sunbury', 'Metfold Melton', 'Metfold Pakenham', 'Metfold Moama'],
  openGraph: {
    title: 'Contact Metfold Sheet Metal',
    description: 'Get in touch with Metfold Sheet Metal. 4 branches across Victoria and NSW for roofing and sheet metal supplies.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
