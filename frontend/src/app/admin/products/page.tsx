'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { Plus, Search, Edit, Copy, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoLoader from '@/components/ui/LogoLoader';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const { data } = await api.get(`/admin/products?${params}`);
      setProducts(data.data);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/admin/products/${id}/duplicate`);
      toast.success('Product duplicated');
      fetchProducts();
    } catch {
      toast.error('Failed to duplicate');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product archived');
      fetchProducts();
    } catch {
      toast.error('Failed to archive');
    }
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Products</h1>
          <p className="text-sm text-steel-500">{total} total products</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/imports">
            <Button variant="outline" size="sm">Bulk Import</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU..."
            className="w-full rounded-lg border border-steel-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-xl bg-white border border-steel-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <LogoLoader size="sm" text="Loading..." />
              </td></tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-steel-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-steel-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-steel-900">{product.name}</div>
                    <div className="text-xs text-steel-500">
                      {(product.category as any)?.name || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-steel-600">{product.sku}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.type === 'configurable' ? 'info' : 'default'}>
                      {product.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(product.status)}>
                      {product.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {product.price
                      ? formatCurrency(product.price)
                      : (product as any).priceRange
                      ? `${formatCurrency((product as any).priceRange.min)} - ${formatCurrency((product as any).priceRange.max)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${product.slug}`} target="_blank">
                        <button className="rounded p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/products/${product._id}/edit`}>
                        <button className="rounded p-1.5 text-steel-400 hover:bg-brand-50 hover:text-brand-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDuplicate(product._id)}
                        className="rounded p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="rounded p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
