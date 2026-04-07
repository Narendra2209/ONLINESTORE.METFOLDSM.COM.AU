'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Clock } from 'lucide-react';

const socials = [
  {
    label: 'Facebook', href: 'https://www.facebook.com/metfoldsheetmetal',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Instagram', href: 'https://www.instagram.com/metfoldsheetmetal',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    label: 'LinkedIn', href: 'https://www.linkedin.com/company/metfold-sheet-metal',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'YouTube', href: 'https://www.youtube.com/@metfoldsheetmetal',
    path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f1419]">
      {/* ── Main ─────────────────────────────────────────── */}
      <div className="container-main pt-14 pb-10">
        <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">

          {/* Col 1 — Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 pr-6">
            <Link href="/" className="inline-block">
              <img src="/images/logo.png" alt="Metfold Sheet Metal" className="h-10 w-auto" />
            </Link>
            <p className="mt-4 text-[13px] leading-relaxed text-[#8b949e] max-w-[280px]">
              Premium Colorbond roofing, cladding, fascia &amp; gutter, and custom sheet metal — delivered Australia-wide.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c2128] text-[#8b949e] hover:bg-brand-600 hover:text-white transition-all duration-200">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Products */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c9d1d9] mb-3">Products</h4>
            <ul className="space-y-2">
              {['Roofing', 'Cladding', 'Flashing', 'Fascia & Gutter', 'Downpipe', 'Rainwater Goods', 'Accessories'].map((n) => (
                <li key={n}>
                  <Link href={`/categories/${n.toLowerCase().replace(/ & /g, '-and-').replace(/ /g, '-')}`}
                    className="text-[13px] text-[#8b949e] hover:text-white transition-colors">{n}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company + Support */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c9d1d9] mb-3">Company</h4>
            <ul className="space-y-2">
              {[
                { n: 'About Us', h: '/about' }, { n: 'Contact', h: '/contact' },
                { n: 'Blog', h: '/blog' }, { n: 'FAQ', h: '/faq' },
              ].map((l) => (
                <li key={l.n}><Link href={l.h} className="text-[13px] text-[#8b949e] hover:text-white transition-colors">{l.n}</Link></li>
              ))}
            </ul>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c9d1d9] mb-3 mt-6">Support</h4>
            <ul className="space-y-2">
              {[
                { n: 'Track Order', h: '/track-order' }, { n: 'Shipping Info', h: '/shipping' },
                { n: 'Returns Policy', h: '/returns' },
              ].map((l) => (
                <li key={l.n}><Link href={l.h} className="text-[13px] text-[#8b949e] hover:text-white transition-colors">{l.n}</Link></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Branches + Contact */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c9d1d9] mb-3">Branches</h4>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              {[
                { name: 'Sunbury', addr: '51 McDougall Rd, Sunbury VIC 3429', ph: '(03) 9732 0148' },
                { name: 'Melton', addr: '16 Collins Rd, Melton VIC 3339', ph: '(03) 9747 9044' },
                { name: 'Pakenham', addr: '47 Sette CCT, Pakenham VIC 3810', ph: '(03) 5910 6099' },
                { name: 'Moama', addr: '11 Bowlan St, Moama NSW 2731', ph: '(03) 5482 1468' },
              ].map((b) => (
                <div key={b.name}>
                  <p className="text-[12px] font-semibold text-[#c9d1d9] mb-1">{b.name}</p>
                  <p className="text-[11px] text-[#8b949e] leading-snug mb-0.5">{b.addr}</p>
                  <a href={`tel:${b.ph.replace(/[() ]/g, '')}`} className="text-[11px] text-[#8b949e] hover:text-white transition-colors">
                    {b.ph}
                  </a>
                </div>
              ))}
            </div>

            {/* Contact strip */}
            <div className="mt-6 pt-5 border-t border-[#21262d]">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <a href="mailto:sales@metfold.com.au" className="flex items-center gap-1.5 text-[12px] text-[#8b949e] hover:text-white transition-colors">
                  <Mail className="h-3 w-3 text-brand-400" /> sales@metfold.com.au
                </a>
                <div className="flex items-center gap-1.5 text-[12px] text-[#8b949e]">
                  <Clock className="h-3 w-3 text-brand-400" /> Mon–Fri 7am – 4:30pm
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom ───────────────────────────────────────── */}
      <div className="border-t border-[#21262d]">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#484f58]">
            &copy; {new Date().getFullYear()} Metfold Sheet Metal. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#484f58]">
            <Link href="/terms" className="hover:text-[#8b949e] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[#8b949e] transition-colors">Privacy</Link>
            <Link href="/returns" className="hover:text-[#8b949e] transition-colors">Returns</Link>
            <Link href="/shipping" className="hover:text-[#8b949e] transition-colors">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
