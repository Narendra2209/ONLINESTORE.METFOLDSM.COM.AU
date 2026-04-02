import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Metfold Sheet Metal | How We Handle Your Data',
  description: 'Metfold Sheet Metal privacy policy. Learn how we collect, use, store and protect your personal information when you use our website and services.',
  keywords: ['privacy policy', 'data protection', 'personal information', 'Metfold privacy', 'cookie policy'],
  openGraph: {
    title: 'Privacy Policy - Metfold Sheet Metal',
    description: 'How Metfold Sheet Metal collects, uses and protects your personal information.',
    type: 'website',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
