'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Layers } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import LogoLoader from '@/components/ui/LogoLoader';

// ── TYPES ──

interface CladdingPanel {
  _id: string;
  product: string;
  material: string;
  rib: string;
  cover: number;
  basePrice: number;
  gauge: string;
  sku: string;
  uom: string;
}

interface PriceResult {
  sku: string;
  product: string;
  material: string;
  rib: string;
  cover: number;
  basePrice: number;
  length: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  uom: string;
}

// ── PRODUCT CARD IMAGES / DESCRIPTIONS ──

const PRODUCT_INFO: Record<string, { description: string; icon: string }> = {
  'Interlocking': {
    description: 'Clean, modern concealed fix panel with interlocking edges for a seamless finish.',
    icon: '▮▮▮',
  },
  'Nailstrip': {
    description: 'Traditional nailstrip profile with visible fixing for a classic industrial look.',
    icon: '▯▮▯',
  },
  'NailstriP': {
    description: 'Traditional nailstrip profile with visible fixing for a classic industrial look.',
    icon: '▯▮▯',
  },
  'Snaplock': {
    description: 'Snap-together concealed fix system for fast installation and clean lines.',
    icon: '▮▯▮',
  },
  'Standing Seam': {
    description: 'Premium standing seam profile with raised ribs for architectural applications.',
    icon: '╻╻╻',
  },
};

// ── MATERIAL COLOURS ──

const MATERIAL_COLOURS: Record<string, { name: string; hex: string }[]> = {
  'Colorbond': [
    { name: 'Basalt', hex: '#646560' },
    { name: 'Bluegum', hex: '#4A6670' },
    { name: 'Classic Cream', hex: '#E8D8A8' },
    { name: 'Cottage Green', hex: '#3A5243' },
    { name: 'Deep Ocean', hex: '#1B3A4B' },
    { name: 'Dover White', hex: '#E8E4D8' },
    { name: 'Dune', hex: '#B5A78C' },
    { name: 'Evening Haze', hex: '#C5BAA8' },
    { name: 'Gully', hex: '#5B6B52' },
    { name: 'Ironstone', hex: '#4A3C30' },
    { name: 'Jasper', hex: '#5C3A2E' },
    { name: 'Manor Red', hex: '#7B2D26' },
    { name: 'Monument', hex: '#35393B' },
    { name: 'Night Sky', hex: '#1E2326' },
    { name: 'Pale Eucalypt', hex: '#8DA07E' },
    { name: 'Paperbark', hex: '#C5B9A0' },
    { name: 'Shale Grey', hex: '#A8A49C' },
    { name: 'Southerly', hex: '#969E98' },
    { name: 'Surfmist', hex: '#DDD9CE' },
    { name: 'Wallaby', hex: '#817B6F' },
    { name: 'Windspray', hex: '#7E8580' },
    { name: 'Woodland Grey', hex: '#4B4D46' },
  ],
  'Matt Colorbond': [
    { name: 'Basalt', hex: '#5E5F5B' },
    { name: 'Bluegum', hex: '#4A6670' },
    { name: 'Dune', hex: '#ADA080' },
    { name: 'Monument', hex: '#2F3335' },
    { name: 'Shale Grey', hex: '#9E9A92' },
    { name: 'Surfmist', hex: '#D5D1C6' },
    { name: 'Wallaby', hex: '#797369' },
  ],
  'Ultra': [
    { name: 'Deep Ocean', hex: '#152F3F' },
    { name: 'Dune', hex: '#A99A80' },
    { name: 'Monument', hex: '#2A2E30' },
    { name: 'Shale Grey', hex: '#959189' },
    { name: 'Surfmist', hex: '#CCC8BD' },
    { name: 'Wallaby', hex: '#797369' },
    { name: 'Windspray', hex: '#7E8580' },
    { name: 'Woodland Grey', hex: '#4B4D46' },
  ],
  'Zincalume': [
    { name: 'Zincalume', hex: '#B0B5B3' },
  ],
  'Galvanised': [
    { name: 'Galvanised', hex: '#B0B5B3' },
  ],
  'Zinc': [
    { name: 'Zinc', hex: '#C4C8CB' },
  ],
  'Copper': [
    { name: 'Copper', hex: '#B87333' },
  ],
  'Corten': [
    { name: 'Corten', hex: '#8B4513' },
  ],
  'VM ZINC': [
    { name: 'VM ZINC', hex: '#A8ADB0' },
  ],
};

