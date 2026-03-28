'use client';

import React from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { MapPin, Phone, Warehouse, Shield, Truck, Users, Ruler, Wrench } from 'lucide-react';

const branches = [
  { name: 'METFOLD - SUNBURY', address: '51 McDougall Road, Sunbury, Victoria 3429', phone: '(03) 9732 0148' },
  { name: 'METFOLD - MELTON', address: '16 Collins Road, Melton, Victoria 3339', phone: '(03) 9747 9044' },
  { name: 'METFOLD - PAKENHAM', address: '47 Sette CCT, Pakenham, Victoria 3810', phone: '(03) 5910 6099' },
  { name: 'METFOLD - MOAMA', address: '11 Bowlan St, Moama, NSW 2731', phone: '(03) 5482 1468' },
];

const products = [
  { name: 'Roof Sheets', desc: 'Cliplock, Corodek, 5-Ribsheet, Metclad and more in Colorbond, Matt, Ultra and Zincalume finishes.' },
  { name: 'Custom Flashing', desc: 'Made-to-order flashing with custom folds, dimensions and profiles to suit any project.' },
  { name: 'Fascia & Gutter', desc: 'Fascia boards, OG gutters, quad gutters, squareline and half round gutters in all finishes.' },
  { name: 'Cladding', desc: 'Wall cladding and corrugated sheets for residential and commercial applications.' },
  { name: 'Downpipes', desc: 'Square and round downpipes in Colorbond, Matt Colorbond, Galvanised and Zinc.' },
  { name: 'Polycarbonate Sheets', desc: 'Corrugated and 5-rib polycarbonate sheeting in clear, tinted and opal finishes.' },
  { name: 'Rainwater Goods', desc: 'Sumps, rainheads, brackets, straps and fittings for complete rainwater systems.' },
  { name: 'Accessories', desc: 'Pop rivets, tek screws, silicone, foam infills and all the fixings you need.' },
];

const whyUs = [
  { icon: Warehouse, title: '4 Locations', desc: 'Branches across Victoria and NSW for fast local pickup and delivery.' },
  { icon: Ruler, title: 'Cut to Size', desc: 'Roof sheets and flashing cut to your exact measurements, no waste.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Same-day processing with Australia-wide shipping available.' },
  { icon: Shield, title: 'Quality Materials', desc: 'Genuine Colorbond, BlueScope steel and premium polycarbonate products.' },
  { icon: Users, title: 'Expert Advice', desc: 'Knowledgeable team to help you choose the right products for your project.' },
  { icon: Wrench, title: 'Trade & DIY', desc: 'Supplying builders, roofers, owner-builders and DIY enthusiasts since day one.' },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'About Us' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">About Metfold Sheet Metal</h1>
            <p className="mt-4 text-lg text-steel-300 leading-relaxed">
              Australian-owned and operated, Metfold Sheet Metal is a leading supplier of roofing, cladding,
              fascia, gutter, downpipe, and sheet metal products for residential and commercial projects across
              Victoria and New South Wales.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-steel-900">Our Story</h2>
          <div className="mt-4 space-y-4 text-steel-600 leading-relaxed">
            <p>
              Metfold Sheet Metal was founded with a simple mission: to provide tradespeople, builders, and
              homeowners with high-quality sheet metal products at competitive prices, backed by genuine expertise
              and reliable service.
            </p>
            <p>
              From our first workshop, we have grown to four branches across Victoria and New South Wales —
              in Sunbury, Melton, Pakenham, and Moama. Each location is fully stocked with Colorbond, Matt
              Colorbond, Ultra, Galvanised, Zincalume, and Zinc products ready for immediate pickup or delivery.
            </p>
            <p>
              We specialise in cut-to-size roof sheets, custom flashing made to your exact specifications,
              and a complete range of fascia, gutter, downpipe, and rainwater goods. Whether you are a professional
              roofer working on a large commercial project or a homeowner tackling a weekend renovation, we have
              the products and knowledge to get the job done right.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-steel-900">What We Offer</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.name} className="rounded-xl border border-steel-100 bg-steel-50/50 p-5">
                <h3 className="text-sm font-bold text-steel-900">{p.name}</h3>
                <p className="mt-2 text-xs text-steel-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-steel-900">Why Choose Metfold</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-steel-900">{item.title}</h3>
                  <p className="mt-1 text-xs text-steel-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Branches */}
        <div className="mt-16 mb-12">
          <h2 className="text-2xl font-bold text-steel-900">Our Branches</h2>
          <p className="mt-2 text-sm text-steel-500">Visit us at any of our four locations across Victoria and NSW.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {branches.map((branch) => (
              <div key={branch.name} className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-steel-900">{branch.name}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2 text-xs text-steel-500">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-brand-600" />
                    <span>{branch.address}</span>
                  </div>
                  <a href={`tel:${branch.phone.replace(/[() ]/g, '')}`} className="flex items-center gap-2 text-xs text-steel-500 hover:text-brand-600 transition-colors">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                    <span>{branch.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
