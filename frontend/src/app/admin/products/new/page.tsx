'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Attribute, Category } from '@/types/product';
import toast from 'react-hot-toast';
import {
  Save, ArrowLeft, Plus, Trash2, X, Upload,
  Sliders, ChevronDown, ChevronUp, AlertCircle, Loader2,
} from 'lucide-react';

interface PricingModifier {
  type: string;
  label: string;
  condition: { attribute: string; value: string };
  adjustmentType: 'multiplier' | 'fixed_add' | 'percentage_add';
  adjustmentValue: number;
}

interface QuantityBreak {
  minQty: number;
  maxQty: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [attrError, setAttrError] = useState('');

  // Collapsible sections
  const [showAttributes, setShowAttributes] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // General
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [type, setType] = useState<'simple' | 'configurable'>('simple');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [availableTo, setAvailableTo] = useState<'all' | 'retail' | 'trade'>('all');
  const [isFeatured, setIsFeatured] = useState(false);

  // Simple pricing
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [trackInventory, setTrackInventory] = useState(true);
  const [minimumOrderQty, setMinimumOrderQty] = useState('1');

  // Configurable
  const [pricingModel, setPricingModel] = useState<'per_metre' | 'per_piece' | 'per_sheet' | 'quote_only'>('per_metre');
  const [selectedAttributes, setSelectedAttributes] = useState<
    Array<{ attribute: string; isRequired: boolean; allowedValues: string[] }>
  >([]);
  const [minLength, setMinLength] = useState('');
  const [maxLength, setMaxLength] = useState('');

  // Pricing Rules
  const [baseRate, setBaseRate] = useState('');
  const [modifiers, setModifiers] = useState<PricingModifier[]>([]);
  const [quantityBreaks, setQuantityBreaks] = useState<QuantityBreak[]>([]);
  const [tradePriceModifier, setTradePriceModifier] = useState({ adjustmentType: 'percentage_add' as const, adjustmentValue: -10 });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setAttrError('');

      // Fetch categories
      try {
        const catRes = await api.get('/categories?flat=true');
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }

      // Fetch attributes separately so category failure doesn't block it
      try {
        const attrRes = await api.get('/admin/attributes');
        console.log('Attributes API response:', attrRes.data);
        const attrData = attrRes.data.data || [];
        setAttributes(attrData);
        if (attrData.length === 0) {
          setAttrError('No attributes found. Create them in Attributes Management first.');
        }
      } catch (err: any) {
        console.error('Failed to load attributes:', err);
        const msg = err.response?.data?.message || err.message || 'Failed to load attributes';
        const status = err.response?.status;
        setAttrError(status === 401 ? 'Not authenticated. Please log in again.' :
          status === 403 ? 'No permission to view attributes. Check your admin role.' :
            `Error loading attributes: ${msg}`);
      }

