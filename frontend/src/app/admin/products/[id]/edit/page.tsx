'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Attribute, Category } from '@/types/product';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Plus, Trash2, X, Upload, Star, Loader2 } from 'lucide-react';

type Tab = 'general' | 'attributes' | 'pricing' | 'images';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);

  // General
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [type, setType] = useState<'simple' | 'configurable'>('simple');
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('draft');
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
  const [pricingRules, setPricingRules] = useState<any[]>([]);

  // Images
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, catRes, attrRes] = await Promise.all([
          api.get(`/admin/products/${productId}`),
          api.get('/categories?flat=true'),
          api.get('/admin/attributes'),
        ]);

        const p = productRes.data.data;
        setCategories(catRes.data.data || []);
        setAllAttributes(attrRes.data.data || []);

        // Populate form
        setName(p.name);
        setSku(p.sku);
        setType(p.type);
        setStatus(p.status);
        setCategoryId(p.category?._id || p.category || '');
        setShortDescription(p.shortDescription || '');
        setDescription(p.description || '');
        setTags(p.tags?.join(', ') || '');
        setAvailableTo(p.availableTo || 'all');
        setIsFeatured(p.isFeatured || false);
        setPrice(p.price?.toString() || '');
        setCompareAtPrice(p.compareAtPrice?.toString() || '');
        setStock(p.stock?.toString() || '0');
        setTrackInventory(p.trackInventory ?? true);
        setMinimumOrderQty(p.minimumOrderQty?.toString() || '1');
        setPricingModel(p.pricingModel || 'per_metre');
        setMinLength(p.minLength?.toString() || '');
        setMaxLength(p.maxLength?.toString() || '');
        setImages(p.images || []);

        if (p.configurableAttributes) {
          setSelectedAttributes(
            p.configurableAttributes.map((ca: any) => ({
              attribute: ca.attribute?._id || ca.attribute,
              isRequired: ca.isRequired,
              allowedValues: ca.allowedValues || [],
            }))
          );
        }

        if (p.pricingRules) {
          setPricingRules(p.pricingRules);
        }
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const addAttribute = () => {
    setSelectedAttributes([...selectedAttributes, { attribute: '', isRequired: true, allowedValues: [] }]);
  };

  const removeAttribute = (index: number) => {
    setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: string, value: any) => {
    const updated = [...selectedAttributes];
    (updated[index] as any)[field] = value;
    if (field === 'attribute') updated[index].allowedValues = [];
    setSelectedAttributes(updated);
  };

  const toggleAllowedValue = (attrIndex: number, value: string) => {
    const updated = [...selectedAttributes];
    const vals = updated[attrIndex].allowedValues;
    updated[attrIndex].allowedValues = vals.includes(value)
      ? vals.filter((v) => v !== value)
      : [...vals, value];
    setSelectedAttributes(updated);
  };

  const getAttributeById = (id: string) => allAttributes.find((a) => a._id === id);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));

      const { data } = await api.post(`/admin/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(data.data);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { data } = await api.delete(`/admin/products/${productId}/images/${imageId}`);
      setImages(data.data);
      toast.success('Image deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleSetDefaultImage = async (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isDefault: img._id === imageId }))
    );
    // Save via product update
    try {
      await api.put(`/admin/products/${productId}`, {
        images: images.map((img) => ({ ...img, isDefault: img._id === imageId })),
      });
      toast.success('Default image updated');
    } catch {
      toast.error('Failed to update default image');
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !sku.trim()) {
      toast.error('Name and SKU are required');
      return;
    }

    setSaving(true);
    try {
      const productData: any = {
        name,
        sku,
        type,
        status,
        category: categoryId || undefined,
        shortDescription,
        description,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
        availableTo,
        isFeatured,
        trackInventory,
        minimumOrderQty: parseInt(minimumOrderQty) || 1,
      };

      // Always send attributes
      productData.configurableAttributes = selectedAttributes
        .filter((a) => a.attribute)
        .map((a, i) => ({
          attribute: a.attribute,
          isRequired: a.isRequired,
          sortOrder: i,
          allowedValues: a.allowedValues,
        }));

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

      await api.put(`/admin/products/${productId}`, productData);
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'attributes', label: 'Attributes' },
    ...(type === 'configurable' ? [{ key: 'pricing' as Tab, label: 'Pricing Rules' }] : []),
    { key: 'images', label: 'Images' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-steel-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-steel-100">
            <ArrowLeft className="h-5 w-5 text-steel-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-steel-900">Edit Product</h1>
            <p className="text-sm text-steel-500">{sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status === 'active' ? 'success' : status === 'draft' ? 'warning' : 'danger'}>
            {status}
          </Badge>
          <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 border-b border-steel-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-steel-500 hover:text-steel-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-steel-900">Basic Information</h2>
                <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} required />
                  <div>
                    <label className="block text-sm font-medium text-steel-700 mb-1">Product Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                    >
                      <option value="simple">Simple</option>
                      <option value="configurable">Configurable</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1">Short Description</label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <Input
                  label="Tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  helperText="Comma-separated"
                />
              </div>

              {type === 'simple' && (
                <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-steel-900">Pricing & Stock</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Price (AUD)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
                    <Input label="Compare At Price" type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                    <Input label="Minimum Order Qty" type="number" value={minimumOrderQty} onChange={(e) => setMinimumOrderQty(e.target.value)} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={trackInventory} onChange={(e) => setTrackInventory(e.target.checked)} className="rounded" />
                    Track inventory
                  </label>
                </div>
              )}

              {type === 'configurable' && (
                <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-steel-900">Configurable Settings</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-steel-700 mb-1">Pricing Model</label>
                      <select
                        value={pricingModel}
                        onChange={(e) => setPricingModel(e.target.value as any)}
                        className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                      >
                        <option value="per_metre">Per Metre</option>
                        <option value="per_piece">Per Piece</option>
                        <option value="per_sheet">Per Sheet</option>
                        <option value="quote_only">Quote Only</option>
                      </select>
                    </div>
                    <Input label="Minimum Order Qty" type="number" value={minimumOrderQty} onChange={(e) => setMinimumOrderQty(e.target.value)} />
                  </div>
                  {pricingModel === 'per_metre' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Min Length (m)" type="number" step="0.1" value={minLength} onChange={(e) => setMinLength(e.target.value)} />
                      <Input label="Max Length (m)" type="number" step="0.1" value={maxLength} onChange={(e) => setMaxLength(e.target.value)} />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-steel-900">Organization</h2>
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-steel-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  >
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
                  <select
                    value={availableTo}
                    onChange={(e) => setAvailableTo(e.target.value as any)}
                    className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                  >
                    <option value="all">All Customers</option>
                    <option value="retail">Retail Only</option>
                    <option value="trade">Trade Only</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
                  Featured Product
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === 'attributes' && (
          <div className="rounded-xl bg-white border border-steel-100 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-steel-900">Product Attributes</h2>
              <Button variant="outline" size="sm" onClick={addAttribute} leftIcon={<Plus className="h-4 w-4" />}>
                Add Attribute
              </Button>
            </div>
            {selectedAttributes.length === 0 && (
              <p className="text-sm text-steel-500 py-8 text-center">No attributes configured.</p>
            )}
            {selectedAttributes.map((sa, idx) => {
              const attr = getAttributeById(sa.attribute);
              return (
                <div key={idx} className="border border-steel-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-steel-700">Attribute #{idx + 1}</h3>
                    <button onClick={() => removeAttribute(idx)} className="text-steel-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-steel-700 mb-1">Attribute</label>
                      <select
                        value={sa.attribute}
                        onChange={(e) => updateAttribute(idx, 'attribute', e.target.value)}
                        className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                      >
                        <option value="">Select attribute</option>
                        {allAttributes.map((a) => (
                          <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm pt-7">
                      <input
                        type="checkbox"
                        checked={sa.isRequired}
                        onChange={(e) => updateAttribute(idx, 'isRequired', e.target.checked)}
                        className="rounded"
                      />
                      Required
                    </label>
                  </div>
                  {attr && attr.values.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-steel-700 mb-2">Allowed Values</label>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((v) => (
                          <button
                            key={v.value}
                            onClick={() => toggleAllowedValue(idx, v.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                              sa.allowedValues.includes(v.value)
                                ? 'bg-brand-50 border-brand-500 text-brand-700'
                                : 'border-steel-200 text-steel-600 hover:border-steel-300'
                            }`}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pricing Rules Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {pricingRules.length > 0 ? (
              pricingRules.map((rule, idx) => (
                <div key={idx} className="rounded-xl bg-white border border-steel-100 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-steel-900">{rule.name || `Rule #${idx + 1}`}</h2>
                    <Badge variant={rule.isActive ? 'success' : 'default'}>{rule.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-steel-500">Base Rate:</span>
                      <span className="ml-2 font-medium">${rule.baseRate?.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-steel-500">Modifiers:</span>
                      <span className="ml-2 font-medium">{rule.modifiers?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-steel-500">Qty Breaks:</span>
                      <span className="ml-2 font-medium">{rule.quantityBreaks?.length || 0}</span>
                    </div>
                  </div>
                  {rule.modifiers && rule.modifiers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-steel-700 mb-2">Modifiers</p>
                      <div className="space-y-1">
                        {rule.modifiers.map((mod: any, mIdx: number) => (
                          <div key={mIdx} className="flex items-center gap-2 text-sm text-steel-600">
                            <span className="font-medium">{mod.label}:</span>
                            <span>
                              {mod.adjustmentType === 'multiplier' ? `×${mod.adjustmentValue}` :
                               mod.adjustmentType === 'fixed_add' ? `+$${mod.adjustmentValue}` :
                               `+${mod.adjustmentValue}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-white border border-steel-100 p-12 text-center">
                <p className="text-steel-500">No pricing rules configured.</p>
                <p className="text-sm text-steel-400 mt-1">Save the product first, then add pricing rules from the product list.</p>
              </div>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="rounded-xl bg-white border border-steel-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-steel-900">Product Images</h2>
              <span className="text-sm text-steel-500">{images.length} image(s)</span>
            </div>

            {/* Existing images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {images.map((img) => (
                  <div key={img._id} className="group relative rounded-lg border border-steel-200 overflow-hidden">
                    <div className="aspect-square bg-steel-50">
                      <img
                        src={img.url}
                        alt={img.alt || name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {img.isDefault && (
                      <div className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        Default
                      </div>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!img.isDefault && (
                        <button
                          onClick={() => handleSetDefaultImage(img._id)}
                          className="rounded bg-white/90 p-1.5 text-steel-600 hover:text-brand-600 shadow-sm"
                          title="Set as default"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteImage(img._id)}
                        className="rounded bg-white/90 p-1.5 text-steel-600 hover:text-red-600 shadow-sm"
                        title="Delete image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                uploading ? 'border-brand-300 bg-brand-50' : 'border-steel-200 hover:border-brand-400 hover:bg-steel-50'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                  <p className="text-sm text-brand-600 font-medium">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-steel-400" />
                  <p className="text-sm text-steel-500">Click to upload images</p>
                  <p className="text-xs text-steel-400">PNG, JPG, WebP up to 5MB each. Max 10 at a time.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
