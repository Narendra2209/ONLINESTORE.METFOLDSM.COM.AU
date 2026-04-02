'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { HelpCircle, ChevronDown, ShoppingCart, Truck, RotateCcw, Ruler, CreditCard, Users, Phone, Mail } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  icon: typeof HelpCircle;
  faqs: FaqItem[];
}

const faqCategories: FaqCategory[] = [
  {
    title: 'Ordering & Products',
    icon: ShoppingCart,
    faqs: [
      {
        question: 'How do I place an order?',
        answer: 'Browse our product range, select the items you need, configure sizes and colours, add them to your cart, and proceed to checkout. You can order as a guest or create an account for faster future orders and order tracking.',
      },
      {
        question: 'Can I order custom-cut roof sheets and flashing?',
        answer: 'Yes! We specialise in cut-to-size products. Roof sheets can be ordered in custom lengths, and flashing can be made to your exact dimensions and fold specifications. Simply enter your measurements when configuring the product on our website.',
      },
      {
        question: 'What materials and finishes do you offer?',
        answer: 'We stock Colorbond, Matt Colorbond, Ultra Matt, Zincalume, Galvanised, and Zinc finishes. For polycarbonate, we offer clear, tinted, and opal options. All Colorbond colours are available — if you don\'t see your colour online, contact us.',
      },
      {
        question: 'Can I modify or cancel my order after placing it?',
        answer: 'Standard stock orders can be modified or cancelled if they have not yet been dispatched. Custom-cut and made-to-order products cannot be cancelled or modified once production has started. Contact us as soon as possible if you need changes.',
      },
      {
        question: 'Do you offer samples?',
        answer: 'Yes, we can provide Colorbond colour samples. Contact your nearest branch to request colour swatches. For online colour references, please note that screen displays may not accurately represent the true colour.',
      },
      {
        question: 'What is the minimum order quantity?',
        answer: 'There is no minimum order quantity for standard stock items. For custom-cut products, minimum lengths may apply depending on the product type. Check the product page for specific details.',
      },
    ],
  },
  {
    title: 'Delivery & Pickup',
    icon: Truck,
    faqs: [
      {
        question: 'Do you deliver Australia-wide?',
        answer: 'Yes, we deliver across Australia. Melbourne metro deliveries typically arrive in 1-3 business days. Regional Victoria and NSW in 2-5 days. Interstate deliveries in 5-10 business days. Contact us for remote area delivery quotes.',
      },
      {
        question: 'How much does delivery cost?',
        answer: 'Delivery costs are calculated at checkout based on the size, weight, and destination of your order. For large or heavy orders, we recommend contacting us for a custom delivery quote. Click & Collect from any branch is always free.',
      },
      {
        question: 'Can I pick up my order from a branch?',
        answer: 'Absolutely! Select "Click & Collect" at checkout and choose your preferred branch (Sunbury, Melton, Pakenham, or Moama). You\'ll receive an email notification when your order is ready for collection. Please bring ID and your order confirmation.',
      },
      {
        question: 'What are your branch opening hours?',
        answer: 'All branches are open Monday to Friday, 7:00am to 4:30pm. We are closed on weekends and public holidays. During peak periods, hours may extend — check with your local branch.',
      },
      {
        question: 'What if my order arrives damaged?',
        answer: 'Please inspect all goods upon delivery. If you notice any damage, take photos immediately and contact us within 48 hours. Keep the original packaging. We will arrange a replacement or refund at no cost to you.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: RotateCcw,
    faqs: [
      {
        question: 'What is your returns policy?',
        answer: 'Standard stock items can be returned within 14 days in original, unopened packaging. A 15% restocking fee may apply. Custom-cut products (roof sheets, flashing, cladding) cannot be returned unless defective. See our full Returns Policy for details.',
      },
      {
        question: 'How long do refunds take?',
        answer: 'Once we receive and inspect the returned product, refunds are processed within 5-10 business days to your original payment method. Card refunds may take an additional 3-5 business days to appear on your statement.',
      },
      {
        question: 'Can I exchange a product instead of getting a refund?',
        answer: 'Yes, we offer exchanges for standard stock items. Contact us with your order number and the product you\'d like to exchange for. The product must be in original, unused condition.',
      },
    ],
  },
  {
    title: 'Custom Flashing & Sizing',
    icon: Ruler,
    faqs: [
      {
        question: 'How do I order custom flashing?',
        answer: 'Use our online flashing configurator to specify the profile type, dimensions (width, length, depth), fold angles, and colour. The price is calculated automatically based on your specifications. For complex profiles, contact us with a sketch or drawing.',
      },
      {
        question: 'What is the lead time for custom products?',
        answer: 'Standard custom-cut roof sheets and flashing are typically ready within 1-3 business days. Complex or large quantity orders may take longer. You\'ll receive a notification when your order is ready for pickup or dispatch.',
      },
      {
        question: 'Can you manufacture from my drawings?',
        answer: 'Yes! If you have specific flashing profiles or sheet metal requirements, email your drawings or sketches to sales@metfold.com.au. Our team will review and provide a quote. We can work from hand-drawn sketches, CAD files, or PDF plans.',
      },
      {
        question: 'What are the maximum and minimum sizes for custom cuts?',
        answer: 'Roof sheets can be cut from 0.5m to 12m in length. Flashing dimensions vary by profile — typical widths range from 50mm to 900mm. For sizes outside these ranges, please contact us to discuss your requirements.',
      },
    ],
  },
  {
    title: 'Payment & Pricing',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Visa, Mastercard, and debit cards via our secure payment gateway (Stripe). All transactions are encrypted and secure. For trade accounts, alternative payment terms may be available.',
      },
      {
        question: 'Are prices shown including GST?',
        answer: 'Yes, all prices displayed on our website include GST (10%). GST is itemised separately on your invoice and order confirmation.',
      },
      {
        question: 'Do you offer trade pricing?',
        answer: 'Yes, we offer competitive trade pricing for builders, roofers, and trade professionals. Apply for a trade account during registration. Once approved, you\'ll see trade pricing automatically when logged in.',
      },
      {
        question: 'Can I get a quote before ordering?',
        answer: 'Yes! For large projects or custom requirements, contact us for a detailed quote. You can also use our "Request a Quote" option on product pages for items marked as quote-only.',
      },
    ],
  },
  {
    title: 'Accounts & Trade',
    icon: Users,
    faqs: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Register" in the top navigation. Choose between a retail account (instant approval) or trade account (requires ABN and approval). Trade accounts need to verify their email with an OTP code.',
      },
      {
        question: 'How do I apply for a trade account?',
        answer: 'During registration, select "Trade Account" and provide your company name, ABN, and contact details. Our team will review your application, typically within 1-2 business days. You\'ll receive an email once approved.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password" on the login page. Enter your email address, and we\'ll send you a 6-digit OTP code. Enter the code, then set a new password. The code expires after 10 minutes.',
      },
      {
        question: 'Can I save multiple delivery addresses?',
        answer: 'Yes, registered users can save multiple delivery addresses in their account. This makes checkout faster for repeat orders to different job sites or locations.',
      },
    ],
  },
];

