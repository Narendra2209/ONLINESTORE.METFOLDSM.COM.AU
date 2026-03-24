'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/axios';
import Badge from '@/components/ui/Badge';
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react';

interface RecentOrder {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ name: string }>;
}

export default function AccountDashboardPage() {
  const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, wishlistCount: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/orders?limit=5');
        setRecentOrders(data.data || []);
        setStats({
          totalOrders: data.meta?.total || 0,
          totalSpent: (data.data || []).reduce((sum: number, o: any) => sum + o.total, 0),
          wishlistCount: 0,
        });
      } catch {
        // silently fail
      }
    };
    fetchData();
  }, []);

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-steel-900">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-sm text-steel-500">
          {user?.userType === 'trade' ? 'Trade Account' : 'Retail Account'}
          {user?.company && ` — ${user.company}`}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl bg-white border border-steel-100 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Package className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-steel-900">{stats.totalOrders}</p>
            <p className="text-xs text-steel-500">Total Orders</p>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-steel-100 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <span className="text-lg font-bold text-green-600">$</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-steel-900">{formatCurrency(stats.totalSpent)}</p>
            <p className="text-xs text-steel-500">Total Spent</p>
          </div>
        </div>
        <div className="rounded-xl bg-white border border-steel-100 p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-steel-900">{stats.wishlistCount}</p>
            <p className="text-xs text-steel-500">Wishlist Items</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-steel-100">
          <h3 className="font-semibold text-steel-900">Recent Orders</h3>
          <Link href="/account/orders" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-steel-500">
            <p>No orders yet.</p>
            <Link href="/products" className="text-brand-600 hover:text-brand-700 text-sm mt-1 inline-block">
              Start shopping
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase">
              <tr>
                <th className="px-5 py-2.5">Order</th>
                <th className="px-5 py-2.5">Date</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-50">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-steel-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/account/orders/${order.orderNumber}`} className="font-medium text-brand-600 hover:text-brand-700">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-steel-600">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant(order.status) as any}>{order.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
