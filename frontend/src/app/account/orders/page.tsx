'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

interface OrderItem {
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  length?: number;
  pricingModel?: string;
  selectedAttributes?: Array<{ attributeName: string; value: string }>;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  items: OrderItem[];
  deliveryMethod: string;
  createdAt: string;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders?page=${page}&limit=10`);
        setOrders(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      } catch {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  const statusVariant = (status: string) => {
    switch (status) {
      case 'delivered': case 'completed': return 'success';
      case 'shipped': return 'info';
      case 'processing': case 'confirmed': return 'warning';
      case 'cancelled': case 'refunded': return 'danger';
      default: return 'default';
    }
  };

  if (!loading && orders.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-steel-900 mb-4">My Orders</h2>
        <div className="rounded-xl bg-white border border-steel-100 p-12 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-steel-300" />
          <p className="mt-3 text-steel-500">No orders yet</p>
          <Link href="/products" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-steel-900 mb-4">My Orders</h2>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 p-5 animate-pulse">
              <div className="h-5 w-40 bg-steel-100 rounded mb-3" />
              <div className="h-4 w-full bg-steel-50 rounded mb-2" />
              <div className="h-4 w-2/3 bg-steel-50 rounded" />
            </div>
          ))
        ) : (
          orders.map((order) => (
            <Link
              key={order._id}
              href={`/account/orders/${order.orderNumber}`}
              className="block rounded-xl bg-white border border-steel-100 p-5 hover:border-brand-200 hover:shadow-sm transition-all"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-steel-900">{order.orderNumber}</span>
                  <Badge variant={statusVariant(order.status) as any}>{order.status}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-steel-500">
                  <span>{formatDate(order.createdAt)}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-steel-50 border border-steel-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-steel-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-steel-800 truncate">{item.productName}</p>
                      <div className="flex items-center gap-2 text-xs text-steel-500">
                        <span>Qty: {item.quantity}</span>
                        {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                          <>
                            <span className="text-steel-300">|</span>
                            <span className="truncate">
                              {item.selectedAttributes.map(a => a.value).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-medium text-steel-700 flex-shrink-0">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-steel-400 pl-13">+{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-3 pt-3 border-t border-steel-100 flex items-center justify-between">
                <span className="text-xs text-steel-500 capitalize">
                  {order.deliveryMethod || 'delivery'} &bull; {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
                <span className="text-base font-bold text-steel-900">{formatCurrency(order.total)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
