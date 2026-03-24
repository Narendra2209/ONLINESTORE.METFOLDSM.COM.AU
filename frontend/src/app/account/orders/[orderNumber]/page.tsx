'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface OrderDetail {
  _id: string;
  orderNumber: string;
  status: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    selectedAttributes?: Array<{ name: string; value: string }>;
    length?: number;
    pricingModel?: string;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  total: number;
  deliveryMethod: string;
  statusHistory: Array<{ status: string; timestamp: string; note?: string }>;
  payment: { method: string; status: string; paidAt?: string };
  createdAt: string;
  notes?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderNumber}`);
        setOrder(data.data);
      } catch {
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': case 'confirmed': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-steel-500">Loading order...</p></div>;
  }

  if (!order) {
    return <div className="text-center py-12 text-steel-500">Order not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account/orders" className="rounded-lg p-2 hover:bg-steel-100">
          <ArrowLeft className="h-5 w-5 text-steel-500" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-steel-900">Order {order.orderNumber}</h2>
          <p className="text-sm text-steel-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusVariant(order.status) as any} className="ml-auto">
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Items */}
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-steel-100">
              <h3 className="font-semibold text-steel-900">Items</h3>
            </div>
            <div className="divide-y divide-steel-50">
              {order.items.map((item, idx) => (
                <div key={idx} className="px-5 py-4 flex justify-between">
                  <div>
                    <p className="font-medium text-steel-900">{item.name}</p>
                    <p className="text-xs text-steel-500">SKU: {item.sku}</p>
                    {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedAttributes.map((attr, aIdx) => (
                          <span key={aIdx} className="text-xs bg-steel-100 text-steel-600 px-2 py-0.5 rounded">
                            {attr.name}: {attr.value}
                          </span>
                        ))}
                        {item.length && (
                          <span className="text-xs bg-steel-100 text-steel-600 px-2 py-0.5 rounded">
                            Length: {item.length}m
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm text-steel-600 mt-1">
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-steel-900">{formatCurrency(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="rounded-xl bg-white border border-steel-100 p-5">
              <h3 className="font-semibold text-steel-900 mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {order.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-steel-900 capitalize">{entry.status}</p>
                      <p className="text-xs text-steel-500">{formatDate(entry.timestamp)}</p>
                      {entry.note && <p className="text-sm text-steel-600 mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white border border-steel-100 p-5 space-y-3">
            <h3 className="font-semibold text-steel-900">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-steel-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-steel-500">GST (10%)</span><span>{formatCurrency(order.taxAmount)}</span></div>
              <div className="flex justify-between"><span className="text-steel-500">Shipping</span><span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>
              )}
              <div className="border-t border-steel-100 pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="rounded-xl bg-white border border-steel-100 p-5 space-y-2">
              <h3 className="font-semibold text-steel-900">Shipping Address</h3>
              <div className="text-sm text-steel-600">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postcode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl bg-white border border-steel-100 p-5 space-y-2">
            <h3 className="font-semibold text-steel-900">Payment</h3>
            <div className="text-sm text-steel-600">
              <p className="capitalize">{order.payment?.method || 'Card'}</p>
              <Badge variant={order.payment?.status === 'paid' ? 'success' : 'warning'}>
                {order.payment?.status || 'pending'}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-steel-100 p-5 space-y-2">
            <h3 className="font-semibold text-steel-900">Delivery</h3>
            <p className="text-sm text-steel-600 capitalize">{order.deliveryMethod || 'Standard Delivery'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
