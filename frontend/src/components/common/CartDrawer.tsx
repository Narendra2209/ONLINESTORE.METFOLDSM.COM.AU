'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatCurrency } from '@/lib/utils';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-steel-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-steel-900">Cart</h2>
            <span className="text-sm text-steel-500">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 rounded-lg text-steel-400 hover:bg-steel-50 hover:text-steel-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-12 w-12 text-steel-200 mb-3" />
              <p className="text-steel-500 text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item._id} className="rounded-lg border border-steel-100 p-3">
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-md bg-steel-50 flex items-center justify-center overflow-hidden">
                      {item.product.images?.[0]?.url ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-steel-300" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-steel-900 truncate">{item.product.name}</h4>
                      <p className="text-xs text-brand-600 font-medium">{item.product.sku}</p>

                      {/* Attributes */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.selectedAttributes
                          .filter((a) => !a.attributeName.startsWith('Segment '))
                          .map((attr, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-steel-50 text-steel-500 px-1.5 py-0.5 rounded border border-steel-100"
                            >
                              {attr.attributeName}: {attr.value}
                            </span>
                          ))}
                        {item.length && (
                          <span className="text-[10px] bg-steel-50 text-steel-500 px-1.5 py-0.5 rounded border border-steel-100">
                            Length: {item.length}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: quantity + price */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded border border-steel-200">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 text-steel-400 hover:text-steel-600 disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-medium border-x border-steel-200">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 text-steel-400 hover:text-steel-600"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-steel-900">{formatCurrency(item.lineTotal)}</span>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="p-1 text-steel-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-steel-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-steel-600">Subtotal (excl. GST)</span>
              <span className="font-bold text-steel-900">{formatCurrency(subtotal)}</span>
            </div>
            <Link
              href="/cart"
              onClick={() => setCartOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              View Cart & Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
