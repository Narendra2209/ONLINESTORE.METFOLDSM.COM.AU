'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, LogOut, Phone, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';

interface NavItem {
  name: string;
  href: string;
  children?: NavItem[];
}

// Fallback navigation (used while API loads)
const fallbackNavigation: NavItem[] = [
  { name: 'Flashing', href: '/flashing' },
  { name: 'Cladding', href: '/categories/cladding' },
  { name: 'Roofing', href: '/categories/roofing' },
  { name: 'Fascia & Gutter', href: '/categories/fascia-and-gutter' },
  { name: 'Downpipe', href: '/categories/downpipe' },
  { name: 'RainWater Goods', href: '/categories/rainwater-goods' },
  { name: 'Accessories', href: '/categories/accessories' },
];

// Special routes for top-level categories that have custom pages
const SPECIAL_ROUTES: Record<string, string> = {
  'flashing': '/flashing',
  'flashings': '/flashing',
};

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [navigation, setNavigation] = useState<NavItem[]>(fallbackNavigation);

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.role && ['super_admin', 'admin', 'manager', 'sales_staff', 'inventory_staff', 'content_staff'].includes(user.role);

  // Fetch categories from API and build navigation
  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        const tree = res.data?.data || [];
        if (tree.length === 0) return;

        // API returns tree: [{name, slug, children: [{name, slug, children: []}]}]
        const nav: NavItem[] = tree.map((parent: any) => {
          const children = (parent.children || []).map((child: any) => ({
            name: child.name,
            href: SPECIAL_ROUTES[child.slug] || `/categories/${child.slug}`,
          }));

          return {
            name: parent.name,
            href: SPECIAL_ROUTES[parent.slug] || `/categories/${parent.slug}`,
            ...(children.length > 0 ? { children } : {}),
          };
        });

        if (nav.length > 0) setNavigation(nav);
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={cn(
      'sticky top-0 z-40 transition-shadow duration-300',
      scrolled ? 'shadow-md' : 'shadow-sm'
    )}>
      {/* Top bar */}
      <div className="bg-gradient-to-r from-steel-900 via-steel-900 to-steel-800 text-white">
        <div className="container-main flex items-center justify-between py-1.5 sm:py-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-400" />
            <span className="font-semibold">1300 XXX XXX</span>
            <span className="hidden md:inline text-steel-400 mx-2">|</span>
            <span className="hidden md:inline text-steel-300">Australian Industrial Roofing & Sheet Metal Supplies</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="text-steel-300 hover:text-white transition-colors text-xs sm:text-sm">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-steel-100">
        <div className="container-main flex items-center justify-between py-3 sm:py-4">
          {/* Logo — left corner */}
          <Link href="/" className="flex-shrink-0 group">
            <Image
              src="/images/logo.png"
              alt="Metfold Sheet Metal"
              width={300}
              height={75}
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              priority
            />
          </Link>

          {/* Search bar — hidden on mobile, shown on tablet+ */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md lg:max-w-xl mx-4 lg:mx-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-steel-200 bg-steel-50/50 py-2 lg:py-2.5 pl-10 lg:pl-11 pr-4 text-sm
                  focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20
                  group-hover:border-steel-300 transition-all duration-200"
              />
              <Search className="absolute left-3 lg:left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
          </form>

          {/* Right actions — cart + sign up */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Mobile search toggle */}
            <button
              className="md:hidden rounded-xl p-2 sm:p-2.5 text-steel-500 hover:bg-steel-50 hover:text-steel-700 transition-colors"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User menu / Sign Up — right corner */}
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={() => setShowUserMenu(true)}
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <button className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-sm text-steel-600 hover:bg-steel-50 transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline font-medium text-xs md:text-sm">{user?.firstName}</span>
                  <ChevronDown className={cn('hidden sm:block h-3 w-3 transition-transform duration-200', showUserMenu && 'rotate-180')} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full z-50 min-w-[200px] rounded-xl bg-white py-2 shadow-xl border border-steel-100 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-steel-100">
                      <p className="text-sm font-medium text-steel-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-steel-500">{user?.email}</p>
                    </div>
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-steel-600 hover:bg-steel-50 transition-colors">
                      My Account
                    </Link>
                    <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-steel-600 hover:bg-steel-50 transition-colors">
                      My Orders
                    </Link>
                    <div className="my-1 border-t border-steel-100" />
                    <button
                      onClick={() => { logout(); router.push('/'); }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-steel-600 hover:bg-steel-50 transition-colors"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline sm:inline">Sign In</span>
              </Link>
            )}

            {/* Admin Dashboard — left of cart, only for admin users */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-xl px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}

            {/* Cart — right corner */}
            <button
              onClick={() => router.push('/cart')}
              className="relative rounded-xl p-2 sm:p-2.5 text-steel-500 hover:bg-steel-50 hover:text-steel-700 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-accent-500 text-[9px] sm:text-[10px] font-bold text-white ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden rounded-xl p-2 sm:p-2.5 text-steel-500 hover:bg-steel-50 hover:text-steel-700 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t border-steel-100 animate-fade-in-up">
            <form onSubmit={handleSearch} className="container-main py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl border border-steel-200 bg-steel-50 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden lg:block bg-white border-b border-steel-100">
        <div className="container-main">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold transition-colors duration-200',
                    activeDropdown === item.name
                      ? 'text-brand-600'
                      : 'text-steel-700 hover:text-brand-600'
                  )}
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      activeDropdown === item.name && 'rotate-180'
                    )} />
                  )}
                  {/* Active indicator */}
                  <span className={cn(
                    'absolute bottom-0 left-5 right-5 h-0.5 bg-brand-600 rounded-full transition-transform duration-200 origin-left',
                    activeDropdown === item.name ? 'scale-x-100' : 'scale-x-0'
                  )} />
                </Link>
                {item.children && activeDropdown === item.name && (
                  <div className="absolute left-0 top-full z-50 min-w-[240px] rounded-b-xl bg-white py-2 shadow-xl border border-t-0 border-steel-100 animate-fade-in-up">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-steel-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-steel-300" />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/products"
                className="flex items-center px-4 py-3.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                All Products
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-steel-100 shadow-lg animate-fade-in-up">
          <div className="container-main py-4 space-y-1 max-h-[70vh] overflow-y-auto">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-steel-700 hover:bg-steel-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                  {item.children && <ChevronDown className="h-3.5 w-3.5 text-steel-400" />}
                </Link>
                {item.children && (
                  <div className="ml-4 border-l-2 border-steel-100 pl-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-steel-500 hover:bg-steel-50 hover:text-brand-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-steel-100 pt-3 mt-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-steel-700 hover:bg-steel-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); router.push('/'); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
