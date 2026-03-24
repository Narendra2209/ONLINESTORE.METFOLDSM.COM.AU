'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/axios';
import { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-main section-padding text-center py-16"><p className="text-steel-500">Loading...</p></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query.trim()) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&page=${page}&limit=12`);
        setProducts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setTotal(data.meta?.total || 0);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  return (
    <div className="container-main section-padding">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-steel-900">
          {query ? `Search results for "${query}"` : 'Search Products'}
        </h1>
        {total > 0 && (
          <p className="text-sm text-steel-500 mt-1">{total} product{total !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {!query.trim() ? (
        <div className="text-center py-16">
          <SearchIcon className="mx-auto h-12 w-12 text-steel-300 mb-4" />
          <p className="text-steel-500">Enter a search term to find products</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 p-4 h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon className="mx-auto h-12 w-12 text-steel-300 mb-4" />
          <p className="text-steel-500">No products found for &quot;{query}&quot;</p>
          <p className="text-sm text-steel-400 mt-1">Try different keywords or browse our categories</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
