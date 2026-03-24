'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Sliders,
  ShoppingCart,
  Users,
  Upload,
  Settings,
  LogOut,
  ChevronLeft,
  UserCog,
} from 'lucide-react';

const adminRoles = ['super_admin', 'admin', 'manager', 'sales_staff', 'inventory_staff', 'content_staff'];

const sidebarItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Attributes', href: '/admin/attributes', icon: Sliders },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Imports', href: '/admin/imports', icon: Upload },
  { label: 'Users & Roles', href: '/admin/users', icon: UserCog },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        await fetchUser();
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else if (!adminRoles.includes(user.role)) {
      router.push('/');
    }
  }, [user, isAuthenticated, authChecked]);

  if (!authChecked || !user || !adminRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-steel-500">Loading admin...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-steel-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-steel-900 text-white">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-steel-800">
          <LayoutDashboard className="h-5 w-5 text-brand-400" />
          <span className="text-base font-bold tracking-wide">Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {sidebarItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-steel-300 hover:bg-steel-800 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-steel-800 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-steel-400 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="mt-1 flex gap-1">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs text-steel-400 hover:bg-steel-800 hover:text-white"
            >
              <ChevronLeft className="h-3 w-3" />
              Store
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs text-steel-400 hover:bg-steel-800 hover:text-white"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
