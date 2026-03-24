'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{ name: string; quantity: number }>;
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
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': case 'confirmed': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-steel-900 mb-4">My Orders</h2>

      <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 w-full animate-pulse rounded bg-steel-100" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-steel-500">No orders found</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-steel-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/account/orders/${order.orderNumber}`} className="font-medium text-brand-600 hover:text-brand-700">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-steel-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-3 text-steel-600">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant(order.status) as any}>{order.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
