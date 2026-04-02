'use client';

import React from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Clock, Phone, Mail, PackageX } from 'lucide-react';

const eligibleItems = [
  'Standard stock items in original, unopened packaging',
  'Products that are unused and in resalable condition',
  'Incorrect items shipped by Metfold (our error)',
  'Damaged or defective products (reported within 48 hours of delivery)',
  'Products with manufacturing faults',
];

const nonEligibleItems = [
  'Custom-cut roof sheets (cut to your specified length)',
  'Custom-made flashing (made to your dimensions)',
  'Custom-cut cladding panels',
  'Opened or used products',
  'Products damaged due to improper handling or storage by the customer',
  'Products returned after 14 days from date of purchase',
  'Items without proof of purchase (receipt or order number)',
];

const steps = [
  {
    step: '1',
    title: 'Contact Us',
    desc: 'Call or email us with your order number and reason for return. Our team will assess your request and provide a Return Authorisation (RA) number.',
  },
  {
    step: '2',
    title: 'Pack the Product',
    desc: 'Repack the item securely in its original packaging. Include your RA number and a copy of your receipt or order confirmation.',
  },
  {
    step: '3',
    title: 'Return the Product',
    desc: 'Drop the product at any Metfold branch or arrange a return shipment. Return shipping costs are the responsibility of the customer unless the return is due to our error.',
  },
  {
    step: '4',
    title: 'Refund or Exchange',
    desc: 'Once received and inspected, we will process your refund to the original payment method within 5-10 business days, or arrange an exchange.',
  },
];

export default function ReturnsPage() {
  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Returns Policy' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Returns Policy</h1>
            </div>
            <p className="text-lg text-steel-300 leading-relaxed">
              We stand behind the quality of our products. If you are not satisfied with your purchase,
              please review our returns policy below.
            </p>
          </div>
        </div>

        {/* Eligibility */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-steel-900">Eligible for Return</h2>
            </div>
            <ul className="space-y-3">
              {eligibleItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-sm text-steel-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold text-steel-900">Not Eligible for Return</h2>
            </div>
            <ul className="space-y-3">
              {nonEligibleItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-sm text-steel-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800">Important: Custom & Cut-to-Size Products</h3>
            <p className="mt-1 text-sm text-amber-700 leading-relaxed">
              Custom-cut roof sheets, flashing, and cladding panels are made to your specific measurements
              and cannot be returned or exchanged unless they are defective or we made an error in manufacturing.
              Please double-check all dimensions before placing your order.
            </p>
          </div>
        </div>

        {/* Return Process */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">How to Return a Product</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="rounded-xl border border-steel-100 bg-steel-50/50 p-5 relative">
                <span className="text-3xl font-bold text-brand-600/20">{s.step}</span>
                <h3 className="mt-2 text-sm font-bold text-steel-900">{s.title}</h3>
                <p className="mt-2 text-xs text-steel-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Info */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">Refund Information</h2>
          <div className="mt-4 space-y-4 text-sm text-steel-600 leading-relaxed">
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-0.5 text-brand-600 flex-shrink-0" />
              <p><strong className="text-steel-900">Processing Time:</strong> Refunds are processed within 5-10 business days after we receive and inspect the returned product.</p>
            </div>
            <div className="flex items-start gap-3">
              <PackageX className="h-4 w-4 mt-0.5 text-brand-600 flex-shrink-0" />
              <p><strong className="text-steel-900">Restocking Fee:</strong> A 15% restocking fee may apply to standard returns that are not due to a Metfold error.</p>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="h-4 w-4 mt-0.5 text-brand-600 flex-shrink-0" />
              <p><strong className="text-steel-900">Refund Method:</strong> Refunds are issued to the original payment method. For card payments, please allow an additional 3-5 business days for your bank to process the refund.</p>
            </div>
          </div>
        </div>

        {/* Damaged Goods */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">Damaged or Faulty Goods</h2>
          <div className="mt-4 text-sm text-steel-600 leading-relaxed space-y-3">
            <p>
              If your order arrives damaged or you discover a manufacturing fault, please contact us within
              <strong className="text-steel-900"> 48 hours</strong> of receiving the product. To help us process your claim quickly:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                Take clear photos of the damage or defect
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                Keep the original packaging and all materials
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                Provide your order number and a description of the issue
              </li>
            </ul>
            <p>We will arrange a replacement, exchange, or full refund including shipping costs at no charge to you.</p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 mb-12 rounded-xl border border-steel-100 bg-steel-50/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-steel-900">Need Help with a Return?</h2>
          <p className="mt-2 text-sm text-steel-500">Contact our team and we'll guide you through the process.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <a href="tel:18006383635" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
              <Phone className="h-4 w-4" />
              1800 638 3635
            </a>
            <a href="mailto:orders@metfold.com.au" className="inline-flex items-center gap-2 rounded-lg border border-steel-200 bg-white px-5 py-2.5 text-sm font-medium text-steel-700 hover:bg-steel-50 transition-colors">
              <Mail className="h-4 w-4" />
              order@metfold.com.au
            </a>
          </div>
          <p className="mt-4 text-xs text-steel-400">
            Your rights under the Australian Consumer Law are not affected by this returns policy.
            For more information, visit the{' '}
            <a href="https://www.accc.gov.au/consumers/consumer-rights-guarantees" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
              ACCC website
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
