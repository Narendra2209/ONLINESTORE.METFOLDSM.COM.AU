'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowRight, Shield, Truck, Clock, CreditCard } from 'lucide-react';

const footerLinks = {
  products: [
    { name: 'Flashing', href: '/categories/flashing' },
    { name: 'Roofing', href: '/categories/roofing' },
    { name: 'Cladding', href: '/categories/cladding' },
    { name: 'Fascia & Gutter', href: '/categories/fascia-and-gutter' },
    { name: 'Downpipe', href: '/categories/downpipe' },
    { name: 'Rainwater Goods', href: '/categories/rainwater-goods' },
    { name: 'Accessories', href: '/categories/accessories' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'FAQ', href: '/faq' },
  ],
  support: [
    { name: 'Track Order', href: '/account/orders' },
    { name: 'Shipping Info', href: '/shipping' },
    { name: 'Returns Policy', href: '/returns' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
};

const trustBadges = [
  { icon: Truck, label: 'Fast Delivery', sub: 'Australia-wide shipping' },
  { icon: Shield, label: 'Quality Guaranteed', sub: 'Premium materials' },
  { icon: Clock, label: 'Quick Turnaround', sub: 'Same-day processing' },
  { icon: CreditCard, label: 'Secure Payment', sub: 'SSL encrypted checkout' },
];

export default function Footer() {
  return (
    <footer className="bg-steel-900 text-steel-300">
      {/* Trust badges */}
      <div className="border-b border-steel-800">
        <div className="container-main py-5 sm:py-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-start gap-3 group">
                <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/10 text-brand-400 group-hover:bg-brand-600/20 transition-colors">
                  <badge.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{badge.label}</p>
                  <p className="text-xs text-steel-400">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-main py-8 sm:py-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand + Branches */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4">
              <img
                src="/images/logo.png"
                alt="Metfold Sheet Metal"
                className="h-12 w-auto"
              />
            </div>
            <p className="mb-5 text-sm leading-relaxed text-steel-400 max-w-sm">
              Premium roofing, cladding, and sheet metal products for residential and commercial projects across Australia.
            </p>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white">Our Branches</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Sunbury', address: '51 McDougall Road, Sunbury, VIC 3429', phone: '(03) 9732 0148' },
                { name: 'Melton', address: '16 Collins Road, Melton, VIC 3339', phone: '(03) 9747 9044' },
                { name: 'Pakenham', address: '47 Sette CCT, Pakenham, VIC 3810', phone: '(03) 5910 6099' },
                { name: 'Moama', address: '11 Bowlan St, Moama, NSW 2731', phone: '(03) 5482 1468' },
              ].map((branch) => (
                <div key={branch.name} className="rounded-lg bg-steel-800/50 p-3">
                  <p className="text-xs font-bold text-white mb-1">METFOLD - {branch.name.toUpperCase()}</p>
                  <div className="flex items-start gap-1.5 text-[11px] text-steel-400 mb-1">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-brand-400" />
                    <span>{branch.address}</span>
                  </div>
                  <a href={`tel:${branch.phone.replace(/[() ]/g, '')}`} className="flex items-center gap-1.5 text-[11px] text-steel-400 hover:text-white transition-colors">
                    <Phone className="h-3 w-3 flex-shrink-0 text-brand-400" />
                    <span>{branch.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Products</h3>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center gap-1.5 text-sm text-steel-400 hover:text-white transition-colors">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-steel-800">
        <div className="container-main flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
          <p className="text-steel-500">&copy; {new Date().getFullYear()} Metfold Sheet Metal. All rights reserved.</p>
          <div className="flex items-center gap-4 text-steel-500">
            <span>ABN: XX XXX XXX XXX</span>
            <span className="text-steel-700">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
