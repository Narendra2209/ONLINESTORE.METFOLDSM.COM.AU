'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Category } from '@/types/product';
import toast from 'react-hot-toast';
import LogoLoader from '@/components/ui/LogoLoader';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, GripVertical } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formParent, setFormParent] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState('0');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/categories?tree=true');
      setCategories(data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const openCreate = (parentId?: string) => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setFormParent(parentId || '');
    setFormIsActive(true);
    setFormSortOrder('0');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormDescription(cat.description || '');
    setFormParent(cat.parent || '');
    setFormIsActive(cat.isActive);
    setFormSortOrder(String(cat.sortOrder));
    setShowModal(true);
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
        description: formDescription,
        parent: formParent || null,
        isActive: formIsActive,
        sortOrder: parseInt(formSortOrder) || 0,
      };

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/admin/categories', payload);
        toast.success('Category created');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in this category will be uncategorized.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const flatCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (items: Category[]) => {
      items.forEach((c) => {
        result.push(c);
        if (c.children) flatten(c.children);
      });
    };
    flatten(cats);
    return result;
  };

  const renderCategory = (cat: Category, depth = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expanded.has(cat._id);

    return (
      <React.Fragment key={cat._id}>
        <tr className="hover:bg-steel-50/50 group">
          <td className="px-4 py-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              <GripVertical className="h-4 w-4 text-steel-300 opacity-0 group-hover:opacity-100 cursor-grab" />
              {hasChildren ? (
                <button onClick={() => toggleExpand(cat._id)} className="text-steel-400 hover:text-steel-600">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              ) : (
                <span className="w-4" />
              )}
              <FolderTree className="h-4 w-4 text-brand-500" />
              <span className="font-medium text-steel-900">{cat.name}</span>
            </div>
          </td>
          <td className="px-4 py-3 text-steel-500 text-xs font-mono">{cat.slug}</td>
          <td className="px-4 py-3">
            <Badge variant={cat.isActive ? 'success' : 'default'}>
              {cat.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </td>
          <td className="px-4 py-3 text-steel-500">{cat.productCount ?? '—'}</td>
          <td className="px-4 py-3 text-steel-500">{cat.sortOrder}</td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => openCreate(cat._id)}
                className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600"
                title="Add subcategory"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => openEdit(cat)}
                className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(cat._id)}
                className="rounded p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && cat.children!.map((child) => renderCategory(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Categories</h1>
          <p className="text-sm text-steel-500">Organize your product catalog</p>
        </div>
        <Button size="sm" onClick={() => openCreate()} leftIcon={<Plus className="h-4 w-4" />}>
          Add Category
        </Button>
      </div>

      <div className="mt-6 rounded-xl bg-white border border-steel-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <LogoLoader size="sm" text="Loading..." />
              </td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-steel-500">No categories yet</td></tr>
            ) : (
              categories.map((cat) => renderCategory(cat))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <Input label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-700 mb-1">Parent Category</label>
            <select
              value={formParent}
              onChange={(e) => setFormParent(e.target.value)}
              className="w-full rounded-lg border border-steel-300 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">None (Top Level)</option>
              {flatCategories(categories)
                .filter((c) => c._id !== editingCategory?._id)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {'—'.repeat(c.level)} {c.name}
                  </option>
                ))}
            </select>
          </div>
          <Input label="Sort Order" type="number" value={formSortOrder} onChange={(e) => setFormSortOrder(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="rounded" />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} isLoading={saving}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
