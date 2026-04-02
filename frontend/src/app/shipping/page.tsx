'use client';

import React from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { Truck, MapPin, Phone, Clock, Package, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

const branches = [
  { name: 'Sunbury', address: '51 McDougall Road, Sunbury, VIC 3429', phone: '(03) 9732 0148', hours: 'Mon-Fri: 7am - 4:30pm' },
  { name: 'Melton', address: '16 Collins Road, Melton, VIC 3339', phone: '(03) 9747 9044', hours: 'Mon-Fri: 7am - 4:30pm' },
  { name: 'Pakenham', address: '47 Sette CCT, Pakenham, VIC 3810', phone: '(03) 5910 6099', hours: 'Mon-Fri: 7am - 4:30pm' },
  { name: 'Moama', address: '11 Bowlan St, Moama, NSW 2731', phone: '(03) 5482 1468', hours: 'Mon-Fri: 7am - 4:30pm' },
];

const deliveryZones = [
  { zone: 'Melbourne Metro', time: '1-3 business days', note: 'Covers all suburbs within the Melbourne metropolitan area' },
  { zone: 'Regional Victoria', time: '2-5 business days', note: 'Geelong, Ballarat, Bendigo, Shepparton, Wodonga, and surrounding areas' },
  { zone: 'Regional NSW', time: '2-5 business days', note: 'Murray region, Riverina, and bordering NSW areas' },
  { zone: 'Rest of Australia', time: '5-10 business days', note: 'Interstate delivery via freight carriers — contact us for a quote' },
];

const tips = [
  'Ensure someone is available at the delivery address to receive the goods',
  'Check access for large delivery vehicles — inform us of any tight streets, low clearances, or restricted access',
  'Inspect all goods upon delivery and report any damage within 48 hours',
  'Roof sheets and long materials require adequate clearance and may need crane or forklift unloading',
  'For site deliveries, ensure a clear, flat area for unloading',
];

export default function ShippingPage() {
  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Shipping Information' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Truck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Shipping Information</h1>
            </div>
            <p className="text-lg text-steel-300 leading-relaxed">
              We deliver across Australia with fast local delivery from our four branches in Victoria and NSW.
            </p>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">Delivery Options</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="rounded-xl border border-steel-100 bg-steel-50/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-steel-900">Standard Delivery</h3>
                  <p className="text-xs text-steel-500">Direct to your door or job site</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Delivery to residential and commercial addresses
                </li>
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Site delivery for construction projects
                </li>
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Shipping cost calculated at checkout based on size, weight, and destination
                </li>
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Delivery notification via email with tracking details
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-steel-100 bg-steel-50/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-steel-900">Click & Collect</h3>
                  <p className="text-xs text-steel-500">Pick up from any Metfold branch</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  FREE — no shipping charges
                </li>
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Select your preferred branch at checkout
                </li>
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Email notification when your order is ready
                </li>
                <li className="flex items-start gap-2 text-sm text-steel-600">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  Collect within 14 days of order being ready
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Delivery Timeframes */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">Estimated Delivery Times</h2>
          <p className="mt-2 text-sm text-steel-500">Delivery times are estimates and may vary based on product availability and custom order lead times.</p>
          <div className="mt-5 overflow-hidden rounded-xl border border-steel-100">
            <table className="w-full">
              <thead>
                <tr className="bg-steel-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-steel-700 uppercase tracking-wider">Delivery Zone</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-steel-700 uppercase tracking-wider">Estimated Time</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-steel-700 uppercase tracking-wider hidden sm:table-cell">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {deliveryZones.map((zone) => (
                  <tr key={zone.zone} className="hover:bg-steel-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-steel-900">{zone.zone}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-sm text-steel-600">
                        <Clock className="h-3.5 w-3.5 text-brand-500" />
                        {zone.time}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-steel-500 hidden sm:table-cell">{zone.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping Cost */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">Shipping Costs</h2>
          <div className="mt-4 space-y-3 text-sm text-steel-600 leading-relaxed">
            <p>
              Shipping costs are calculated at checkout based on the total weight, dimensions, and delivery destination of your order.
              Oversized items such as long roof sheets and flashing may require specialised freight.
            </p>
            <p>
              For large or heavy orders, or deliveries to remote areas, please{' '}
              <Link href="/contact" className="text-brand-600 hover:underline">contact us</Link>{' '}
              for a custom delivery quote before placing your order.
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-800">Custom & Made-to-Order Products</h3>
              <p className="mt-1 text-sm text-amber-700 leading-relaxed">
                Custom-cut roof sheets, flashing, and cladding panels require manufacturing time.
                Please allow an additional 1-3 business days for production before shipping.
                You will be notified when your order is dispatched.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Tips */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">Delivery Tips</h2>
          <div className="mt-4 space-y-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-xs font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-steel-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Locations */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-bold text-steel-900">Pickup Locations</h2>
          <p className="mt-2 text-sm text-steel-500">Collect your order from any of our four branches.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {branches.map((branch) => (
              <div key={branch.name} className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-steel-900">METFOLD - {branch.name.toUpperCase()}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-start gap-2 text-xs text-steel-500">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-brand-600" />
                    <span>{branch.address}</span>
                  </div>
                  <a href={`tel:${branch.phone.replace(/[() ]/g, '')}`} className="flex items-center gap-2 text-xs text-steel-500 hover:text-brand-600 transition-colors">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                    <span>{branch.phone}</span>
                  </a>
                  <div className="flex items-center gap-2 text-xs text-steel-500">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                    <span>{branch.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
