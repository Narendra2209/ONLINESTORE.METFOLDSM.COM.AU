'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price?: number;
  images: Array<{ url: string; alt: string }>;
  shortDescription: string;
  status: string;
  type: string;
  pricingModel?: string;
}

export default function AccountWishlistPage() {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/wishlist');
      setProducts(data.data?.products || []);
    } catch {
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-steel-900 mb-4">My Wishlist</h2>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl bg-white border border-steel-100 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-steel-300 mb-3" />
          <p className="text-steel-500 mb-2">Your wishlist is empty</p>
          <Link href="/products">
            <Button variant="outline" size="sm">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div key={product._id} className="rounded-xl bg-white border border-steel-100 p-4 flex gap-4">
              <div className="h-20 w-20 bg-steel-100 rounded-lg flex items-center justify-center shrink-0">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.images[0].alt} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs text-steel-400">No image</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${product.slug}`} className="font-medium text-steel-900 hover:text-brand-600 line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-xs text-steel-500 mt-0.5">{product.sku}</p>
                <p className="text-sm font-medium text-steel-900 mt-1">
                  {product.price ? formatCurrency(product.price) : product.type === 'configurable' ? 'Configure for price' : '—'}
                </p>
                <div className="flex gap-2 mt-2">
                  <Link href={`/products/${product.slug}`}>
                    <Button size="sm" variant="outline" leftIcon={<ShoppingCart className="h-3.5 w-3.5" />}>
                      View
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="rounded-lg p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
