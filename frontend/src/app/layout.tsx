import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Metfold - Industrial Roofing & Sheet Metal Supplies',
    template: '%s | Metfold',
  },
  description:
    'Premium roofing, cladding, rainwater goods and sheet metal products for residential and commercial projects across Australia.',
  keywords: [
    'roofing',
    'cladding',
    'sheet metal',
    'colorbond',
    'guttering',
    'fascia',
    'downpipe',
    'roof sheets',
    'Australia',
  ],
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
