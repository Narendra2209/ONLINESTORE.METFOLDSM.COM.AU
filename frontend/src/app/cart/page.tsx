'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Package, ShieldCheck, Truck, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  // Delivery/Pickup state
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: 'VIC', postcode: '' });
  const [scheduledDate, setScheduledDate] = useState('');
  const [comment, setComment] = useState('');

  const BRANCHES = [
    { id: 'sunbury', name: 'METFOLD - SUNBURY', address: '51 McDougall Road, Sunbury, Victoria 3429', phone: '(03) 9732 0148' },
    { id: 'melton', name: 'METFOLD - MELTON', address: '16 Collins Road, Melton, Victoria 3339', phone: '(03) 9747 9044' },
    { id: 'pakenham', name: 'METFOLD - PAKENHAM', address: '47 Sette CCT, Pakenham, Victoria 3810', phone: '(03) 5910 6099' },
    { id: 'moama', name: 'METFOLD - MOAMA', address: '11 Bowlan St, Moama, NSW 2731', phone: '(03) 5482 1468' },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  // Helper: load image to base64
  const loadImageAsDataUrl = (url: string, w: number, h: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(''); return; }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h); resolve(canvas.toDataURL('image/png')); };
      img.onerror = () => resolve('');
      img.src = url;
    });
  };

  // Generate PDF matching Metfold order sheet format
  const downloadCartPdf = useCallback(async () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 8;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;
    const orderNum = `M4Tfold-${String(Date.now()).slice(-4)}`;
    const dateStr = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const getAttr = (item: typeof items[0], name: string) =>
      item.selectedAttributes.find((a) => a.attributeName === name)?.value || '';

    const checkPage = (needed: number) => {
      if (y + needed > pageHeight - 10) { doc.addPage(); y = margin; }
    };

    // ═══════════ PAGE HEADER ═══════════
    // Try to load logo
    let logoData = '';
    try {
      logoData = await loadImageAsDataUrl('/images/logo.png', 400, 100);
    } catch { /* skip */ }

    const drawHeader = () => {
      const hY = y;

      // Logo — top left
      if (logoData) {
        doc.addImage(logoData, 'PNG', margin, hY, 55, 14);
      } else {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 100, 100);
        doc.text('METFOLD SHEET METAL', margin, hY + 10);
      }

      // Order number — top right
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(orderNum, pageWidth - margin, hY + 10, { align: 'right' });

      y = hY + 18;

      // ── Customer info section ──
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);

      // Row 1 — Order date (today) + Scheduled delivery/pickup date
      const schedLabel = deliveryMethod === 'pickup' ? 'Sched. Pickup-' : 'Sched. Delivery-';
      const schedFormatted = scheduledDate
        ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

      doc.text('Date:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(dateStr, margin + 13, y);

      doc.setFont('helvetica', 'bold');
      doc.text(schedLabel, margin + 50, y);
      doc.setFont('helvetica', 'normal');
      doc.text(schedFormatted, margin + 85, y);

      if (user) {
        doc.setFont('helvetica', 'bold');
        doc.text('PO No.', margin + 170, y);
      }
      y += 5;

      // Row 2 — Contact
      const contactName = deliveryMethod === 'delivery' ? address.name : (user ? `${user.firstName} ${user.lastName}` : '');
      const contactPhone = deliveryMethod === 'delivery' ? address.phone : '';
      doc.setFont('helvetica', 'bold');
      doc.text('Contact-', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${contactName}`, margin + 20, y);
      if (contactPhone) doc.text(contactPhone, margin + 65, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Order Placed by-', margin + 100, y);
      doc.setFont('helvetica', 'normal');
      doc.text(user ? `${user.firstName} ${user.lastName}` : '', margin + 135, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Phone-', margin + 185, y);
      doc.setFont('helvetica', 'normal');
      doc.text(contactPhone, margin + 200, y);
      y += 5;

      // Row 3 — Customer + Dispatch
      doc.setFont('helvetica', 'bold');
      doc.text('Customer:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(user?.email || '', margin + 25, y);

      doc.setFont('helvetica', 'bold');
      doc.text('Dispatch-', margin + 170, y);
      doc.setFont('helvetica', 'normal');
      doc.text(deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup', margin + 195, y);
      y += 5;

      // Row 4 — Delivery Address or Pickup Branch
      doc.setFont('helvetica', 'bold');
      doc.text('Delivery Address:', margin, y);
      doc.setFont('helvetica', 'normal');
      if (deliveryMethod === 'delivery') {
        doc.text(`${address.street}, ${address.city}, ${address.state} ${address.postcode}`, margin + 40, y);
      } else {
        const branch = BRANCHES.find(b => b.id === selectedBranch);
        doc.text(branch ? `PICKUP: ${branch.name} — ${branch.address}` : '', margin + 40, y);
      }
      y += 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Comment to Production-', margin, y);
      doc.setFont('helvetica', 'normal');
      if (comment) doc.text(comment, margin + 50, y);
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.text('Comment to Transport-', margin, y);
      y += 3;

      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 3;
    };

    drawHeader();

    // ═══════════ PRODUCT ITEMS — 2 per row ═══════════
    const colWidth = (contentWidth - 4) / 2; // 2 columns with 4mm gap
    const diagramW = colWidth * 0.6;
    const infoW = colWidth * 0.4;
    const itemH = 70;

    for (let idx = 0; idx < items.length; idx += 2) {
      checkPage(itemH + 5);
      const rowY = y;

      for (let col = 0; col < 2; col++) {
        if (idx + col >= items.length) break;
        const item = items[idx + col];
        const xStart = margin + col * (colWidth + 4);

        // ── OUTER BOX ──
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.4);
        doc.rect(xStart, rowY, colWidth, itemH);

        // ── VERTICAL DIVIDER ──
        const divX = xStart + diagramW;
        doc.line(divX, rowY, divX, rowY + itemH);

        // ── TOP BAR — grey with girth ──
        doc.setFillColor(210, 210, 210);
        doc.rect(xStart, rowY, diagramW, 7, 'F');
        doc.setDrawColor(0, 0, 0);
        doc.rect(xStart, rowY, diagramW, 7);

        // Colour swatch
        doc.setFillColor(180, 180, 180);
        doc.rect(xStart + 1.5, rowY + 1.5, 4, 4, 'F');

        // Product name + Girth (if flashing)
        const girthVal = getAttr(item, 'Total Girth').replace('mm', '');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const isFlashing = item.product.slug === 'custom-flashing';
        const displayName = isFlashing ? 'Flashing' : item.product.name;
        const headerText = girthVal
          ? `${displayName}  |  Girth: ${girthVal}`
          : displayName;
        doc.text(headerText, xStart + 8, rowY + 5.5);

        // ── DIAGRAM IMAGE ──
        const imgAreaY = rowY + 8;
        const imgAreaH = itemH - 8;
        const image = item.product.images?.[0];

        if (image?.url) {
          try {
            let imgData = image.url;
            if (image.url.startsWith('data:image/svg+xml') || image.url.startsWith('http')) {
              imgData = await loadImageAsDataUrl(image.url, 600, 360);
            }
            if (imgData && imgData.startsWith('data:image')) {
              doc.addImage(imgData, 'PNG', xStart + 2, imgAreaY + 1, diagramW - 4, imgAreaH - 3);
            }
          } catch {
            // skip image
          }
        } else {
          // No image — show name
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(150, 150, 150);
          doc.text(item.product.name, xStart + diagramW / 2, imgAreaY + imgAreaH / 2, { align: 'center' });
        }

        // ── RIGHT INFO PANEL ──
        const infoX = divX + 3;
        let iY = rowY + 5;

        // Material
        // SKU
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`SKU: ${item.product.sku}`, infoX, iY);
        iY += 5;

        // Material
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Material:', infoX, iY);
        iY += 4;
        doc.setFont('helvetica', 'normal');
        doc.text((getAttr(item, 'Material') || 'N/A').toUpperCase(), infoX, iY);
        iY += 5;

        // Revision (Colour)
        doc.setFont('helvetica', 'bold');
        doc.text('Revision:', infoX, iY);
        iY += 4;
        doc.setFont('helvetica', 'normal');
        doc.text((getAttr(item, 'Colour') || 'N/A').toUpperCase(), infoX, iY);
        iY += 6;

        // Gauge
        const gaugeVal = getAttr(item, 'Gauge');
        if (gaugeVal) {
          doc.setFont('helvetica', 'bold');
          doc.text('Gauge:', infoX, iY);
          doc.setFont('helvetica', 'normal');
          doc.text(gaugeVal, infoX + 15, iY);
          iY += 6;
        }

        // Qty/Length
        doc.setFont('helvetica', 'bold');
        doc.text('Qty/Length', infoX, iY);
        iY += 5;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const lengthStr = item.length ? `X${item.length.toFixed(3)}` : '';
        doc.text(`${item.quantity} ${lengthStr}`, infoX, iY);
        iY += 5;

        // Tag
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const tagVal = getAttr(item, 'Tag Name') || `${idx + col + 1}`;
        doc.text(`Tag: ${tagVal}`, infoX, iY);
        iY += 5;

        // Folds
        const foldsVal = getAttr(item, 'Folds');
        if (foldsVal && foldsVal !== '0') {
          doc.setFontSize(7);
          doc.text(`Folds: ${foldsVal}`, infoX, iY);
          iY += 4;
        }
        const sf = getAttr(item, 'Start Fold');
        if (sf) { doc.setFontSize(7); doc.text(`SF: ${sf}`, infoX, iY); iY += 4; }
        const ef = getAttr(item, 'End Fold');
        if (ef) { doc.setFontSize(7); doc.text(`EF: ${ef}`, infoX, iY); iY += 4; }
      }

      y = rowY + itemH + 3;
    }

    // ═══════════ FOOTER ═══════════
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Metfold Sheet Metal — www.metfoldsm.com.au', margin, pageHeight - 4);
    doc.text(orderNum, pageWidth - margin, pageHeight - 4, { align: 'right' });

    const fileName = `${orderNum}_${dateStr.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }, [items, user, deliveryMethod, address, selectedBranch, scheduledDate, comment]);

  // Validate all details before download/order
  const validateOrder = (): boolean => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      router.push('/login');
      return false;
    }
    if (deliveryMethod === 'delivery') {
      if (!address.name.trim()) { toast.error('Please enter contact name'); return false; }
      if (!address.phone.trim()) { toast.error('Please enter phone number'); return false; }
      if (!address.street.trim()) { toast.error('Please enter delivery address'); return false; }
      if (!address.city.trim()) { toast.error('Please enter city'); return false; }
      if (!address.postcode.trim()) { toast.error('Please enter postcode'); return false; }
      if (!scheduledDate) { toast.error('Please select a delivery date'); return false; }
    } else {
      if (!selectedBranch) { toast.error('Please select a pickup branch'); return false; }
      if (!scheduledDate) { toast.error('Please select a pickup date'); return false; }
    }
    return true;
  };

  // Handle Place Order
  const handlePlaceOrder = () => {
    if (!validateOrder()) return;
    downloadCartPdf();
    toast.success('Order placed! PDF downloaded.');
  };


  if (items.length === 0) {
    return (
      <div className="container-main py-20 text-center animate-fade-in-up">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-steel-100">
          <ShoppingBag className="h-10 w-10 text-steel-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-steel-900">Your cart is empty</h1>
        <p className="mt-2 text-steel-500 max-w-md mx-auto">
          Looks like you haven&apos;t added any products yet. Browse our catalogue to find what you need.
        </p>
        <Link href="/products">
          <Button className="mt-8 btn-shine" size="lg" leftIcon={<ArrowRight className="h-4 w-4" />}>
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-steel-50 min-h-screen">
      <div className="container-main py-6 animate-fade-in-up">
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold text-steel-900">Shopping Cart</h1>
            <p className="text-sm text-steel-500 mt-1">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-steel-500 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, index) => {
              const image = item.product.images?.[0];
              return (
                <div
                  key={item._id || index}
                  className="flex gap-4 rounded-xl bg-white p-4 border border-steel-100 hover:border-steel-200 transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Product image */}
                  <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-steel-50 border border-steel-100 overflow-hidden">
                    {image?.url ? (
                      <img
                        src={image.url}
                        alt={image.alt || item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-8 w-8 text-steel-300" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.product.slug === 'custom-flashing' ? '/flashing' : `/products/${item.product.slug}`}
                      className="font-semibold text-steel-900 hover:text-brand-600 transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-steel-400">SKU: {item.product.sku}</p>
                      {item.product.slug === 'custom-flashing' && (
                        <Link
                          href="/flashing?edit=true"
                          className="text-[10px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-0.5 rounded transition-colors"
                        >
                          Edit Flashing
                        </Link>
                      )}
                    </div>

                    {/* Selected attributes */}
                    {item.selectedAttributes.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.selectedAttributes
                          .filter((attr) => !attr.attributeName.startsWith('Segment '))
                          .map((attr, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-steel-50 px-2 py-0.5 text-[11px] font-medium text-steel-600 border border-steel-100"
                            >
                              {attr.attributeName}: {attr.value}
                            </span>
                          ))}
                        {item.length && (
                          <span className="inline-flex items-center rounded-md bg-steel-50 px-2 py-0.5 text-[11px] font-medium text-steel-600 border border-steel-100">
                            Length: {item.length}m
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-lg border border-steel-200 bg-white">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 text-steel-500 hover:bg-steel-50 hover:text-steel-700 disabled:opacity-30 rounded-l-lg transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-steel-900 border-x border-steel-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-2 text-steel-500 hover:bg-steel-50 hover:text-steel-700 rounded-r-lg transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-steel-900">
                          {formatCurrency(item.lineTotal)}
                        </span>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="rounded-lg p-1.5 text-steel-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details & Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-4">
              {/* Delivery / Pickup Toggle */}
              <div className="rounded-xl bg-white p-5 border border-steel-100 shadow-sm">
                <h2 className="text-base font-bold text-steel-900 mb-4">Delivery Method</h2>
                <div className="flex rounded-lg border border-steel-200 overflow-hidden">
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${deliveryMethod === 'delivery'
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-steel-600 hover:bg-steel-50'
                      }`}
                  >
                    <Truck className="h-4 w-4 inline mr-1.5" />
                    Delivery
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${deliveryMethod === 'pickup'
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-steel-600 hover:bg-steel-50'
                      }`}
                  >
                    <MapPin className="h-4 w-4 inline mr-1.5" />
                    Pickup
                  </button>
                </div>

                {/* Delivery Address Form */}
                {deliveryMethod === 'delivery' && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-steel-700 mb-1">Contact Name *</label>
                      <input
                        type="text"
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        placeholder="Full name"
                        className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-steel-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="04xx xxx xxx"
                        className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-steel-700 mb-1">Street Address *</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="Street address"
                        className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-steel-700 mb-1">City *</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="City"
                          className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-steel-700 mb-1">State</label>
                        <select
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="w-full rounded-lg border border-steel-200 px-2 py-2 text-sm focus:border-brand-500 focus:outline-none"
                        >
                          <option>VIC</option>
                          <option>NSW</option>
                          <option>QLD</option>
                          <option>SA</option>
                          <option>WA</option>
                          <option>TAS</option>
                          <option>NT</option>
                          <option>ACT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-steel-700 mb-1">Postcode *</label>
                        <input
                          type="text"
                          value={address.postcode}
                          onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
                          placeholder="3000"
                          className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pickup Branch Selection */}
                {deliveryMethod === 'pickup' && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-xs font-semibold text-steel-700 mb-2">Select Pickup Branch *</label>
                    {BRANCHES.map((branch) => (
                      <label
                        key={branch.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedBranch === branch.id
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-steel-200 hover:border-steel-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="branch"
                          value={branch.id}
                          checked={selectedBranch === branch.id}
                          onChange={() => setSelectedBranch(branch.id)}
                          className="mt-0.5 accent-brand-600"
                        />
                        <div>
                          <div className="text-sm font-bold text-steel-900">{branch.name}</div>
                          <div className="text-xs text-steel-500 mt-0.5">{branch.address}</div>
                          {branch.phone && (
                            <div className="text-xs text-brand-600 mt-0.5">{branch.phone}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Scheduled Date */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-steel-700 mb-1">
                    {deliveryMethod === 'delivery' ? 'Delivery Date *' : 'Pickup Date *'}
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Comment */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-steel-700 mb-1">Comment / Notes</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full rounded-lg border border-steel-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl bg-white p-5 border border-steel-100 shadow-sm">
                <h2 className="text-base font-bold text-steel-900">Order Summary</h2>
                <div className="mt-4 space-y-2.5 text-sm">
                  <div className="flex justify-between text-steel-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-steel-600">
                    <span>GST (10%)</span>
                    <span className="font-medium">{formatCurrency(gst)}</span>
                  </div>
                  <div className="flex justify-between text-steel-600">
                    <span>Shipping</span>
                    <span className="text-steel-400 italic">{deliveryMethod === 'pickup' ? 'Free (Pickup)' : 'Calculated'}</span>
                  </div>
                  <div className="border-t border-steel-100 pt-3 mt-1">
                    <div className="flex justify-between text-lg font-bold text-steel-900">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-steel-400 text-right">Inc. GST</p>
                  </div>
                </div>

                <Button
                  className="mt-5 w-full btn-shine"
                  size="lg"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>

                <Link
                  href="/products"
                  className="mt-3 flex items-center justify-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  Continue Shopping
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Trust signals */}
              <div className="rounded-xl bg-white p-4 border border-steel-100 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-steel-600">Secure SSL encrypted checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-brand-600 flex-shrink-0" />
                  <span className="text-steel-600">Australia-wide delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
