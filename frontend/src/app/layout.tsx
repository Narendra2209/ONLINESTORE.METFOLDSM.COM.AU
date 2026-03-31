import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://metfoldsm.com.au'),
  title: {
    default: 'Metfold Sheet Metal | Colorbond Roofing, Cladding & Rainwater Supplies Australia',
    template: '%s | Metfold Sheet Metal',
  },
  description:
    'Australia\'s trusted supplier of Colorbond roofing sheets, wall cladding panels, fascia & gutter, downpipes, custom flashings and rainwater goods. Configure products online with instant live pricing. Trade accounts with volume discounts available.',
  keywords: [
    'colorbond roofing sheets',
    'colorbond roofing supplies Australia',
    'sheet metal supplies online',
    'wall cladding panels Australia',
    'interlocking cladding panels',
    'fascia and gutter supplies',
    'custom roof flashing online',
    'downpipes Australia',
    'rainwater goods supplier',
    'trade roofing supplies',
    'roofing sheets Melbourne',
    'colorbond colours',
    'metal roofing online',
    'buy roofing sheets online Australia',
    'metfold sheet metal',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://metfoldsm.com.au',
    siteName: 'Metfold Sheet Metal',
    title: 'Metfold Sheet Metal | Premium Colorbond Roofing & Cladding Supplies',
    description: 'Configure Colorbond roofing, cladding, flashings and rainwater goods online with instant live pricing. Australia-wide delivery. Trade accounts welcome.',
    images: [{ url: '/images/logo.png', width: 1200, height: 630, alt: 'Metfold Sheet Metal — Roofing & Cladding Supplies' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metfold Sheet Metal | Colorbond Roofing & Cladding Supplies',
    description: 'Premium Colorbond roofing, cladding and rainwater products. Configure online with live pricing.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  alternates: {
    canonical: 'https://metfoldsm.com.au',
  },
  icons: {
    icon: '/images/navicon.png',
    apple: '/images/navicon.png',
  },
  verification: {},
  category: 'ecommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#37404c',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
