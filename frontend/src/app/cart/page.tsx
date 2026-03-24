'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Package, ShieldCheck, Truck } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  if (items.length === 0) {
    return (
      <div className="container-main py-20 text-center animate-fade-in-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-steel-100">
          <ShoppingBag className="h-10 w-10 text-steel-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-steel-900">Your cart is empty</h1>
        <p className="mt-2 text-steel-500 max-w-md mx-auto">
          Looks like you haven&apos;t added any products yet. Browse our catalogue to find what you need.
        </p>
        <Link href="/products">
          <Button className="mt-8 btn-shine" size="lg" leftIcon={<ArrowRight className="h-4 w-4" />}>
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-steel-50 min-h-screen">
      <div className="container-main py-6 animate-fade-in-up">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold text-steel-900">Shopping Cart</h1>
            <p className="text-sm text-steel-500 mt-1">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-steel-500 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, index) => {
              const image = item.product.images?.[0];
              return (
                <div
                  key={item._id}
                  className="flex gap-4 rounded-xl bg-white p-4 border border-steel-100 hover:border-steel-200 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product image */}
                  <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-steel-50 border border-steel-100 overflow-hidden">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-steel-300" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.product.slug === 'custom-flashing' ? '/flashing' : `/products/${item.product.slug}`}
                      className="font-semibold text-steel-900 hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-steel-400 mt-0.5">SKU: {item.product.sku}</p>

                    {/* Selected attributes */}
                    {item.selectedAttributes.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.selectedAttributes
                          .filter((attr) => !attr.attributeName.startsWith('Segment '))
                          .map((attr, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md bg-steel-50 px-2 py-0.5 text-[11px] font-medium text-steel-600 border border-steel-100"
                          >
                            {attr.attributeName}: {attr.value}
                          </span>
                        ))}
                        {item.length && (
                          <span className="inline-flex items-center rounded-md bg-steel-50 px-2 py-0.5 text-[11px] font-medium text-steel-600 border border-steel-100">
                            Length: {item.length}m
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-lg border border-steel-200 bg-white">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-steel-500 hover:bg-steel-50 hover:text-steel-700 disabled:opacity-30 rounded-l-lg transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-steel-900 border-x border-steel-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-2 text-steel-500 hover:bg-steel-50 hover:text-steel-700 rounded-r-lg transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-steel-900">
                          {formatCurrency(item.lineTotal)}
                        </span>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="rounded-lg p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-xl bg-white p-6 border border-steel-100 shadow-sm">
                <h2 className="text-lg font-bold text-steel-900">Order Summary</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-steel-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-steel-600">
                    <span>GST (10%)</span>
                    <span className="font-medium">{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between text-steel-600">
                    <span>Shipping</span>
                    <span className="text-steel-400 italic">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-steel-100 pt-3 mt-1">
                    <div className="flex justify-between text-lg font-bold text-steel-900">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-steel-400 text-right">Inc. GST</p>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button className="mt-6 w-full btn-shine" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Link
                  href="/products"
                  className="mt-3 flex items-center justify-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  Continue Shopping
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Trust signals */}
              <div className="rounded-xl bg-white p-4 border border-steel-100 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-steel-600">Secure SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-brand-600 flex-shrink-0" />
                  <span className="text-steel-600">Australia-wide delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