// Product name to slug mapping
const PRODUCT_SLUGS: Record<string, string> = {
  'Interlocking': 'interlocking',
  'NailstriP': 'nailstrip',
  'Nailstrip': 'nailstrip',
  'Snaplock': 'snaplock',
  'Standing Seam': 'standing-seam',
};

// ── HELPERS ──

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// ── COMPONENT ──

export default function CladdingPage() {
  const { addItem, setCartOpen } = useCartStore();

  // All panels loaded from backend
  const [allPanels, setAllPanels] = useState<CladdingPanel[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: 'products' or 'configure'
  const [selectedProduct, setSelectedProduct] = useState('');

  // Configuration state
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [selectedRib, setSelectedRib] = useState('');
  const [selectedCover, setSelectedCover] = useState<number | ''>('');
  const [length, setLength] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(1);

  // Price state
  const [priceResult, setPriceResult] = useState<PriceResult | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Load all panels on mount
  useEffect(() => {
    api.get('/cladding/panels')
      .then((res) => setAllPanels(res.data?.data || []))
      .catch(() => toast.error('Failed to load cladding panels'))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique product names
  const products = Array.from(new Set(allPanels.map((p) => p.product))).sort();

  // Panels for selected product
  const productPanels = allPanels.filter((p) => p.product === selectedProduct);

  // Derive available options filtered by selections
  const materials = Array.from(new Set(productPanels.map((p) => p.material))).sort();

  const ribs = Array.from(new Set(
    productPanels
      .filter((p) => !selectedMaterial || p.material === selectedMaterial)
      .map((p) => p.rib)
  )).sort();

  const covers = Array.from(new Set(
    productPanels
      .filter((p) =>
        (!selectedMaterial || p.material === selectedMaterial) &&
        (!selectedRib || p.rib === selectedRib)
      )
      .map((p) => p.cover)
  )).sort((a, b) => a - b);

  // Find matched panel
  const matchedPanel = productPanels.find(
    (p) =>
      p.material === selectedMaterial &&
      p.rib === selectedRib &&
      p.cover === selectedCover
  );

  // Get price range for a product
  const getProductPriceRange = (productName: string) => {
    const panels = allPanels.filter((p) => p.product === productName);
    if (panels.length === 0) return null;
    const prices = panels.map((p) => p.basePrice);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  };

  // Get variant count for a product
  const getVariantCount = (productName: string) => {
    return allPanels.filter((p) => p.product === productName).length;
  };

  // Select product and go to configurator
  const handleSelectProduct = (product: string) => {
    setSelectedProduct(product);
    setSelectedMaterial('');
    setSelectedColour('');
    setSelectedRib('');
    setSelectedCover('');
    setLength('');
    setQuantity(1);
    setPriceResult(null);
  };

  // Go back to product list
  const handleBack = () => {
    setSelectedProduct('');
    setSelectedMaterial('');
    setSelectedColour('');
    setSelectedRib('');
    setSelectedCover('');
    setLength('');
    setQuantity(1);
    setPriceResult(null);
  };

  // Available colours for the selected material
  const availableColours = selectedMaterial ? (MATERIAL_COLOURS[selectedMaterial] || []) : [];
  const hasMultipleColours = availableColours.length > 1;

  // Auto-skip rib when only one option exists
  const hasMultipleRibs = ribs.length > 1;

  // Reset downstream selections when upstream changes
  useEffect(() => {
    setSelectedColour('');
    setSelectedRib('');
    setSelectedCover('');
    setPriceResult(null);
  }, [selectedMaterial]);

  // Auto-select colour for single-colour materials and auto-select single rib
  useEffect(() => {
    if (selectedMaterial) {
      const colours = MATERIAL_COLOURS[selectedMaterial] || [];
      if (colours.length === 1) {
        setSelectedColour(colours[0].name);
      }
    }
  }, [selectedMaterial]);

  useEffect(() => {
    if (selectedMaterial && ribs.length === 1) {
      setSelectedRib(ribs[0]);
    }
  }, [selectedMaterial, ribs]);

  useEffect(() => {
    setSelectedCover('');
    setPriceResult(null);
  }, [selectedRib]);

  useEffect(() => {
    setPriceResult(null);
  }, [selectedCover, length, quantity]);

  // Calculate price
  const calculatePrice = useCallback(async () => {
    if (!matchedPanel || !length || length <= 0 || quantity <= 0) return;

    setPriceLoading(true);
    try {
      const res = await api.get('/cladding/price', {
        params: { sku: matchedPanel.sku, length, quantity },
      });
      setPriceResult(res.data?.data || null);
    } catch {
      toast.error('Failed to calculate price');
    } finally {
      setPriceLoading(false);
    }
  }, [matchedPanel, length, quantity]);

  // Auto-calculate when all fields are filled
  useEffect(() => {
    if (matchedPanel && length && length > 0 && quantity > 0) {
      const timer = setTimeout(calculatePrice, 300);
      return () => clearTimeout(timer);
    }
  }, [matchedPanel, length, quantity, calculatePrice]);

  // Add to cart
  const handleAddToCart = () => {
    if (!priceResult || !matchedPanel) return;

    addItem({
      _id: '',
      product: {
        _id: matchedPanel._id,
        name: `${matchedPanel.product} - ${matchedPanel.material}`,
        slug: 'cladding',
        sku: matchedPanel.sku,
        images: [],
      },
      selectedAttributes: [
        { attributeName: 'Product', value: matchedPanel.product },
        { attributeName: 'Material', value: matchedPanel.material },
        ...(selectedColour ? [{ attributeName: 'Colour', value: selectedColour }] : []),
        ...(hasMultipleRibs ? [{ attributeName: 'Rib', value: matchedPanel.rib }] : []),
        { attributeName: 'Cover', value: `${matchedPanel.cover}mm` },
        ...(matchedPanel.gauge ? [{ attributeName: 'Gauge', value: matchedPanel.gauge }] : []),
      ],
      pricingModel: 'per_metre',
      unitPrice: priceResult.basePrice,
      length: priceResult.length,
      quantity: priceResult.quantity,
      lineTotal: priceResult.lineTotal,
    });

    toast.success('Added to cart!');
    setCartOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LogoLoader text="Loading..." />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // VIEW: Product Cards (no product selected)
  // ═══════════════════════════════════════════
  if (!selectedProduct) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container-main py-6">
          <Breadcrumb
            items={[
              { label: 'Cladding Panels', href: '/cladding' },
            ]}
          />

          <div className="mt-6">
            <h1 className="text-2xl font-bold text-steel-900 tracking-tight">
              Cladding Panels
            </h1>
            <p className="mt-2 text-sm text-steel-600">
              Choose a panel profile to configure material, size, and get pricing.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((productName) => {
              const info = PRODUCT_INFO[productName] || { description: 'Cladding panel profile', icon: '▮' };
              const priceRange = getProductPriceRange(productName);
              const variants = getVariantCount(productName);

              const slug = PRODUCT_SLUGS[productName] || productName.toLowerCase().replace(/\s+/g, '-');

              return (
                <Link
                  key={productName}
                  href={`/products/${slug}`}
                  className="group rounded-xl border-2 border-steel-200 bg-white p-6 text-left transition-all hover:border-brand-400 hover:shadow-lg hover:shadow-brand-100/50 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                >
                  {/* Icon area */}
                  <div className="h-32 flex items-center justify-center rounded-lg bg-steel-50 group-hover:bg-brand-50 transition-colors mb-4">
                    <Layers className="h-16 w-16 text-steel-300 group-hover:text-brand-400 transition-colors" />
                  </div>

                  {/* Product name */}
                  <h3 className="text-lg font-bold text-steel-900 group-hover:text-brand-700 transition-colors">
                    {productName}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 text-xs text-steel-500 leading-relaxed line-clamp-2">
                    {info.description}
                  </p>

                  {/* Variants & price */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-steel-400">
                      {variants} variant{variants !== 1 ? 's' : ''}
                    </span>
                    {priceRange && (
                      <span className="text-sm font-semibold text-brand-700">
                        {formatCurrency(priceRange.min)} – {formatCurrency(priceRange.max)}/LM
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-4 w-full rounded-lg bg-brand-600 py-2.5 text-center text-sm font-semibold text-white group-hover:bg-brand-700 transition-colors">
                    Select Options &rarr;
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // VIEW: Configurator (product selected)
  // ═══════════════════════════════════════════
  return (
    <div className="bg-white min-h-screen">
      <div className="container-main py-6">
        <Breadcrumb
          items={[
            { label: 'Cladding Panels', href: '/cladding' },
            { label: selectedProduct },
          ]}
        />

        {/* Back button & Title */}
        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            All Panels
          </button>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-steel-900 tracking-tight">
            {selectedProduct}
          </h1>
          <p className="mt-1 text-sm text-steel-500">
            {PRODUCT_INFO[selectedProduct]?.description || 'Configure your cladding panel.'}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: Configuration Steps */}
          <div className="space-y-6">
            {/* Step 1: Material */}
            <div className="rounded-xl border border-steel-200 bg-white p-6">
              <h2 className="text-base font-bold text-steel-800 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">1</span>
                Select Material
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {materials.map((mat) => (
                  <button
                    key={mat}
                    type="button"
                    className={cn(
                      'rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all text-center',
                      selectedMaterial === mat
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-steel-200 bg-white text-steel-700 hover:border-brand-300 hover:bg-brand-50/50'
                    )}
                    onClick={() => setSelectedMaterial(mat)}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Colour (shown after material is selected, for materials with colours) */}
            {selectedMaterial && availableColours.length > 0 && (
              <div className="rounded-xl border border-steel-200 bg-white p-6">
                <h2 className="text-base font-bold text-steel-800 mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">2</span>
                  Select Colour
                </h2>
                {hasMultipleColours ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {availableColours.map((colour) => (
                      <button
                        key={colour.name}
                        type="button"
                        className={cn(
                          'rounded-lg border-2 p-3 text-center transition-all',
                          selectedColour === colour.name
                            ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-200'
                            : 'border-steel-200 bg-white hover:border-brand-300'
                        )}
                        onClick={() => setSelectedColour(colour.name)}
                      >
                        <div
                          className="mx-auto h-8 w-8 rounded-full border border-steel-200 shadow-inner mb-2"
                          style={{ backgroundColor: colour.hex }}
                        />
                        <span className="text-xs font-medium text-steel-700 leading-tight block">{colour.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-steel-50 border border-steel-100">
                    <div
                      className="h-8 w-8 rounded-full border border-steel-200 shadow-inner"
                      style={{ backgroundColor: availableColours[0].hex }}
                    />
                    <span className="text-sm font-medium text-steel-700">{availableColours[0].name}</span>
                  </div>
                )}
              </div>
            )}

            {/* Rib Size (only shown when product has multiple rib options) */}
            {hasMultipleRibs && (
              <div className={cn('rounded-xl border border-steel-200 bg-white p-6 transition-opacity', !selectedMaterial && 'opacity-50 pointer-events-none')}>
                <h2 className="text-base font-bold text-steel-800 mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">{hasMultipleColours ? 3 : 2}</span>
                  Select Rib Size
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ribs.map((rib) => (
                    <button
                      key={rib}
                      type="button"
                      className={cn(
                        'rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all text-center',
                        selectedRib === rib
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-steel-200 bg-white text-steel-700 hover:border-brand-300 hover:bg-brand-50/50'
                      )}
                      onClick={() => setSelectedRib(rib)}
                    >
                      {rib}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Width */}
            <div className={cn('rounded-xl border border-steel-200 bg-white p-6 transition-opacity', !selectedRib && 'opacity-50 pointer-events-none')}>
              <h2 className="text-base font-bold text-steel-800 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">
                  {(hasMultipleColours ? 1 : 0) + (hasMultipleRibs ? 1 : 0) + 2}
                </span>
                Select Cover Width
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {covers.map((cover) => (
                  <button
                    key={cover}
                    type="button"
                    className={cn(
                      'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all text-center',
                      selectedCover === cover
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-steel-200 bg-white text-steel-700 hover:border-brand-300'
                    )}
                    onClick={() => setSelectedCover(cover)}
                  >
                    {cover}mm
                  </button>
                ))}
              </div>
              {matchedPanel && (
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-steel-500">
                  <span>SKU: <span className="font-mono font-medium text-steel-700">{matchedPanel.sku}</span></span>
                  {matchedPanel.gauge && <span>Gauge: <span className="font-medium text-steel-700">{matchedPanel.gauge}</span></span>}
                  <span>Base: <span className="font-medium text-steel-700">{formatCurrency(matchedPanel.basePrice)}/LM</span></span>
                </div>
              )}
            </div>

            {/* Length & Quantity */}
            <div className={cn('rounded-xl border border-steel-200 bg-white p-6 transition-opacity', !matchedPanel && 'opacity-50 pointer-events-none')}>
              <h2 className="text-base font-bold text-steel-800 mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold">
                  {(hasMultipleColours ? 1 : 0) + (hasMultipleRibs ? 1 : 0) + 3}
                </span>
                Length & Quantity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-steel-700 mb-1.5">Length (metres)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={length}
                    onChange={(e) => setLength(e.target.value ? parseFloat(e.target.value) : '')}
                    placeholder="Enter length in metres"
                    disabled={!matchedPanel}
                    className="w-full rounded-lg border border-steel-300 px-4 py-3 text-sm text-steel-900 placeholder:text-steel-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-steel-50 disabled:text-steel-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-steel-700 mb-1.5">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-steel-300 text-steel-600 hover:bg-steel-50 flex items-center justify-center text-lg font-medium disabled:opacity-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={!matchedPanel || quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={!matchedPanel}
                      className="flex-1 rounded-lg border border-steel-300 px-4 py-3 text-sm text-center text-steel-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-steel-50 disabled:text-steel-400"
                    />
                    <button
                      type="button"
                      className="w-10 h-10 rounded-lg border border-steel-300 text-steel-600 hover:bg-steel-50 flex items-center justify-center text-lg font-medium disabled:opacity-50"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={!matchedPanel}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Price Summary (sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-steel-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-brand-600 px-6 py-4">
                <h3 className="text-base font-bold text-white">Price Summary</h3>
              </div>
              <div className="p-6 space-y-4">
                {matchedPanel ? (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-steel-600">
                        <span>Product</span>
                        <span className="font-medium text-steel-900">{selectedProduct}</span>
                      </div>
                      <div className="flex justify-between text-steel-600">
                        <span>Material</span>
                        <span className="font-medium text-steel-900">{matchedPanel.material}</span>
                      </div>
                      {selectedColour && (
                        <div className="flex justify-between text-steel-600 items-center">
                          <span>Colour</span>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const colourObj = availableColours.find(c => c.name === selectedColour);
                              return colourObj ? (
                                <div className="h-4 w-4 rounded-full border border-steel-200" style={{ backgroundColor: colourObj.hex }} />
                              ) : null;
                            })()}
                            <span className="font-medium text-steel-900">{selectedColour}</span>
                          </div>
                        </div>
                      )}
                      {hasMultipleRibs && (
                        <div className="flex justify-between text-steel-600">
                          <span>Rib</span>
                          <span className="font-medium text-steel-900">{matchedPanel.rib}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-steel-600">
                        <span>Cover</span>
                        <span className="font-medium text-steel-900">{matchedPanel.cover}mm</span>
                      </div>
                      {matchedPanel.gauge && (
                        <div className="flex justify-between text-steel-600">
                          <span>Gauge</span>
                          <span className="font-medium text-steel-900">{matchedPanel.gauge}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-steel-600">
                        <span>SKU</span>
                        <span className="font-mono font-medium text-steel-900">{matchedPanel.sku}</span>
                      </div>
                    </div>

                    <div className="border-t border-steel-100 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-steel-600">
                        <span>Rate per LM</span>
                        <span className="font-medium text-steel-900">{formatCurrency(matchedPanel.basePrice)}</span>
                      </div>
                      {priceResult && (
                        <>
                          <div className="flex justify-between text-steel-600">
                            <span>Length</span>
                            <span className="font-medium text-steel-900">{priceResult.length}m</span>
                          </div>
                          <div className="flex justify-between text-steel-600">
                            <span>Unit Price ({formatCurrency(matchedPanel.basePrice)} x {priceResult.length}m)</span>
                            <span className="font-medium text-steel-900">{formatCurrency(priceResult.unitPrice)}</span>
                          </div>
                          <div className="flex justify-between text-steel-600">
                            <span>Quantity</span>
                            <span className="font-medium text-steel-900">{priceResult.quantity}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border-t border-steel-200 pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold text-steel-700">Total</span>
                        <span className="text-2xl font-bold text-brand-700">
                          {priceResult ? formatCurrency(priceResult.lineTotal) : '—'}
                        </span>
                      </div>
                      {priceResult && (
                        <p className="text-xs text-steel-400 mt-1 text-right">
                          {formatCurrency(matchedPanel.basePrice)}/LM x {priceResult.length}m x {priceResult.quantity} = {formatCurrency(priceResult.lineTotal)}
                        </p>
                      )}
                    </div>

                    <Button
                      className="w-full mt-4"
                      size="lg"
                      disabled={!priceResult || priceLoading}
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-steel-400">
                    <p className="text-sm">Select material and dimensions to see pricing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
