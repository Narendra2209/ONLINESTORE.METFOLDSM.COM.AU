'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const branches = [
  { name: 'METFOLD - SUNBURY', address: '51 McDougall Road, Sunbury, Victoria 3429', phone: '(03) 9732 0148', email: 'sunbury@metfold.com.au' },
  { name: 'METFOLD - MELTON', address: '16 Collins Road, Melton, Victoria 3339', phone: '(03) 9747 9044', email: 'melton@metfold.com.au' },
  { name: 'METFOLD - PAKENHAM', address: '47 Sette CCT, Pakenham, Victoria 3810', phone: '(03) 5910 6099', email: 'pakenham@metfold.com.au' },
  { name: 'METFOLD - MOAMA', address: '11 Bowlan St, Moama, NSW 2731', phone: '(03) 5482 1468', email: 'moama@metfold.com.au' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', branch: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you shortly.');
      setForm({ name: '', email: '', phone: '', branch: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="bg-white">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Contact Us' }]} />

        {/* Hero */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-steel-900 to-steel-800 p-8 sm:p-12 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-lg text-steel-300 max-w-2xl">
            Get in touch with our team. Visit any of our four branches or send us a message and we will respond within 24 hours.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-steel-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-steel-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-steel-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-steel-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    placeholder="04XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1.5">Preferred Branch</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full rounded-lg border border-steel-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Select a branch</option>
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-1.5">Message *</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-steel-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Sidebar — Business Hours + Quick Contact */}
          <div className="space-y-6">
            <div className="rounded-xl border border-steel-100 bg-steel-50 p-6">
              <h3 className="text-sm font-bold text-steel-900 flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-brand-600" />
                Business Hours
              </h3>
              <div className="space-y-2 text-sm text-steel-600">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-steel-900">7:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-steel-900">8:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-steel-500">Closed</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-steel-100 bg-steel-50 p-6">
              <h3 className="text-sm font-bold text-steel-900 flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-brand-600" />
                Quick Contact
              </h3>
              <div className="space-y-3 text-sm">
                <a href="mailto:info@metfold.com.au" className="flex items-center gap-2 text-steel-600 hover:text-brand-600 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                  info@metfold.com.au
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Branches */}
        <div className="mt-16 mb-12">
          <h2 className="text-xl font-bold text-steel-900">Our Branches</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {branches.map((branch) => (
              <div key={branch.name} className="rounded-xl border border-steel-100 bg-white p-5 shadow-sm">
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
                  <a href={`mailto:${branch.email}`} className="flex items-center gap-2 text-xs text-steel-500 hover:text-brand-600 transition-colors">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-brand-600" />
                    <span>{branch.email}</span>
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
