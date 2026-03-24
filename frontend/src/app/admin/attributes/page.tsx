'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Attribute, AttributeValue } from '@/types/product';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [expandedAttr, setExpandedAttr] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'select' | 'number' | 'text' | 'color-swatch'>('select');
  const [formUnit, setFormUnit] = useState('');
  const [formIsFilterable, setFormIsFilterable] = useState(true);
  const [formIsRequired, setFormIsRequired] = useState(false);
  const [formValues, setFormValues] = useState<Array<{ value: string; label: string; sortOrder: number; metadata?: Record<string, any> }>>([]);
  const [saving, setSaving] = useState(false);

  // Add value form
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newHex, setNewHex] = useState('#888888');
  const [newFinishCategories, setNewFinishCategories] = useState<string[]>([]);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/attributes');
      setAttributes(data.data || []);
    } catch {
      toast.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttributes(); }, []);

  const openCreate = () => {
    setEditingAttr(null);
    setFormName('');
    setFormType('select');
    setFormUnit('');
    setFormIsFilterable(true);
    setFormIsRequired(false);
    setFormValues([]);
    setShowModal(true);
  };

  const openEdit = (attr: Attribute) => {
    setEditingAttr(attr);
    setFormName(attr.name);
    setFormType(attr.type);
    setFormUnit(attr.unit || '');
    setFormIsFilterable(attr.isFilterable);
    setFormIsRequired(attr.isRequired);
    setFormValues(attr.values.map((v) => ({ ...v })));
    setShowModal(true);
  };

  const finishOptions = ['colorbond', 'matt_colorbond', 'ultra', 'galvanised', 'zinc'];

  const toggleFinishCategory = (finish: string) => {
    setNewFinishCategories((prev) =>
      prev.includes(finish) ? prev.filter((f) => f !== finish) : [...prev, finish]
    );
  };

  const addValue = () => {
    if (!newValue.trim()) return;
    const entry: any = {
      value: newValue.trim(),
      label: newLabel.trim() || newValue.trim(),
      sortOrder: formValues.length,
    };
    if (formType === 'color-swatch') {
      entry.metadata = {
        hex: newHex,
        ...(newFinishCategories.length > 0 && { finishCategories: [...newFinishCategories] }),
      };
    }
    setFormValues([...formValues, entry]);
    setNewValue('');
    setNewLabel('');
    setNewHex('#888888');
    setNewFinishCategories([]);
  };

  const removeValue = (index: number) => {
    setFormValues(formValues.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formName,
        type: formType,
        unit: formUnit || undefined,
        isFilterable: formIsFilterable,
        isRequired: formIsRequired,
        values: formValues,
      };

      if (editingAttr) {
        await api.put(`/admin/attributes/${editingAttr._id}`, payload);
        toast.success('Attribute updated');
      } else {
        await api.post('/admin/attributes', payload);
        toast.success('Attribute created');
      }
      setShowModal(false);
      fetchAttributes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save attribute');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this attribute? This may affect existing products.')) return;
    try {
      await api.delete(`/admin/attributes/${id}`);
      toast.success('Attribute deleted');
      fetchAttributes();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const typeColors: Record<string, string> = {
    'select': 'info',
    'number': 'warning',
    'text': 'default',
    'color-swatch': 'success',
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Attributes</h1>
          <p className="text-sm text-steel-500">Define configurable product dimensions</p>
        </div>
        <Button size="sm" onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
          Add Attribute
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 p-6">
              <div className="h-4 w-48 animate-pulse rounded bg-steel-100" />
            </div>
          ))
        ) : attributes.length === 0 ? (
          <div className="rounded-xl bg-white border border-steel-100 p-12 text-center text-steel-500">
            No attributes defined yet
          </div>
        ) : (
          attributes.map((attr) => (
            <div key={attr._id} className="rounded-xl bg-white border border-steel-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-steel-900">{attr.name}</h3>
                  <Badge variant={typeColors[attr.type] as any}>{attr.type}</Badge>
                  {attr.unit && <span className="text-xs text-steel-500">({attr.unit})</span>}
                  {attr.isFilterable && <Badge variant="default">Filterable</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setExpandedAttr(expandedAttr === attr._id ? null : attr._id)}
                    className="rounded px-3 py-1.5 text-xs text-steel-500 hover:bg-steel-50"
                  >
                    {attr.values.length} values
                  </button>
                  <button onClick={() => openEdit(attr)} className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(attr._id)} className="rounded p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {expandedAttr === attr._id && attr.values.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {attr.values.map((v) => (
                    <div
                      key={v.value}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-steel-50 text-sm"
                    >
                      {attr.type === 'color-swatch' && v.metadata?.hex && (
                        <span className="h-4 w-4 rounded-full border border-steel-200" style={{ backgroundColor: v.metadata.hex }} />
                      )}
                      <span className="text-steel-700">{v.label}</span>
                      <span className="text-xs text-steel-400">({v.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAttr ? 'Edit Attribute' : 'New Attribute'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              >
                <option value="select">Select (Dropdown)</option>
                <option value="color-swatch">Color Swatch</option>
                <option value="number">Number</option>
                <option value="text">Text</option>
              </select>
            </div>
          </div>
          <Input label="Unit (optional)" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} placeholder="e.g., mm, m, kg" />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formIsFilterable} onChange={(e) => setFormIsFilterable(e.target.checked)} className="rounded" />
              Filterable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formIsRequired} onChange={(e) => setFormIsRequired(e.target.checked)} className="rounded" />
              Required
            </label>
          </div>

          {/* Values */}
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-2">Values</label>
            <div className="space-y-2 mb-3">
              {formValues.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-steel-50">
                  {v.metadata?.hex && (
                    <span className="h-5 w-5 rounded-full border border-steel-200 flex-shrink-0" style={{ backgroundColor: v.metadata.hex }} />
                  )}
                  <span className="text-sm font-medium text-steel-700 flex-1">{v.label}</span>
                  <span className="text-xs text-steel-400">{v.value}</span>
                  {v.metadata?.finishCategories && (
                    <span className="text-[10px] text-steel-400">{(v.metadata.finishCategories as string[]).join(', ')}</span>
                  )}
                  <button onClick={() => removeValue(idx)} className="text-steel-400 hover:text-red-500">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Value (e.g., monument)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Label (e.g., Monument)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1"
                />
                {formType === 'color-swatch' && (
                  <div className="flex items-end gap-1">
                    <input
                      type="color"
                      value={newHex}
                      onChange={(e) => setNewHex(e.target.value)}
                      className="h-[42px] w-10 rounded border border-steel-300 cursor-pointer"
                      title="Pick colour"
                    />
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={addValue}>Add</Button>
              </div>
              {formType === 'color-swatch' && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-steel-500">Finish categories:</span>
                  {finishOptions.map((f) => (
                    <label key={f} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={newFinishCategories.includes(f)}
                        onChange={() => toggleFinishCategory(f)}
                        className="rounded"
                      />
                      <span className="text-steel-600 capitalize">{f.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingAttr ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
