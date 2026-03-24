'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';

interface Address {
  _id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/addresses');
      setAddresses(data.data || []);
    } catch {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openCreate = () => {
    setEditingAddress(null);
    setLabel('');
    setStreet('');
    setCity('');
    setState('');
    setPostcode('');
    setIsDefault(false);
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditingAddress(addr);
    setLabel(addr.label);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setPostcode(addr.postcode);
    setIsDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!street.trim() || !city.trim() || !state.trim() || !postcode.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = { label: label || 'Home', street, city, state, postcode, country: 'Australia', isDefault };
      if (editingAddress) {
        await api.put(`/auth/addresses/${editingAddress._id}`, payload);
        toast.success('Address updated');
      } else {
        await api.post('/auth/addresses', payload);
        toast.success('Address added');
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/auth/addresses/${id}`);
      toast.success('Address deleted');
      fetchAddresses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-steel-900">My Addresses</h2>
        <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
          Add Address
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-xl bg-white border border-steel-100 p-12 text-center text-steel-500">
          <MapPin className="mx-auto h-8 w-8 text-steel-300 mb-2" />
          <p>No saved addresses</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="rounded-xl bg-white border border-steel-100 p-5 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-steel-900">{addr.label}</span>
                    {addr.isDefault && <Badge variant="success">Default</Badge>}
                  </div>
                  <div className="text-sm text-steel-600 space-y-0.5">
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} {addr.postcode}</p>
                    <p>{addr.country}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(addr)} className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(addr._id)} className="rounded p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAddress ? 'Edit Address' : 'New Address'}>
        <div className="space-y-4">
          <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Home, Office, Site" />
          <Input label="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} required />
          <div className="grid grid-cols-3 gap-3">
            <Input label="City / Suburb" value={city} onChange={(e) => setCity(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select</option>
                {AU_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Input label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
            Set as default address
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>{editingAddress ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
