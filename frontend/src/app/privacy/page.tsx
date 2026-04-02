'use client';

import React from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { ShieldCheck, Eye, Database, Lock, UserCheck, Globe, Cookie, Mail } from 'lucide-react';

const dataCollected = [
  {
    icon: UserCheck,
    title: 'Account Information',
    items: ['Full name', 'Email address', 'Phone number', 'Company name and ABN (trade accounts)', 'Account password (encrypted)'],
  },
  {
    icon: Database,
    title: 'Order Information',
    items: ['Delivery and billing addresses', 'Order history and details', 'Payment information (processed securely via Stripe — we do not store card numbers)', 'Communication preferences'],
  },
  {
    icon: Globe,
    title: 'Website Usage Data',
    items: ['IP address and browser type', 'Pages visited and time spent on site', 'Referring website or search terms', 'Device type and operating system'],
  },
];

const sections = [
  {
    title: 'How We Use Your Information',
    content: [
      'We use the personal information we collect for the following purposes:',
    ],
    list: [
      'Processing and fulfilling your orders, including delivery and pickup',
      'Sending order confirmations, shipping notifications, and status updates via email',
      'Sending OTP verification codes for account registration and password resets',
      'Managing your account, including trade account applications and approvals',
      'Responding to your enquiries, questions, and support requests',
      'Improving our website, products, and customer experience',
      'Complying with our legal and regulatory obligations',
      'Detecting and preventing fraud or unauthorised access',
    ],
  },
  {
    title: 'How We Protect Your Information',
    content: [
      'We take the security of your personal information seriously and implement appropriate technical and organisational measures to protect it:',
    ],
    list: [
      'All data transmitted between your browser and our website is encrypted using SSL/TLS (HTTPS)',
      'Passwords are securely hashed using industry-standard encryption (bcrypt) — we never store plain-text passwords',
      'Payment processing is handled by Stripe, a PCI DSS Level 1 certified payment processor — we never see or store your full card details',
      'Access to personal information is restricted to authorised personnel only',
      'Our servers and databases are protected by firewalls and access controls',
      'We conduct regular security reviews of our systems and processes',
    ],
  },
  {
    title: 'Sharing Your Information',
    content: [
      'We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:',
    ],
    list: [
      'Payment processing: Stripe (to process your payments securely)',
      'Email delivery: Our email service provider (to send order confirmations, OTPs, and notifications)',
      'Delivery partners: Shipping and freight companies (to deliver your order — name, address, and phone number only)',
      'Legal requirements: When required by law, regulation, or legal process',
      'Business transfers: In the event of a merger, acquisition, or sale of business assets',
    ],
  },
  {
    title: 'Cookies & Tracking',
    content: [
      'Our website uses cookies and similar technologies to enhance your browsing experience:',
    ],
    list: [
      'Essential cookies: Required for the website to function (login sessions, shopping cart)',
      'Analytics cookies: Help us understand how visitors use our website (page views, traffic sources)',
      'Preference cookies: Remember your settings and preferences (language, region)',
    ],
    after: 'You can manage cookie preferences through your browser settings. Disabling essential cookies may affect website functionality.',
  },
  {
    title: 'Your Rights',
    content: [
      'Under the Australian Privacy Act 1988 and the Australian Privacy Principles (APPs), you have the right to:',
    ],
    list: [
      'Access the personal information we hold about you',
      'Request correction of inaccurate or outdated information',
      'Request deletion of your personal information (subject to legal obligations)',
      'Opt out of marketing communications at any time',
      'Lodge a complaint with the Office of the Australian Information Commissioner (OAIC) if you believe your privacy has been breached',
    ],
    after: 'To exercise any of these rights, please contact us using the details below.',
  },
  {
    title: 'Data Retention',
    content: [
      'We retain your personal information for as long as necessary to fulfil the purposes for which it was collected, including:',
    ],
    list: [
      'Account information: For the duration of your account, plus 2 years after account closure',
      'Order information: 7 years (as required by Australian tax law)',
      'Website usage data: 12 months',
      'Marketing preferences: Until you opt out or close your account',
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      'Our website and services are not directed at individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will take steps to delete it.',
    ],
  },
  {
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Privacy Policy</h1>
            </div>
            <p className="text-lg text-steel-300 leading-relaxed">
              Your privacy matters to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="mt-2 text-sm text-steel-400">Last updated: April 2026</p>
          </div>
        </div>

        {/* What We Collect */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-steel-900">What Information We Collect</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {dataCollected.map((cat) => (
              <div key={cat.title} className="rounded-xl border border-steel-100 bg-steel-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <cat.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-steel-900">{cat.title}</h3>
                </div>
                <ul className="space-y-1.5">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-steel-600">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-steel-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="mt-12 max-w-3xl space-y-10 mb-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-steel-900">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.content.map((para, i) => (
                  <p key={i} className="text-sm text-steel-600 leading-relaxed">{para}</p>
                ))}
                {section.list && (
                  <ul className="space-y-2 ml-1">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-steel-600">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.after && (
                  <p className="text-sm text-steel-600 leading-relaxed">{section.after}</p>
                )}
              </div>
            </div>
          ))}

          {/* Contact */}
          <div className="rounded-xl border border-steel-100 bg-steel-50/50 p-6">
            <h2 className="text-lg font-bold text-steel-900">Contact Us About Privacy</h2>
            <p className="mt-2 text-sm text-steel-600">
              If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
            </p>
            <div className="mt-4 space-y-2 text-sm text-steel-600">
              <p><strong className="text-steel-900">Email:</strong> sales@metfold.com.au</p>
              <p><strong className="text-steel-900">Phone:</strong> (03) 9732 0148</p>
              <p><strong className="text-steel-900">Address:</strong> 51 McDougall Road, Sunbury, Victoria 3429</p>
            </div>
            <p className="mt-4 text-xs text-steel-400">
              You may also lodge a complaint with the{' '}
              <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                Office of the Australian Information Commissioner (OAIC)
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
