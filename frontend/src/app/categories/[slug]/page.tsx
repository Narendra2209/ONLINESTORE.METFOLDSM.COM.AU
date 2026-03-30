'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, Product } from '@/types/product';
import { productApi } from '@/services/product.service';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Skeleton from '@/components/ui/Skeleton';
import { ArrowRight, Grid3X3 } from 'lucide-react';

// Categories with custom pages — redirect instead of showing product listing
const CUSTOM_PAGES: Record<string, string> = {
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  // Redirect to custom page if this category has one
  useEffect(() => {
    if (CUSTOM_PAGES[slug]) {
      router.replace(CUSTOM_PAGES[slug]);
    }
  }, [slug, router]);

  if (CUSTOM_PAGES[slug]) {
    return null;
  }
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catData, prodResponse] = await Promise.all([
          productApi.getCategoryBySlug(slug),
          productApi.getProducts({ category: slug, limit: 24, sortBy: 'name' }),
        ]);
        setCategory(catData);
        setProducts(prodResponse.data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-steel-50 min-h-screen">
        <div className="bg-white border-b border-steel-100">
          <div className="container-main py-8">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-9 w-64" />
          </div>
        </div>
        <div className="container-main py-5 sm:py-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-steel-100 bg-white overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container-main py-20 text-center animate-fade-in-up">
        <h1 className="text-2xl font-bold text-steel-900">Category not found</h1>
        <p className="mt-2 text-steel-500">The category you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700">
          Browse all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-steel-50 min-h-screen animate-fade-in-up">
      {/* Category Header */}
      <div className="bg-white border-b border-steel-100">
        <div className="container-main py-5 sm:py-8">
          <Breadcrumb items={[{ label: category.name }]} />
          <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-steel-900 tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-steel-500 max-w-2xl leading-relaxed">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container-main py-5 sm:py-8">
        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mb-6 sm:mb-10">
            <h2 className="text-base sm:text-lg font-semibold text-steel-900 mb-3 sm:mb-4">Browse Subcategories</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.children.map((sub) => (
                <Link
                  key={sub._id}
                  href={`/categories/${sub.slug}`}
                  className="group flex items-center justify-between rounded-xl bg-white p-5 border border-steel-100
                    hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/30 hover:-translate-y-0.5
                    transition-all duration-300"
                >
                  <div>
                    <span className="font-semibold text-steel-800 group-hover:text-brand-600 transition-colors">
                      {sub.name}
                    </span>
                    {sub.productCount !== undefined && sub.productCount > 0 && (
                      <span className="block text-xs text-steel-400 mt-0.5">{sub.productCount} products</span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-steel-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-steel-900">
                Products <span className="text-steel-400 font-normal">({products.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          !category.children?.length && (
            <div className="py-16 text-center">
              <Grid3X3 className="mx-auto h-12 w-12 text-steel-300" />
              <p className="mt-4 text-lg font-medium text-steel-700">No products yet</p>
              <p className="mt-1 text-sm text-steel-500">Products will be added to this category soon.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
