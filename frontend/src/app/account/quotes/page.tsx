'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { formatCurrency, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';
import { FileText } from 'lucide-react';

interface QuoteOrder {
  _id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{ name: string; quantity: number }>;
  createdAt: string;
}

export default function AccountQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data } = await api.get('/orders?isQuoteRequest=true');
        setQuotes(data.data || []);
      } catch {
        toast.error('Failed to load quotes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-steel-900 mb-4">Quote Requests</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-white border border-steel-100 p-5 h-20 animate-pulse" />
          ))}
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-xl bg-white border border-steel-100 p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-steel-300 mb-3" />
          <p className="text-steel-500 mb-2">No quote requests yet</p>
          <p className="text-sm text-steel-400">
            Products marked as &quot;Quote Only&quot; will create quote requests instead of orders.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-steel-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-steel-50 text-left text-xs font-medium text-steel-500 uppercase">
              <tr>
                <th className="px-5 py-3">Quote #</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Est. Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-50">
              {quotes.map((quote) => (
                <tr key={quote._id} className="hover:bg-steel-50/50">
                  <td className="px-5 py-3">
                    <Link href={`/account/orders/${quote.orderNumber}`} className="font-medium text-brand-600 hover:text-brand-700">
                      {quote.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-steel-600">
                    {quote.items.length} item{quote.items.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-3 text-steel-600">{formatDate(quote.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={quote.status === 'confirmed' ? 'success' : 'warning'}>
                      {quote.status === 'pending' ? 'Awaiting Quote' : quote.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">
                    {quote.total > 0 ? formatCurrency(quote.total) : 'TBD'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
