'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Search, Package, Truck, CheckCircle, Clock, MapPin, Phone,
  ChevronRight, AlertCircle, Loader2, PackageCheck, Box, CircleDot,
} from 'lucide-react';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedAttributes?: Array<{ attributeName: string; value: string }>;
}

interface OrderResult {
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
  deliveryMethod: string;
  shippingAddress?: { street: string; city: string; state: string; postcode: string };
  pickupBranch?: string;
  createdAt: string;
  statusHistory?: Array<{ status: string; timestamp: string; note?: string }>;
}

const statusSteps = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered'];

const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Box,
  packed: PackageCheck,
  shipped: Truck,
  delivered: CheckCircle,
};

const statusLabels: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !email.trim()) {
      toast.error('Please enter both order number and email');
      return;
    }

    setLoading(true);
    setOrder(null);
    setSearched(true);
    try {
      const { data } = await api.get(`/orders/track?orderNumber=${orderNumber.trim()}&email=${email.trim()}`);
      setOrder(data.data);
    } catch {
      toast.error('Order not found. Please check your order number and email.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1;

  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Track Order' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Search className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Track Your Order</h1>
            </div>
            <p className="text-lg text-steel-300 leading-relaxed">
              Enter your order number and email address to check the status of your order.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <div className="mt-10 max-w-xl mx-auto">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1.5">Order Number</label>
              <input
                type="text"
                placeholder="e.g. MET-20260402-XXXX"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm
                  focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="The email used when placing the order"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-steel-200 bg-white px-4 py-3 text-sm
                  focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Track Order
                </>
              )}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-steel-400">
            Already have an account?{' '}
            <Link href="/account/orders" className="text-brand-600 hover:underline">
              View all orders in My Account
            </Link>
          </p>
        </div>

        {/* Results */}
        {searched && !loading && !order && (
          <div className="mt-10 max-w-xl mx-auto text-center py-10">
            <AlertCircle className="mx-auto h-12 w-12 text-steel-300" />
            <p className="mt-3 text-lg font-medium text-steel-700">Order Not Found</p>
            <p className="mt-1 text-sm text-steel-500">
              We couldn&apos;t find an order matching that number and email. Please double-check and try again.
            </p>
          </div>
        )}

        {order && (
          <div className="mt-10 max-w-3xl mx-auto mb-12">
            {/* Order Header */}
            <div className="rounded-xl border border-steel-100 bg-steel-50/50 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs text-steel-500">Order Number</p>
                  <p className="text-lg font-bold text-steel-900">{order.orderNumber}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-steel-500">Order Placed</p>
                  <p className="text-sm font-medium text-steel-700">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  <CircleDot className="h-3 w-3" />
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
            </div>

            {/* Progress Tracker */}
            {order.status !== 'cancelled' && currentStepIndex >= 0 && (
              <div className="mt-6 rounded-xl border border-steel-100 bg-white p-5 sm:p-6">
                <h3 className="text-sm font-bold text-steel-900 mb-5">Order Progress</h3>
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-steel-100" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-brand-600 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
                  />

                  {statusSteps.map((step, i) => {
                    const StepIcon = statusIcons[step] || Clock;
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step} className="relative flex flex-col items-center z-10">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                          isCompleted
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-white border-steel-200 text-steel-400'
                        } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}>
                          <StepIcon className="h-3.5 w-3.5" />
                        </div>
                        <span className={`mt-2 text-[10px] sm:text-xs font-medium ${
                          isCompleted ? 'text-brand-600' : 'text-steel-400'
                        }`}>
                          {statusLabels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-6 rounded-xl border border-steel-100 bg-white p-5 sm:p-6">
                <h3 className="text-sm font-bold text-steel-900 mb-4">Status History</h3>
                <div className="space-y-3">
                  {order.statusHistory.slice().reverse().map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-brand-600' : 'bg-steel-300'}`} />
                      <div>
                        <p className="text-sm font-medium text-steel-800">{statusLabels[entry.status] || entry.status}</p>
                        <p className="text-xs text-steel-500">{formatDate(entry.timestamp)}</p>
                        {entry.note && <p className="text-xs text-steel-400 mt-0.5">{entry.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mt-6 rounded-xl border border-steel-100 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold text-steel-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-steel-50 last:border-0">
                    <div className="h-10 w-10 rounded-lg bg-steel-50 border border-steel-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-steel-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-steel-800 truncate">{item.productName}</p>
                      <p className="text-xs text-steel-500">
                        Qty: {item.quantity}
                        {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                          <> &bull; {item.selectedAttributes.map(a => a.value).join(', ')}</>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-steel-700">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-steel-100 space-y-1 text-right">
                <p className="text-xs text-steel-500">Subtotal: {formatCurrency(order.subtotal)}</p>
                <p className="text-xs text-steel-500">GST: {formatCurrency(order.taxAmount)}</p>
                {order.shippingCost > 0 && (
                  <p className="text-xs text-steel-500">Shipping: {formatCurrency(order.shippingCost)}</p>
                )}
                <p className="text-base font-bold text-steel-900">Total: {formatCurrency(order.total)}</p>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 rounded-xl border border-steel-100 bg-white p-5 sm:p-6">
              <h3 className="text-sm font-bold text-steel-900 mb-3">
                {order.deliveryMethod === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
              </h3>
              {order.deliveryMethod === 'pickup' && order.pickupBranch ? (
                <div className="flex items-start gap-2 text-sm text-steel-600">
                  <MapPin className="h-4 w-4 mt-0.5 text-brand-600 flex-shrink-0" />
                  <span>METFOLD - {order.pickupBranch}</span>
                </div>
              ) : order.shippingAddress ? (
                <div className="flex items-start gap-2 text-sm text-steel-600">
                  <MapPin className="h-4 w-4 mt-0.5 text-brand-600 flex-shrink-0" />
                  <span>
                    {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.postcode}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Help */}
            <div className="mt-6 rounded-xl border border-steel-100 bg-steel-50/50 p-5 text-center">
              <p className="text-sm text-steel-600">
                Need help with your order?{' '}
                <Link href="/contact" className="text-brand-600 hover:underline font-medium">Contact us</Link>
                {' '}or call{' '}
                <a href="tel:0397320148" className="text-brand-600 hover:underline font-medium">(03) 9732 0148</a>
              </p>
            </div>
          </div>
        )}

        {/* Bottom spacer when no results */}
        {!order && <div className="mb-12" />}
      </div>
    </div>
  );
}
