import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Metfold Sheet Metal | Australian Roofing & Sheet Metal Supplies',
  description: 'Learn about Metfold Sheet Metal — Australian-owned supplier of Colorbond roofing, cladding, fascia, gutter, downpipes and custom flashing. 4 branches across Victoria and NSW.',
  keywords: ['Metfold Sheet Metal', 'about us', 'Australian roofing supplier', 'Colorbond supplier', 'sheet metal Melbourne', 'roofing Sunbury', 'roofing Melton', 'roofing Pakenham'],
  openGraph: {
    title: 'About Metfold Sheet Metal',
    description: 'Australian-owned supplier of premium roofing, cladding, and sheet metal products with 4 branches across Victoria and NSW.',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
