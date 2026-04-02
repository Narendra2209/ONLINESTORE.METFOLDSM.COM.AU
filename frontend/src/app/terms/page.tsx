'use client';

import React from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { FileText } from 'lucide-react';

const sections = [
  {
    title: '1. About These Terms',
    content: [
      'These Terms and Conditions ("Terms") govern your use of the Metfold Sheet Metal website (onlinestore.metfoldsm.com.au) and your purchase of products from Metfold Sheet Metal Pty Ltd (ABN to be confirmed), referred to as "Metfold", "we", "us", or "our".',
      'By accessing our website or placing an order, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our website or place an order.',
      'We reserve the right to update these Terms at any time. Changes will be posted on this page with an updated effective date.',
    ],
  },
  {
    title: '2. Products & Pricing',
    content: [
      'All products listed on our website are subject to availability. We make every effort to display accurate product descriptions, images, and specifications. However, minor variations in colour, finish, and dimensions may occur due to manufacturing processes and screen display differences.',
      'Prices displayed on the website are in Australian Dollars (AUD) and include GST unless otherwise stated. We reserve the right to change prices at any time without prior notice. The price at the time of your order confirmation is the price you will be charged.',
      'For custom-cut and made-to-order products (roof sheets, flashing, cladding), prices are calculated based on the dimensions and specifications you provide. It is your responsibility to ensure all measurements are correct before placing an order.',
    ],
  },
  {
    title: '3. Ordering & Payment',
    content: [
      'When you place an order through our website, you are making an offer to purchase the selected products. We will send you an order confirmation email. This confirmation constitutes our acceptance of your order and forms a binding contract.',
      'We accept payment via credit card (Visa, Mastercard), debit card, and other payment methods available at checkout. All payments are processed securely through our payment gateway (Stripe). We do not store your full card details on our servers.',
      'For trade accounts, payment terms may be arranged separately. Contact our sales team for trade account enquiries.',
      'We reserve the right to cancel any order if we suspect fraudulent activity, if a product is unavailable, or if there is a pricing error on our website.',
    ],
  },
  {
    title: '4. Custom & Made-to-Order Products',
    content: [
      'Custom-cut roof sheets, flashing, and cladding panels are manufactured to your exact specifications. Once production has commenced, these orders cannot be cancelled, modified, or returned unless the product is defective or does not match your order specifications.',
      'Please double-check all measurements, colours, profiles, and quantities before submitting your order. Metfold is not responsible for errors in dimensions or specifications provided by the customer.',
      'Lead times for custom products vary depending on the complexity and quantity of the order. Estimated lead times are provided at the time of ordering but are not guaranteed.',
    ],
  },
  {
    title: '5. Delivery & Shipping',
    content: [
      'We offer delivery across Australia. Delivery charges are calculated based on the size, weight, and destination of your order. Delivery estimates are provided at checkout but are not guaranteed.',
      'Risk of loss and title for items pass to you upon delivery. You or your authorised representative must be available to accept delivery. If no one is available, the driver may leave the goods in a safe location at your risk.',
      'You are responsible for inspecting goods upon delivery. Any damage or shortages must be reported to us within 48 hours of delivery. Please keep the original packaging until you have inspected the goods.',
      'For pickup orders, products must be collected from the specified Metfold branch within 14 days of the order being marked as ready. Uncollected orders may incur storage fees after this period.',
    ],
  },
  {
    title: '6. Returns & Refunds',
    content: [
      'Standard stock items may be returned within 14 days of purchase, provided they are in original, unopened condition and packaging. A 15% restocking fee may apply.',
      'Custom-cut and made-to-order products cannot be returned or exchanged unless they are defective or do not match your order specifications.',
      'Refunds are processed to the original payment method within 5-10 business days after we receive and inspect the returned goods.',
      'For full details, please refer to our Returns Policy page.',
    ],
  },
  {
    title: '7. Warranty',
    content: [
      'Products sold by Metfold are covered by manufacturer warranties where applicable. Colorbond and BlueScope steel products carry manufacturer warranties as outlined by BlueScope Steel.',
      'Warranty claims must be directed to Metfold in the first instance. We will liaise with the manufacturer on your behalf. Warranty does not cover damage caused by improper installation, handling, storage, or use of products in conditions outside their design specifications.',
      'Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, right, or remedy conferred on you by the Australian Consumer Law or any other applicable law that cannot be excluded, restricted, or modified by agreement.',
    ],
  },
  {
    title: '8. Accounts & Registration',
    content: [
      'You may create an account on our website to manage orders, save addresses, and access trade pricing (if applicable). You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.',
      'Trade accounts are subject to approval. Metfold reserves the right to approve or decline trade account applications at our discretion. Trade pricing and payment terms are provided on a case-by-case basis.',
      'We may suspend or terminate your account if we believe you have breached these Terms or engaged in fraudulent or unlawful activity.',
    ],
  },
  {
    title: '9. Intellectual Property',
    content: [
      'All content on the Metfold website — including text, images, logos, graphics, product descriptions, and software — is the property of Metfold Sheet Metal Pty Ltd or its licensors and is protected by Australian and international intellectual property laws.',
      'You may not reproduce, distribute, modify, or republish any content from our website without our prior written consent.',
    ],
  },
  {
    title: '10. Limitation of Liability',
    content: [
      'To the maximum extent permitted by law, Metfold shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or purchase of our products.',
      'Our total liability to you for any claim arising from or related to these Terms or your use of our website shall not exceed the amount you paid for the specific product or order giving rise to the claim.',
      'This limitation does not apply to any liability that cannot be excluded or limited under the Australian Consumer Law.',
    ],
  },
  {
    title: '11. Privacy',
    content: [
      'We collect and handle your personal information in accordance with our Privacy Policy. By using our website, you consent to the collection and use of your information as described in the Privacy Policy.',
      'For full details on how we handle your data, please refer to our Privacy Policy page.',
    ],
  },
  {
    title: '12. Governing Law',
    content: [
      'These Terms are governed by the laws of the State of Victoria, Australia. Any disputes arising from these Terms or your use of our website shall be subject to the exclusive jurisdiction of the courts of Victoria.',
    ],
  },
  {
    title: '13. Contact Us',
    content: [
      'If you have any questions about these Terms, please contact us:',
      'Email: sales@metfold.com.au',
      'Phone: (03) 9732 0148',
      'Address: 51 McDougall Road, Sunbury, Victoria 3429',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Terms & Conditions' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <FileText className="h-6 w-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms & Conditions</h1>
            </div>
            <p className="text-lg text-steel-300 leading-relaxed">
              Please read these terms and conditions carefully before using our website or placing an order.
            </p>
            <p className="mt-2 text-sm text-steel-400">Last updated: April 2026</p>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-10 max-w-3xl space-y-10 mb-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-bold text-steel-900">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.content.map((para, i) => (
                  <p key={i} className="text-sm text-steel-600 leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
