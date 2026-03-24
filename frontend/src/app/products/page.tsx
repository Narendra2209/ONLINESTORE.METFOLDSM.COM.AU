'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ProductFilters } from '@/types/product';
import { productApi } from '@/services/product.service';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import Skeleton from '@/components/ui/Skeleton';
import { Search, Package } from 'lucide-react';

export default function ProductListingPage() {
  return (
    <Suspense fallback={
      <div className="bg-steel-50 min-h-screen">
        <div className="bg-white border-b border-steel-100">
          <div className="container-main py-8">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container-main py-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-steel-100 bg-white overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductListingContent />
    </Suspense>
  );
}

function ProductListingContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: 'newest',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productApi.getProducts(filters);
        setProducts(response.data);
        if (response.meta) {
          setTotalPages(response.meta.totalPages);
          setTotal(response.meta.total);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  return (
    <div className="bg-steel-50 min-h-screen animate-fade-in-up">
      {/* Page Header */}
      <div className="bg-white border-b border-steel-100">
        <div className="container-main py-8">
          <Breadcrumb items={[{ label: 'All Products' }]} />
          <h1 className="mt-3 text-3xl font-bold text-steel-900 tracking-tight">All Products</h1>
          <p className="mt-1 text-steel-500">{total} products available</p>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Filters bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full rounded-xl border border-steel-200 bg-white py-2.5 pl-10 pr-3 text-sm
                focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-steel-500 hidden sm:inline">Sort by:</span>
            <Select
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'name', label: 'Name A-Z' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
              ]}
              value={filters.sortBy || 'newest'}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any, page: 1 })}
              className="w-48"
            />
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-steel-300" />
            <p className="mt-4 text-lg font-medium text-steel-700">No products found</p>
            <p className="mt-1 text-sm text-steel-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <Pagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
