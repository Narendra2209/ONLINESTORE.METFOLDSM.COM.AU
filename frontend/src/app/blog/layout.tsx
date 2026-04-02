import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Resources - Metfold Sheet Metal | Industry Guides & Tips',
  description: 'Industry insights, product guides, installation tips, and project inspiration from the Metfold Sheet Metal team. Learn about roofing, cladding, flashing and more.',
  keywords: ['blog', 'roofing tips', 'sheet metal guide', 'Colorbond guide', 'installation tips', 'Metfold blog', 'roofing resources'],
  openGraph: {
    title: 'Blog & Resources - Metfold Sheet Metal',
    description: 'Industry insights, product guides, and installation tips from the Metfold team.',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