function FaqAccordion({ faq, isOpen, onToggle }: { faq: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-steel-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left group"
      >
        <span className={`text-sm font-medium pr-4 ${isOpen ? 'text-brand-600' : 'text-steel-800 group-hover:text-brand-600'} transition-colors`}>
          {faq.question}
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-steel-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
        <p className="text-sm text-steel-600 leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'FAQ' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
            </div>
            <p className="text-lg text-steel-300 leading-relaxed">
              Find answers to common questions about our products, ordering, delivery, and services.
            </p>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mt-10 space-y-8 mb-12">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <category.icon className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-steel-900">{category.title}</h2>
              </div>
              <div className="rounded-xl border border-steel-100 bg-white px-5">
                {category.faqs.map((faq, i) => {
                  const key = `${category.title}-${i}`;
                  return (
                    <FaqAccordion
                      key={key}
                      faq={faq}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggleItem(key)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mb-12 rounded-xl border border-steel-100 bg-steel-50/50 p-6 sm:p-8 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-steel-300" />
          <h2 className="mt-3 text-xl font-bold text-steel-900">Still Have Questions?</h2>
          <p className="mt-2 text-sm text-steel-500 max-w-md mx-auto">
            Can&apos;t find the answer you&apos;re looking for? Our team is happy to help.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="tel:0397320148" className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
              <Phone className="h-4 w-4" />
              1800 638 3635
            </a>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg border border-steel-200 bg-white px-5 py-2.5 text-sm font-medium text-steel-700 hover:bg-steel-50 transition-colors">
              <Mail className="h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
