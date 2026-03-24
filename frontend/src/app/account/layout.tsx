'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  FileText,
} from 'lucide-react';

const accountNav = [
  { label: 'Dashboard', href: '/account', icon: LayoutDashboard },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Quotes', href: '/account/quotes', icon: FileText },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) fetchUser();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && !user) return;
    if (!user) router.push('/login');
  }, [user, isAuthenticated]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-steel-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-main section-padding">
      <h1 className="text-2xl font-bold text-steel-900 mb-6">My Account</h1>
      <div className="grid grid-cols-4 gap-8">
        <aside className="col-span-1">
          <nav className="space-y-1">
            {accountNav
              .filter((item) => item.href !== '/account/quotes' || user.userType === 'trade')
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-medium'
                        : 'text-steel-600 hover:bg-steel-50 hover:text-steel-900'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </nav>
        </aside>
        <div className="col-span-3">{children}</div>
      </div>
    </div>
  );
}