      setLoadingData(false);
    };
    fetchData();
  }, []);

  const removeAttribute = (index: number) => {
    setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: string, value: any) => {
    const updated = [...selectedAttributes];
    (updated[index] as any)[field] = value;
    if (field === 'attribute') {
      updated[index].allowedValues = [];
    }
    setSelectedAttributes(updated);
  };

  const toggleAllowedValue = (attrIndex: number, value: string) => {
    const updated = [...selectedAttributes];
    const vals = updated[attrIndex].allowedValues;
    if (vals.includes(value)) {
      updated[attrIndex].allowedValues = vals.filter((v) => v !== value);
    } else {
      updated[attrIndex].allowedValues = [...vals, value];
    }
    setSelectedAttributes(updated);
  };

  const addModifier = () => {
    setModifiers([
      ...modifiers,
      { type: 'attribute', label: '', condition: { attribute: '', value: '' }, adjustmentType: 'multiplier', adjustmentValue: 1 },
    ]);
  };

  const removeModifier = (index: number) => {
    setModifiers(modifiers.filter((_, i) => i !== index));
  };

  const updateModifier = (index: number, field: string, value: any) => {
    const updated = [...modifiers];
    if (field.startsWith('condition.')) {
      const key = field.split('.')[1];
      (updated[index].condition as any)[key] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setModifiers(updated);
  };

  const addQuantityBreak = () => {
    setQuantityBreaks([...quantityBreaks, { minQty: 1, maxQty: 10, discountType: 'percentage', discountValue: 0 }]);
  };

  const removeQuantityBreak = (index: number) => {
    setQuantityBreaks(quantityBreaks.filter((_, i) => i !== index));
  };

  const updateQuantityBreak = (index: number, field: string, value: any) => {
    const updated = [...quantityBreaks];
    (updated[index] as any)[field] = value;
    setQuantityBreaks(updated);
  };

  const handleSave = async () => {
    if (!name.trim() || !sku.trim()) {
      toast.error('Name and SKU are required');
      return;
    }

    setSaving(true);
    try {
      const productData: any = {
        name, sku, type, status,
        category: categoryId || undefined,
        shortDescription, description,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        availableTo, isFeatured, trackInventory,
        minimumOrderQty: parseInt(minimumOrderQty) || 1,
      };

      productData.configurableAttributes = selectedAttributes
        .filter((a) => a.attribute)
        .map((a, i) => ({ attribute: a.attribute, isRequired: a.isRequired, sortOrder: i, allowedValues: a.allowedValues }));

      if (type === 'simple') {
        productData.price = parseFloat(price) || 0;
        productData.compareAtPrice = parseFloat(compareAtPrice) || undefined;
        productData.stock = parseInt(stock) || 0;
      } else {
        productData.pricingModel = pricingModel;
        if (pricingModel === 'per_metre') {
          productData.minLength = parseFloat(minLength) || undefined;
          productData.maxLength = parseFloat(maxLength) || undefined;
        }
      }

      const { data } = await api.post('/admin/products', productData);
      const productId = data.data._id;

      // Upload images if any were selected
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('images', file));
        try {
          await api.post(`/admin/products/${productId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (imgErr: any) {
          toast.error('Product created but image upload failed: ' + (imgErr.response?.data?.message || imgErr.message));
        }
      }

      if (type === 'configurable' && baseRate) {
        const ruleData: any = {
          product: productId,
          name: `${name} - Default Pricing`,
          baseRate: parseFloat(baseRate),
          modifiers: modifiers.filter((m) => m.condition.attribute && m.condition.value),
          quantityBreaks: quantityBreaks.filter((q) => q.discountValue > 0),
          isActive: true,
          priority: 1,
        };
        if (tradePriceModifier.adjustmentValue !== 0) {
          ruleData.tradePriceModifier = tradePriceModifier;
        }
        await api.post(`/admin/products/${productId}/pricing-rules`, ruleData);
      }

      toast.success('Product created!');
      router.push(`/admin/products/${productId}/edit`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const getAttributeById = (id: string) => attributes.find((a) => a._id === id);

  const selectClass = 'w-full rounded-lg border border-steel-200 bg-white px-3 py-2.5 text-sm text-steel-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 focus:outline-none transition-colors';

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-steel-100 transition-colors">
            <ArrowLeft className="h-5 w-5 text-steel-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-steel-900">New Product</h1>
            <p className="text-sm text-steel-500">Fill in product details below</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
          Save Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN — Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-5">
            <h2 className="text-base font-semibold text-steel-900">Basic Information</h2>

            <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Corrugated Roof Sheet" required />

            <div className="grid grid-cols-2 gap-4">
              <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} placeholder="e.g., CRS-001" required />
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-1">Product Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as any)} className={selectClass}>
                  <option value="simple">Simple</option>
                  <option value="configurable">Configurable</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-1">Short Description</label>
                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} placeholder="Brief summary for product cards" className={selectClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-700 mb-1">Full Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Detailed product description" className={selectClass} />
              </div>
            </div>

            <Input label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} helperText="Comma-separated" placeholder="roofing, colorbond, residential" />
          </div>

          {/* Pricing & Stock — Simple */}
          {type === 'simple' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-5">
              <h2 className="text-base font-semibold text-steel-900">Pricing & Stock</h2>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Price (AUD)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                <Input label="Compare At Price" type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="0.00" />
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} className="rounded border-steel-300 text-brand-600" />
                    Track Inventory
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Configurable Settings */}
          {type === 'configurable' && (
            <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-5">
              <h2 className="text-base font-semibold text-steel-900">Configurable Settings</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1">Pricing Model</label>
                  <select value={pricingModel} onChange={(e) => setPricingModel(e.target.value as any)} className={selectClass}>
                    <option value="per_metre">Per Metre</option>
                    <option value="per_piece">Per Piece</option>
                    <option value="per_sheet">Per Sheet</option>
                    <option value="quote_only">Quote Only</option>
                  </select>
                </div>
                {pricingModel === 'per_metre' && (
                  <>
                    <Input label="Min Length (m)" type="number" step="0.1" value={minLength} onChange={(e) => setMinLength(e.target.value)} />
                    <Input label="Max Length (m)" type="number" step="0.1" value={maxLength} onChange={(e) => setMaxLength(e.target.value)} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ATTRIBUTES SECTION */}
          <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
            <button
              onClick={() => setShowAttributes(!showAttributes)}
              className="w-full flex items-center justify-between p-5 hover:bg-steel-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${selectedAttributes.length > 0 ? 'bg-brand-100 text-brand-600' : 'bg-steel-100 text-steel-500'}`}>
                  <Sliders className="h-4.5 w-4.5" />
                </div>
                <div className="text-left">
                  <h2 className="text-base font-semibold text-steel-900">Attributes</h2>
                  <p className="text-xs text-steel-500">
                    {selectedAttributes.length > 0
                      ? `${selectedAttributes.length} attribute${selectedAttributes.length > 1 ? 's' : ''} selected`
                      : 'Add configurable attributes like colour, thickness, finish'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedAttributes.length > 0 && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold">
                    {selectedAttributes.length}
                  </span>
                )}
                {showAttributes ? <ChevronUp className="h-5 w-5 text-steel-400" /> : <ChevronDown className="h-5 w-5 text-steel-400" />}
              </div>
            </button>

            {showAttributes && (
              <div className="border-t border-steel-100 p-5 space-y-5">
                {/* Loading */}
                {loadingData ? (
                  <div className="flex items-center justify-center py-8 gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                    <span className="text-sm text-steel-500">Loading attributes...</span>
                  </div>
                ) : attrError && attributes.length === 0 ? (
                  /* Error / Empty */
                  <div className="rounded-xl border-2 border-dashed border-steel-200 p-8 text-center">
                    <AlertCircle className="mx-auto h-8 w-8 text-steel-300 mb-3" />
                    <p className="text-sm text-steel-600 font-medium">{attrError}</p>
                    <button
                      onClick={() => router.push('/admin/attributes')}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Go to Attributes Management <span>&rarr;</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Available Attributes */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-steel-400 mb-3">
                        Available Attributes ({attributes.length})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {attributes.map((attr) => {
                          const isAdded = selectedAttributes.some((sa) => sa.attribute === attr._id);
                          return (
                            <button
                              key={attr._id}
                              onClick={() => {
                                if (isAdded) {
                                  // Click to remove
                                  setSelectedAttributes(selectedAttributes.filter((sa) => sa.attribute !== attr._id));
                                } else {
                                  // Click to add
                                  setSelectedAttributes([...selectedAttributes, { attribute: attr._id, isRequired: true, allowedValues: [] }]);
                                }
                              }}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${isAdded
                                ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm shadow-brand-100'
                                : 'border-steel-200 text-steel-600 hover:border-brand-300 hover:bg-brand-50/30 hover:text-brand-600'
                              }`}
                            >
                              {isAdded ? (
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-brand-500 text-white">
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </span>
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              {attr.name}
                              <span className="text-[11px] text-steel-400">
                                {attr.values.length} {attr.values.length === 1 ? 'value' : 'values'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Attributes - expanded config */}
                    {selectedAttributes.length > 0 && (
                      <div className="space-y-4">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-steel-400">
                          Configure Selected Attributes
                        </label>
                        {selectedAttributes.map((sa, idx) => {
                          const attr = getAttributeById(sa.attribute);
                          if (!attr) return null;
                          return (
                            <div key={sa.attribute} className="rounded-xl border border-steel-200 bg-steel-50/30 overflow-hidden">
                              {/* Attribute Header */}
                              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-steel-100">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
                                    {attr.name.substring(0, 2).toUpperCase()}
                                  </span>
                                  <div>
                                    <h3 className="text-sm font-semibold text-steel-900">{attr.name}</h3>
                                    <span className="text-[11px] text-steel-500">{attr.type} &middot; {attr.values.length} values</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <label className="flex items-center gap-1.5 text-xs text-steel-600 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={sa.isRequired}
                                      onChange={(e) => updateAttribute(idx, 'isRequired', e.target.checked)}
                                      className="rounded border-steel-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    Required
                                  </label>
                                  <button
                                    onClick={() => removeAttribute(idx)}
                                    className="rounded-lg p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Remove attribute"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Attribute Values */}
                              {attr.values.length > 0 && (
                                <div className="px-4 py-3">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-xs font-medium text-steel-500">Select allowed values for this product</label>
                                    <button
                                      onClick={() => {
                                        const updated = [...selectedAttributes];
                                        if (sa.allowedValues.length === attr.values.length) {
                                          updated[idx].allowedValues = [];
                                        } else {
                                          updated[idx].allowedValues = attr.values.map((v) => v.value);
                                        }
                                        setSelectedAttributes(updated);
                                      }}
                                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                                    >
                                      {sa.allowedValues.length === attr.values.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {attr.values.map((v) => {
                                      const isSelected = sa.allowedValues.includes(v.value);
                                      return (
                                        <button
                                          key={v.value}
                                          onClick={() => toggleAllowedValue(idx, v.value)}
                                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${isSelected
                                            ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                                            : 'border-steel-200 bg-white text-steel-600 hover:border-brand-300 hover:bg-brand-50'
                                          }`}
                                        >
                                          {attr.type === 'color-swatch' && v.metadata?.hex && (
                                            <span
                                              className="h-3 w-3 rounded-full border border-white/30 flex-shrink-0"
                                              style={{ backgroundColor: v.metadata.hex }}
                                            />
                                          )}
                                          {v.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <p className="text-[11px] text-steel-400 mt-2">
                                    {sa.allowedValues.length === 0
                                      ? 'No filter — all values available to customer'
                                      : `${sa.allowedValues.length} of ${attr.values.length} values selected`}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* PRICING RULES SECTION — configurable only */}
          {type === 'configurable' && (
            <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
              <button
                onClick={() => setShowPricing(!showPricing)}
                className="w-full flex items-center justify-between p-5 hover:bg-steel-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${baseRate ? 'bg-brand-100 text-brand-600' : 'bg-steel-100 text-steel-500'}`}>
                    <span className="text-sm font-bold">$</span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-semibold text-steel-900">Pricing Rules</h2>
                    <p className="text-xs text-steel-500">
                      {baseRate ? `Base rate: $${baseRate}` : 'Configure dynamic pricing for this product'}
                    </p>
                  </div>
                </div>
                {showPricing ? <ChevronUp className="h-5 w-5 text-steel-400" /> : <ChevronDown className="h-5 w-5 text-steel-400" />}
              </button>

              {showPricing && (
                <div className="border-t border-steel-100 p-5 space-y-6">
                  {/* Base Rate */}
                  <Input
                    label={`Base Rate (AUD / ${pricingModel === 'per_metre' ? 'metre' : 'unit'})`}
                    type="number"
                    step="0.01"
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    placeholder="0.00"
                  />

                  {/* Modifiers */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-steel-900">Price Modifiers</label>
                      <Button variant="outline" size="sm" onClick={addModifier} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Add Modifier
                      </Button>
                    </div>
                    {modifiers.map((mod, idx) => (
                      <div key={idx} className="border border-steel-200 rounded-xl p-4 space-y-3 bg-steel-50/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-steel-500">Modifier #{idx + 1}</span>
                          <button onClick={() => removeModifier(idx)} className="text-steel-400 hover:text-red-500 transition-colors">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <Input label="Label" value={mod.label} onChange={(e) => updateModifier(idx, 'label', e.target.value)} placeholder="e.g., Thickness: 0.48mm" />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-steel-700 mb-1">Attribute</label>
                            <select value={mod.condition.attribute} onChange={(e) => updateModifier(idx, 'condition.attribute', e.target.value)} className={selectClass}>
                              <option value="">Select attribute</option>
                              {attributes.map((a) => (
                                <option key={a._id} value={a._id}>{a.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-steel-700 mb-1">Value</label>
                            <select value={mod.condition.value} onChange={(e) => updateModifier(idx, 'condition.value', e.target.value)} className={selectClass}>
                              <option value="">Select value</option>
                              {getAttributeById(mod.condition.attribute)?.values.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-steel-700 mb-1">Adjustment Type</label>
                            <select value={mod.adjustmentType} onChange={(e) => updateModifier(idx, 'adjustmentType', e.target.value)} className={selectClass}>
                              <option value="multiplier">Multiplier (e.g., 1.15 = +15%)</option>
                              <option value="fixed_add">Fixed Add (e.g., +$2.00)</option>
                              <option value="percentage_add">Percentage Add (e.g., +10%)</option>
                            </select>
                          </div>
                          <Input label="Value" type="number" step="0.01" value={String(mod.adjustmentValue)} onChange={(e) => updateModifier(idx, 'adjustmentValue', parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quantity Breaks */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-steel-900">Quantity Breaks</label>
                      <Button variant="outline" size="sm" onClick={addQuantityBreak} leftIcon={<Plus className="h-3.5 w-3.5" />}>
                        Add Break
                      </Button>
                    </div>
                    {quantityBreaks.map((qb, idx) => (
                      <div key={idx} className="grid grid-cols-5 gap-3 items-end">
                        <Input label="Min Qty" type="number" value={String(qb.minQty)} onChange={(e) => updateQuantityBreak(idx, 'minQty', parseInt(e.target.value) || 0)} />
                        <Input label="Max Qty" type="number" value={String(qb.maxQty)} onChange={(e) => updateQuantityBreak(idx, 'maxQty', parseInt(e.target.value) || 0)} />
                        <div>
                          <label className="block text-sm font-medium text-steel-700 mb-1">Type</label>
                          <select value={qb.discountType} onChange={(e) => updateQuantityBreak(idx, 'discountType', e.target.value)} className={selectClass}>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </div>
                        <Input label="Discount" type="number" step="0.01" value={String(qb.discountValue)} onChange={(e) => updateQuantityBreak(idx, 'discountValue', parseFloat(e.target.value) || 0)} />
                        <button onClick={() => removeQuantityBreak(idx)} className="mb-1 rounded p-2 text-steel-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Trade Modifier */}
                  <div className="border-t border-steel-100 pt-5">
                    <label className="text-sm font-semibold text-steel-900 block mb-3">Trade Price Modifier</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-steel-700 mb-1">Type</label>
                        <select value={tradePriceModifier.adjustmentType} onChange={(e) => setTradePriceModifier({ ...tradePriceModifier, adjustmentType: e.target.value as any })} className={selectClass}>
                          <option value="percentage_add">Percentage</option>
                          <option value="fixed_add">Fixed</option>
                        </select>
                      </div>
                      <Input
                        label="Value (negative for discount)"
                        type="number"
                        step="0.01"
                        value={String(tradePriceModifier.adjustmentValue)}
                        onChange={(e) => setTradePriceModifier({ ...tradePriceModifier, adjustmentValue: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Sidebar */}
        <div className="space-y-6">
          {/* Image Upload */}
          <div className="rounded-xl bg-white border border-steel-100 p-5">
            <h3 className="text-sm font-semibold text-steel-900 mb-3">Product Images</h3>

            {/* Preview selected images */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-steel-200">
                    <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-24 object-cover" />
                    <button
                      onClick={() => {
                        const newFiles = imageFiles.filter((_, i) => i !== idx);
                        const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                        setImageFiles(newFiles);
                        setImagePreviews(newPreviews);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-steel-200 rounded-xl p-6 text-center hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
                <Upload className="mx-auto h-8 w-8 text-steel-400" />
                <p className="text-xs text-steel-600 mt-2 font-medium">Click to select images</p>
                <p className="text-[11px] text-steel-400 mt-0.5">PNG, JPG up to 5MB each</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  setImageFiles((prev) => [...prev, ...files]);
                  const previews = files.map((f) => URL.createObjectURL(f));
                  setImagePreviews((prev) => [...prev, ...previews]);
                  e.target.value = '';
                }}
              />
            </label>
            {imageFiles.length > 0 && (
              <p className="text-xs text-steel-500 mt-2">{imageFiles.length} image{imageFiles.length > 1 ? 's' : ''} selected — will upload on save</p>
            )}
          </div>

          {/* Status & Visibility */}
          <div className="rounded-xl bg-white border border-steel-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-steel-900">Status & Visibility</h3>
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectClass}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectClass}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {'—'.repeat(cat.level)} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-steel-700 mb-1">Available To</label>
              <select value={availableTo} onChange={(e) => setAvailableTo(e.target.value as any)} className={selectClass}>
                <option value="all">All Customers</option>
                <option value="retail">Retail Only</option>
                <option value="trade">Trade Only</option>
              </select>
            </div>
            <Input label="Min Order Qty" type="number" value={minimumOrderQty} onChange={(e) => setMinimumOrderQty(e.target.value)} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-steel-300 text-brand-600" />
              Featured Product
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
