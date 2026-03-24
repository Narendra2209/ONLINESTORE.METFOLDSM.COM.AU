'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Save, Store, Truck, CreditCard, Mail, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('store');
  const [saving, setSaving] = useState(false);

  // Store
  const [storeName, setStoreName] = useState('Metfold Industries');
  const [storeEmail, setStoreEmail] = useState('sales@metfold.com.au');
  const [storePhone, setStorePhone] = useState('1300 METFOLD');
  const [storeAddress, setStoreAddress] = useState('123 Industrial Ave, Melbourne VIC 3000');
  const [gstRate, setGstRate] = useState('10');
  const [currency, setCurrency] = useState('AUD');

  // Shipping
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('500');
  const [flatRateShipping, setFlatRateShipping] = useState('25');
  const [pickupEnabled, setPickupEnabled] = useState(true);

  // Payment
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);
  const [quoteEnabled, setQuoteEnabled] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to the backend
      await new Promise((r) => setTimeout(r, 500));
      toast.success('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { key: 'store', label: 'Store Details', icon: Store },
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'email', label: 'Email', icon: Mail },
    { key: 'seo', label: 'SEO & Social', icon: Globe },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Settings</h1>
          <p className="text-sm text-steel-500">Manage your store configuration</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Settings
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeSection === section.key
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-steel-600 hover:bg-steel-50'
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="col-span-3">
          {activeSection === 'store' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-steel-900">Store Details</h2>
              <Input label="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Contact Email" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} />
                <Input label="Contact Phone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-1">Address</label>
                <textarea
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="GST Rate (%)" type="number" value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="NZD">NZD - New Zealand Dollar</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'shipping' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-steel-900">Shipping Settings</h2>
              <Input
                label="Free Shipping Threshold (AUD)"
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                helperText="Orders above this amount get free shipping"
              />
              <Input
                label="Flat Rate Shipping (AUD)"
                type="number"
                value={flatRateShipping}
                onChange={(e) => setFlatRateShipping(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} className="rounded" />
                Enable factory pickup option
              </label>
            </div>
          )}

          {activeSection === 'payment' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-steel-900">Payment Methods</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-lg border border-steel-200">
                  <div>
                    <p className="font-medium text-steel-900">Stripe (Card Payments)</p>
                    <p className="text-xs text-steel-500">Accept Visa, Mastercard, AMEX</p>
                  </div>
                  <input type="checkbox" checked={stripeEnabled} onChange={(e) => setStripeEnabled(e.target.checked)} className="rounded" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg border border-steel-200">
                  <div>
                    <p className="font-medium text-steel-900">Bank Transfer / EFT</p>
                    <p className="text-xs text-steel-500">Direct bank transfer for trade accounts</p>
                  </div>
                  <input type="checkbox" checked={bankTransferEnabled} onChange={(e) => setBankTransferEnabled(e.target.checked)} className="rounded" />
                </label>
                <label className="flex items-center justify-between p-4 rounded-lg border border-steel-200">
                  <div>
                    <p className="font-medium text-steel-900">Quote Request</p>
                    <p className="text-xs text-steel-500">Allow customers to request quotes for large orders</p>
                  </div>
                  <input type="checkbox" checked={quoteEnabled} onChange={(e) => setQuoteEnabled(e.target.checked)} className="rounded" />
                </label>
              </div>
            </div>
          )}

          {activeSection === 'email' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-steel-900">Email Notifications</h2>
              <p className="text-sm text-steel-500">Configure email templates and notification settings. Emails are sent via SMTP configured in environment variables.</p>
              <div className="space-y-3">
                {[
                  { label: 'Order Confirmation', desc: 'Sent to customer after successful order' },
                  { label: 'Order Shipped', desc: 'Sent when order status changes to shipped' },
                  { label: 'Welcome Email', desc: 'Sent after new account registration' },
                  { label: 'Trade Account Approved', desc: 'Sent when trade account is approved' },
                  { label: 'Password Reset', desc: 'Sent when password reset is requested' },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between p-4 rounded-lg border border-steel-200">
                    <div>
                      <p className="font-medium text-steel-900">{item.label}</p>
                      <p className="text-xs text-steel-500">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'seo' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-steel-900">SEO & Social</h2>
              <Input label="Default Meta Title" defaultValue="Metfold Industries | Quality Sheet Metal & Roofing Products" />
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-1">Default Meta Description</label>
                <textarea
                  defaultValue="Australia's trusted supplier of Colorbond roofing, cladding, guttering, and sheet metal products. Quality materials for residential and commercial projects."
                  rows={3}
                  className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>
              <Input label="Google Analytics ID" placeholder="G-XXXXXXXXXX" />
              <Input label="Facebook Pixel ID" placeholder="1234567890" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
