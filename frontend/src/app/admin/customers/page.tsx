'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import toast from 'react-hot-toast';
import { Search, Mail, Phone } from 'lucide-react';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  userType: 'retail' | 'trade';
  isActive: boolean;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  orderCount?: number;
  totalSpent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('userType', typeFilter);

      const { data } = await api.get(`/admin/customers?${params}`);
      setCustomers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotal(data.meta?.total || 0);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/customers/${id}`, { isApproved: !currentStatus });
      toast.success(currentStatus ? 'Approval revoked' : 'Customer approved');
      fetchCustomers();
    } catch {
      toast.error('Failed to update customer');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-steel-900">Customers</h1>
          <p className="text-sm text-steel-500">{total} registered customers</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company..."
            className="w-full rounded-lg border border-steel-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        </form>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-steel-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="retail">Retail</option>
          <option value="trade">Trade</option>
        </select>
      </div>

      <div className="mt-4 rounded-xl bg-white border border-steel-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 w-full animate-pulse rounded bg-steel-100" /></td></tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-steel-500">No customers found</td></tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} className="hover:bg-steel-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-steel-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      {customer.company && (
                        <div className="text-xs text-steel-500">{customer.company}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-steel-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-steel-500">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={customer.userType === 'trade' ? 'info' : 'default'}>
                      {customer.userType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Badge variant={customer.isActive ? 'success' : 'danger'}>
                        {customer.isActive ? 'Active' : 'Disabled'}
                      </Badge>
                      {customer.userType === 'trade' && (
                        <Badge variant={customer.isApproved ? 'success' : 'warning'}>
                          {customer.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-steel-500 text-xs">
                    {new Date(customer.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {customer.userType === 'trade' && !customer.isApproved && (
                      <button
                        onClick={() => handleToggleApproval(customer._id, customer.isApproved)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        Approve
                      </button>
                    )}
                    {customer.userType === 'trade' && customer.isApproved && (
                      <button
                        onClick={() => handleToggleApproval(customer._id, customer.isApproved)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100"
                      >
                        Revoke
                      </button>
                    )}
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
