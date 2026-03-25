'use client';

import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Package, Eye } from 'lucide-react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    type: 'simple' | 'configurable';
    shortDescription?: string;
    images: Array<{ url: string; alt: string; isDefault?: boolean }>;
    price?: number | null;
    compareAtPrice?: number | null;
    priceRange?: { min: number; max: number } | null;
    pricingModel?: string | null;
    stock?: number;
    isFeatured?: boolean;
    category?: { name: string; slug: string };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const defaultImage = product.images?.find((i) => i.isDefault) || product.images?.[0];
  const isQuoteOnly = product.pricingModel === 'quote_only';

  const renderPrice = () => {
    if (isQuoteOnly) {
      return <span className="text-sm font-semibold text-brand-600">Request Quote</span>;
    }

    if (product.type === 'simple' && product.price) {
      return (
        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-lg font-bold text-steel-900">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs sm:text-sm text-steel-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
      );
    }

    if (product.priceRange) {
      if (product.priceRange.min === product.priceRange.max) {
        return (
          <span className="text-sm sm:text-lg font-bold text-steel-900">
            {formatCurrency(product.priceRange.min)}
            {product.pricingModel === 'per_metre' && <span className="text-xs sm:text-sm font-normal text-steel-500"> /m</span>}
          </span>
        );
      }
      return (
        <span className="text-xs sm:text-base font-bold text-steel-900">
          From {formatCurrency(product.priceRange.min)}
          {product.pricingModel === 'per_metre' && <span className="text-xs sm:text-sm font-normal text-steel-500"> /m</span>}
        </span>
      );
    }

    return <span className="text-xs sm:text-sm text-steel-500">Price on selection</span>;
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col rounded-xl border border-steel-100 bg-white overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:shadow-steel-200/50 hover:-translate-y-1 hover:border-brand-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-steel-50 overflow-hidden">
        {defaultImage?.url ? (
          <img
            src={defaultImage.url}
            alt={defaultImage.alt || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-steel-200" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick view button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-steel-900 shadow-lg">
            <Eye className="h-4 w-4" />
            View Details
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="inline-flex items-center rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Featured
            </span>
          )}
          {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
            <span className="inline-flex items-center rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.category && (
          <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-steel-400 mb-0.5 sm:mb-1 truncate">
            {product.category.name}
          </span>
        )}

        <h3 className="text-sm sm:text-base font-bold text-steel-900 group-hover:text-brand-600 transition-colors duration-200 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {product.shortDescription && (
          <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-steel-500 line-clamp-2 leading-relaxed hidden sm:block">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-2 sm:pt-3 border-t border-steel-50">
          {renderPrice()}

          <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
            {product.type === 'configurable' && !isQuoteOnly ? (
              <span className="text-[10px] sm:text-[11px] text-steel-500 font-medium">Multiple options</span>
            ) : null}
            <span className="hidden sm:inline text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
              {isQuoteOnly ? 'Get Quote' : 'Select Options'} &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
