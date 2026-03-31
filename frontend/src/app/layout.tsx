import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Metfold Sheet Metal | Roofing, Cladding & Rainwater Supplies Australia',
    template: '%s | Metfold Sheet Metal',
  },
  description:
    'Australia\'s trusted supplier of Colorbond roofing, wall cladding, fascia & gutter, downpipes, flashings and rainwater goods. Configure online with live pricing. Trade accounts welcome.',
  keywords: [
    'colorbond roofing',
    'sheet metal supplies',
    'wall cladding panels',
    'fascia and gutter',
    'rainwater goods',
    'roof flashing',
    'downpipes Australia',
    'trade roofing supplies',
    'interlocking cladding',
    'roofing sheets Australia',
    'metfold',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'Metfold Sheet Metal',
    title: 'Metfold Sheet Metal | Roofing, Cladding & Rainwater Supplies',
    description: 'Premium Colorbond roofing, cladding, rainwater goods and accessories. Configure online with live pricing and instant quotes.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/images/navicon.png',
    apple: '/images/navicon.png',
  },
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
