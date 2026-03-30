'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Breadcrumb from '@/components/ui/Breadcrumb';
import toast from 'react-hot-toast';
import { Lock, ShoppingBag } from 'lucide-react';
import api from '@/lib/axios';

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  const [formData, setFormData] = useState({
    customerEmail: user?.email || '',
    customerName: user ? `${user.firstName} ${user.lastName}` : '',
    phone: '',
    company: '',
    street: '',
    city: '',
    state: '',
    postcode: '',
    notes: '',
  });

  // Auto-fill user details and default saved address
  useEffect(() => {
    if (!user) return;
    // Fill name and email from user profile
    setFormData((prev) => ({
      ...prev,
      customerName: `${user.firstName} ${user.lastName}`.trim() || prev.customerName,
      customerEmail: user.email || prev.customerEmail,
    }));
    // Fill address, phone, company from saved default address
    api.get('/auth/addresses').then(({ data }) => {
      const addresses = data.data || [];
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      if (defaultAddr) {
        setHasSavedAddress(true);
        setFormData((prev) => ({
          ...prev,
          customerName: defaultAddr.fullName || prev.customerName,
          phone: defaultAddr.phone || prev.phone,
          company: defaultAddr.company || prev.company,
          street: defaultAddr.street || prev.street,
          city: defaultAddr.city || prev.city,
          state: defaultAddr.state || prev.state,
          postcode: defaultAddr.postcode || prev.postcode,
        }));
      }
    }).catch(() => {});
  }, [user]);

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const address = {
        fullName: formData.customerName,
        company: formData.company,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postcode: formData.postcode,
        country: 'Australia',
      };

      // For pickup, use a placeholder address if fields are empty
      if (deliveryMethod === 'pickup' && !address.street) {
        address.street = 'Pickup from warehouse';
        address.city = address.city || 'Melbourne';
        address.state = address.state || 'VIC';
        address.postcode = address.postcode || '3000';
        address.phone = address.phone || formData.phone || '0000000000';
      }

      const orderPayload = {
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        shippingAddress: address,
        billingAddress: address,
        deliveryMethod,
        notes: formData.notes,
        items: items.map((item) => ({
          productId: item.product._id,
          productName: item.product.name,
          productSku: item.product.sku,
          selectedAttributes: item.selectedAttributes,
          pricingModel: item.pricingModel,
          unitPrice: item.unitPrice,
          length: item.length,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        subtotal,
        taxAmount: gst,
        total,
      };

      const { data } = await api.post('/orders', orderPayload);

      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
      router.push(`/checkout/success?order=${data.data.orderNumber}`);
    } catch (err: any) {
      console.error('Order failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="container-main py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-steel-300" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-steel-500">Add some products before checking out.</p>
      </div>
    );
  }

  return (
    <div className="bg-steel-50 min-h-screen">
      <div className="container-main py-6">
        <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

        <h1 className="mt-4 text-2xl font-bold text-steel-900">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact — show summary if saved, form if not */}
              {hasSavedAddress && !editingAddress ? (
                <div className="rounded-xl bg-white p-6 border border-steel-100">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-steel-900">Contact & Delivery Details</h2>
                    <button
                      type="button"
                      onClick={() => setEditingAddress(true)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-steel-700">
                    <p className="font-medium text-steel-900">{formData.customerName}</p>
                    <p>{formData.customerEmail}</p>
                    {formData.phone && <p>{formData.phone}</p>}
                    {formData.company && <p>{formData.company}</p>}
                    {formData.street && (
                      <div className="mt-3 pt-3 border-t border-steel-100">
                        <p>{formData.street}</p>
                        <p>{formData.city}, {formData.state} {formData.postcode}</p>
                        <p>Australia</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-white p-6 border border-steel-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-steel-900">Contact Information</h2>
                      {editingAddress && (
                        <button type="button" onClick={() => setEditingAddress(false)} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          Use Saved Address
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Input label="Full Name *" name="customerName" value={formData.customerName} onChange={handleChange} required />
                      <Input label="Email *" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleChange} required />
                      <Input label="Phone *" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                      <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
                    </div>
                  </div>

                  {/* Shipping address form */}
                  {deliveryMethod === 'delivery' && (
                    <div className="rounded-xl bg-white p-6 border border-steel-100">
                      <h2 className="text-lg font-semibold text-steel-900 mb-4">Shipping Address</h2>
                      <div className="grid grid-cols-1 gap-4">
                        <Input label="Street Address *" name="street" value={formData.street} onChange={handleChange} required />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <Input label="City *" name="city" value={formData.city} onChange={handleChange} required />
                          <Select
                            label="State *"
                            name="state"
                            options={AUSTRALIAN_STATES}
                            placeholder="Select state"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                          <Input label="Postcode *" name="postcode" value={formData.postcode} onChange={handleChange} required />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Delivery method */}
              <div className="rounded-xl bg-white p-6 border border-steel-100">
                <h2 className="text-lg font-semibold text-steel-900 mb-4">Delivery Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(['delivery', 'pickup'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setDeliveryMethod(method)}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        deliveryMethod === method
                          ? 'border-brand-600 bg-brand-50'
                          : 'border-steel-200 hover:border-steel-300'
                      }`}
                    >
                      <span className="font-medium capitalize text-steel-900">{method}</span>
                      <p className="text-xs text-steel-500 mt-1">
                        {method === 'delivery' ? 'Delivered to your address' : 'Collect from warehouse'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl bg-white p-6 border border-steel-100">
                <h2 className="text-lg font-semibold text-steel-900 mb-4">Order Notes</h2>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions for your order..."
                  className="w-full rounded-lg border border-steel-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl bg-white p-6 border border-steel-100">
                <h2 className="text-lg font-semibold text-steel-900 mb-4">Order Summary</h2>

                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <div className="flex-1 pr-2">
                        <p className="text-steel-700 line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-steel-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-steel-900 whitespace-nowrap">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-steel-100 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-steel-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel-600">GST (10%)</span>
                    <span>{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base text-steel-900 border-t border-steel-100 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  isLoading={isSubmitting}
                  leftIcon={<Lock className="h-4 w-4" />}
                >
                  Place Order
                </Button>

                <p className="mt-3 text-center text-xs text-steel-500">
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
