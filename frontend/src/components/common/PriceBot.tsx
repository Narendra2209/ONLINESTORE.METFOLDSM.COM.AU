'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Package, Tag } from 'lucide-react';
import { productApi } from '@/services/product.service';
import { formatCurrency } from '@/lib/utils';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  productData?: any;
}

export default function PriceBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: 'Hi! I can help you look up prices by inventory code (SKU). Type a SKU code to get started.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sku = input.trim();
    if (!sku || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: sku,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await productApi.skuLookup(sku);

      if (result.found) {
        const p = result.product;
        const price =
          p.price != null
            ? formatCurrency(p.price)
            : p.priceRange
              ? `${formatCurrency(p.priceRange.min)} – ${formatCurrency(p.priceRange.max)}`
              : 'Price on request';

        const pricingLabel =
          p.pricingModel === 'per_metre'
            ? '/metre'
            : p.pricingModel === 'per_sheet'
              ? '/sheet'
              : p.pricingModel === 'per_piece'
                ? '/piece'
                : '';

        let attrText = '';
        if (p.attributes && p.attributes.length > 0) {
          attrText = p.attributes
            .map((a: any) => `${a.attributeName}: ${a.value}`)
            .join(', ');
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: '',
            productData: {
              name: p.name,
              sku: p.sku,
              price,
              pricingLabel,
              category: p.category?.name || '',
              image: p.image,
              attributes: attrText,
              type: p.type,
            },
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            text: result.message || `No product found for SKU "${sku}". Please check the code and try again.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          aria-label="Open price lookup"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[480px] w-[360px] flex-col overflow-hidden rounded-2xl border border-steel-200 bg-white shadow-2xl sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              <span className="font-semibold text-sm">Price Lookup</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 transition-colors hover:bg-brand-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.productData ? (
                  <div className="max-w-[85%] rounded-xl bg-steel-50 border border-steel-100 p-3 space-y-2">
                    {msg.productData.image && (
                      <img
                        src={msg.productData.image}
                        alt={msg.productData.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <p className="text-sm font-semibold text-steel-900">
                      {msg.productData.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-steel-500">
                      <Package className="h-3.5 w-3.5" />
                      <span>SKU: {msg.productData.sku}</span>
                    </div>
                    {msg.productData.category && (
                      <p className="text-xs text-steel-400">
                        {msg.productData.category}
                      </p>
                    )}
                    {msg.productData.attributes && (
                      <p className="text-xs text-steel-500">
                        {msg.productData.attributes}
                      </p>
                    )}
                    <div className="border-t border-steel-200 pt-2">
                      <span className="text-lg font-bold text-brand-600">
                        {msg.productData.price}
                      </span>
                      {msg.productData.pricingLabel && (
                        <span className="text-xs text-steel-500 ml-1">
                          {msg.productData.pricingLabel}
                        </span>
                      )}
                    </div>
                    {msg.productData.type === 'variant' && (
                      <p className="text-xs text-steel-400 italic">
                        Variant match
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                      msg.type === 'user'
                        ? 'bg-brand-600 text-white'
                        : 'bg-steel-100 text-steel-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-steel-100 px-3.5 py-2.5 text-sm text-steel-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Looking up...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-steel-200 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter SKU code (e.g. CBCR24)"
              className="flex-1 rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
