'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/order';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Search, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.data);
      setTotalPages(data.meta?.totalPages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const statusVariant = (status: string) => {
    const map: Record<string, any> = {
      pending: 'warning',
      confirmed: 'info',
      processing: 'info',
      packed: 'info',
      shipped: 'info',
      delivered: 'success',
      completed: 'success',
      cancelled: 'danger',
      refunded: 'danger',
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-steel-900">Orders</h1>

      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
            placeholder="Search by order number, customer..."
            className="w-full rounded-lg border border-steel-300 bg-white py-2 pl-9 pr-3 text-sm"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'completed', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 rounded-xl bg-white border border-steel-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-steel-100" /></td></tr>
              ))
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-steel-500">No orders found</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-steel-50/50">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-brand-600">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="text-steel-900">{(order as any).customerName}</div>
                    <div className="text-xs text-steel-500">{(order as any).customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-steel-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(order.status)}>{order.status}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={order.payment.status === 'paid' ? 'success' : 'warning'}>{order.payment.status}</Badge></td>
                  <td className="px-4 py-3 font-semibold text-steel-900">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order._id}`}>
                      <button className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  </td>
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
