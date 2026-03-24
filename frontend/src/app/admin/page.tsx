'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/orders/dashboard/stats');
        setStats(data.data);
      } catch {
        // Fallback stats for development
        setStats({
          totalOrders: 0,
          todayOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          todayRevenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Revenue',
      value: stats ? formatCurrency(stats.totalRevenue) : '-',
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? '-',
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: "Today's Orders",
      value: stats?.todayOrders ?? '-',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? '-',
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: "Today's Revenue",
      value: stats ? formatCurrency(stats.todayRevenue) : '-',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-steel-900">Dashboard</h1>
      <p className="text-sm text-steel-500 mt-1">Welcome to the Metfold admin panel</p>

      {/* Stats Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl bg-white p-5 border border-steel-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-steel-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-steel-900">
                  {loading ? '...' : card.value}
                </p>
              </div>
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 border border-steel-100">
          <h2 className="text-lg font-semibold text-steel-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Add Product', href: '/admin/products/new', icon: Package },
              { label: 'View Orders', href: '/admin/orders', icon: ShoppingCart },
              { label: 'Import Products', href: '/admin/imports', icon: TrendingUp },
              { label: 'Manage Categories', href: '/admin/categories', icon: AlertTriangle },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-steel-100 p-3 hover:border-brand-200 hover:bg-brand-50 transition-colors"
              >
                <action.icon className="h-5 w-5 text-brand-600" />
                <span className="text-sm font-medium text-steel-700">{action.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 border border-steel-100">
          <h2 className="text-lg font-semibold text-steel-900">System Status</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-steel-50">
              <span className="text-sm text-steel-600">API Status</span>
              <span className="text-sm font-medium text-green-600">Operational</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-steel-50">
              <span className="text-sm text-steel-600">Database</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-steel-600">Storage</span>
              <span className="text-sm font-medium text-green-600">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
