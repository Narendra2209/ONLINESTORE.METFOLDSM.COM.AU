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

      {/* Social + Bottom bar */}
      <div className="border-t border-steel-800">
        <div className="container-main flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-steel-500">&copy; {new Date().getFullYear()} Metfold Sheet Metal. All rights reserved.</p>

          {/* Social Media */}
          <div className="flex items-center gap-3">
            <a href="https://www.facebook.com/metfoldsheetmetal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel-800 text-steel-400 hover:bg-brand-600 hover:text-white transition-colors" aria-label="Facebook">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/metfoldsheetmetal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel-800 text-steel-400 hover:bg-brand-600 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/metfold-sheet-metal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel-800 text-steel-400 hover:bg-brand-600 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.youtube.com/@metfoldsheetmetal" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg bg-steel-800 text-steel-400 hover:bg-brand-600 hover:text-white transition-colors" aria-label="YouTube">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs text-steel-500">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
