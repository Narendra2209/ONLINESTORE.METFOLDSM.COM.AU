'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Trash2, RotateCcw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

// ── TYPES ──

interface Point {
  x: number;
  y: number;
}

interface Segment {
  lengthMm: number; // length in mm
}

// Material → base price per linear metre (AUD)
const MATERIAL_PRICING: Record<string, number> = {
  'Colorbond': 18.00,
  'Matt Colorbond': 22.00,
  'Ultra Colorbond': 24.00,
  'Galvanised': 14.00,
  'Zinc': 16.00,
};

const COLOUR_OPTIONS: Record<string, string[]> = {
  'Colorbond': [
    'Basalt', 'Classic Cream', 'Cottage Green', 'Deep Ocean', 'Dune',
    'Evening Haze', 'Gully', 'Ironstone', 'Jasper', 'Manor Red',
    'Monument', 'Night Sky', 'Pale Eucalyptus', 'Paperbark',
    'Shale Grey', 'Surfmist', 'Terrain', 'Wallaby',
    'Windspray', 'Woodland Grey', 'Cove', 'Mangrove',
  ],
  'Matt Colorbond': ['Basalt', 'Bluegum', 'Dune', 'Monument', 'Shale Grey', 'Surfmist'],
  'Ultra Colorbond': ['Dune', 'Monument', 'Shale Grey', 'Wallaby', 'Woodland Grey', 'Surfmist', 'Windspray'],
  'Galvanised': ['Galvanised'],
  'Zinc': ['Zinc'],
};

const GAUGE_OPTIONS = ['0.35mm', '0.42mm', '0.48mm', '0.55mm'];

const GAUGE_MULTIPLIERS: Record<string, number> = {
  '0.35mm': 0.85,
  '0.42mm': 1.0,
  '0.48mm': 1.15,
  '0.55mm': 1.30,
};

// ── HELPERS ──

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

// Convert diagram points to visual coordinates
function pointsToSvgPath(points: Point[]): string {
  if (points.length < 2) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

// ── COMPONENT ──

export default function FlashingConfigurator() {
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const router = useRouter();

  // Drawing state
  const [points, setPoints] = useState<Point[]>([
    { x: 80, y: 200 },
    { x: 80, y: 120 },
    { x: 280, y: 120 },
    { x: 280, y: 200 },
  ]);
  const [segments, setSegments] = useState<Segment[]>([
    { lengthMm: 50 },
    { lengthMm: 200 },
    { lengthMm: 50 },
  ]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Config state
  const [material, setMaterial] = useState('Colorbond');
  const [colour, setColour] = useState('');
  const [gauge, setGauge] = useState('0.42mm');
  const [quantity, setQuantity] = useState(1);

  // Keep segments array in sync with points count
  useEffect(() => {
    if (points.length >= 2 && segments.length !== points.length - 1) {
      const newSegments: Segment[] = [];
      for (let i = 0; i < points.length - 1; i++) {
        newSegments.push(segments[i] || { lengthMm: 50 });
      }
      setSegments(newSegments);
    }
  }, [points.length, segments]);

  // Reset colour when material changes
  useEffect(() => {
    setColour('');
  }, [material]);

  // ── CALCULATIONS ──

  const totalGirth = segments.reduce((sum, s) => sum + s.lengthMm, 0);
  const foldCount = Math.max(0, points.length - 2);
  const totalGirthMetres = totalGirth / 1000;

  const baseRatePerMetre = MATERIAL_PRICING[material] || 18;
  const gaugeMultiplier = GAUGE_MULTIPLIERS[gauge] || 1.0;
  const foldCost = foldCount * 1.50; // $1.50 per fold
  const unitPrice = (baseRatePerMetre * gaugeMultiplier * totalGirthMetres) + foldCost;
  const lineTotal = unitPrice * quantity;

  // ── DRAWING HANDLERS ──

  const getSvgPoint = useCallback((e: React.MouseEvent): Point => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * 500),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 300),
    };
  }, []);

  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    if (draggingIdx !== null) return;
    const target = e.target as SVGElement;
    if (target.closest('.point-handle')) return;

    const pt = getSvgPoint(e);
    setPoints((prev) => [...prev, pt]);
    setSegments((prev) => [...prev, { lengthMm: 50 }]);
  }, [draggingIdx, getSvgPoint]);

  const handlePointMouseDown = useCallback((idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingIdx(idx);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingIdx === null) return;
    const pt = getSvgPoint(e);
    setPoints((prev) => {
      const next = [...prev];
      next[draggingIdx] = pt;
      return next;
    });
  }, [draggingIdx, getSvgPoint]);

  const handleMouseUp = useCallback(() => {
    setDraggingIdx(null);
  }, []);

  const removePoint = (idx: number) => {
    if (points.length <= 2) return;
    setPoints((prev) => prev.filter((_, i) => i !== idx));
    setSegments((prev) => {
      const next = [...prev];
      // Remove the segment that was connected to this point
      if (idx === 0) next.splice(0, 1);
      else if (idx >= prev.length) next.splice(prev.length - 1, 1);
      else next.splice(idx - 1, 1);
      return next;
    });
  };

  const resetDiagram = () => {
    setPoints([
      { x: 80, y: 200 },
      { x: 80, y: 120 },
      { x: 280, y: 120 },
      { x: 280, y: 200 },
    ]);
    setSegments([
      { lengthMm: 50 },
      { lengthMm: 200 },
      { lengthMm: 50 },
    ]);
  };

  const updateSegmentLength = (idx: number, value: number) => {
    setSegments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], lengthMm: Math.max(1, value) };
      return next;
    });
  };

  // ── ADD TO CART ──

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('You need to login to add items to cart');
      router.push('/login');
      return;
    }
    if (!colour) {
      toast.error('Please select a colour');
      return;
    }

    const attrs = [
      { attributeName: 'Material', value: material },
      { attributeName: 'Colour', value: colour },
      { attributeName: 'Gauge', value: gauge },
      { attributeName: 'Total Girth', value: `${totalGirth}mm` },
      { attributeName: 'Folds', value: String(foldCount) },
      ...segments.map((s, i) => ({
        attributeName: `Segment ${i + 1}`,
        value: `${s.lengthMm}mm`,
      })),
    ];

    addItem({
      _id: '',
      product: {
        _id: 'flashing-custom',
        name: `Custom Flashing — ${material} ${colour}`,
        slug: 'custom-flashing',
        sku: `FLASH-${material.replace(/\s+/g, '').toUpperCase()}-${totalGirth}`,
        images: [],
      },
      selectedAttributes: attrs,
      pricingModel: 'per_piece',
      unitPrice,
      quantity,
      lineTotal,
    });
    toast.success('Custom flashing added to cart!');
  };

  // ── RENDER ──

  const availableColours = COLOUR_OPTIONS[material] || [];

  return (
    <div className="space-y-8">
      {/* ── DIAGRAM AREA ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-steel-900">Draw Your Flashing Profile</h3>
          <div className="flex gap-2">
            <button
              onClick={resetDiagram}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-steel-600 bg-steel-100 rounded-lg hover:bg-steel-200 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50/50 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 500 300"
            className="w-full h-[300px] md:h-[400px] cursor-crosshair"
            onClick={handleSvgClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="500" height="300" fill="url(#grid)" />

            {/* Profile path */}
            {points.length >= 2 && (
              <path
                d={pointsToSvgPath(points)}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Thickness visualization */}
            {points.length >= 2 && (
              <path
                d={pointsToSvgPath(points)}
                fill="none"
                stroke="#93c5fd"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />
            )}

            {/* Segment labels */}
            {points.length >= 2 && points.map((p, i) => {
              if (i === points.length - 1) return null;
              const next = points[i + 1];
              const midX = (p.x + next.x) / 2;
              const midY = (p.y + next.y) / 2;
              const seg = segments[i];
              if (!seg) return null;

              return (
                <g key={`seg-${i}`}>
                  <rect
                    x={midX - 22}
                    y={midY - 10}
                    width="44"
                    height="20"
                    rx="4"
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-blue-700 select-none pointer-events-none"
                  >
                    {seg.lengthMm}mm
                  </text>
                </g>
              );
            })}

            {/* Fold indicators */}
            {points.map((p, i) => {
              if (i === 0 || i === points.length - 1) return null;
              return (
                <g key={`fold-${i}`}>
                  <circle cx={p.x} cy={p.y} r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" opacity="0.8" />
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="text-[8px] font-semibold fill-amber-700 select-none pointer-events-none"
                  >
                    Fold {i}
                  </text>
                </g>
              );
            })}

            {/* Draggable points */}
            {points.map((p, i) => (
              <g key={`pt-${i}`} className="point-handle" style={{ cursor: 'grab' }}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="8"
                  fill={draggingIdx === i ? '#2563eb' : 'white'}
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  onMouseDown={(e) => handlePointMouseDown(i, e)}
                />
                <text
                  x={p.x}
                  y={p.y + 3.5}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-blue-600 select-none pointer-events-none"
                >
                  {i + 1}
                </text>
              </g>
            ))}

            {/* Instructions */}
            <text x="250" y="290" textAnchor="middle" className="text-[10px] fill-steel-400 select-none pointer-events-none">
              Click anywhere to add a point. Drag points to adjust. Enter lengths below.
            </text>
          </svg>
        </div>
      </div>

      {/* ── SEGMENT LENGTHS ── */}
      <div>
        <h3 className="text-sm font-bold text-steel-900 mb-3">Segment Lengths (mm)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="number"
                  min={1}
                  value={seg.lengthMm}
                  onChange={(e) => updateSegmentLength(i, parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-steel-300 px-2 py-1.5 text-sm text-center font-medium focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <span className="text-xs text-steel-500 flex-shrink-0">mm</span>
              </div>
              {points.length > 2 && (
                <button
                  onClick={() => removePoint(i < points.length - 1 ? i + 1 : i)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="Remove point"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── MATERIAL & COLOUR ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Material */}
        <div>
          <label className="mb-2 block text-sm font-bold text-steel-900">
            Material <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(MATERIAL_PRICING).map((mat) => (
              <button
                key={mat}
                onClick={() => setMaterial(mat)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                  material === mat
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                )}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* Gauge */}
        <div>
          <label className="mb-2 block text-sm font-bold text-steel-900">
            Gauge <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GAUGE_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGauge(g)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                  gauge === g
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colour */}
      <div>
        <label className="mb-2 block text-sm font-bold text-steel-900">
          Colour <span className="text-red-500">*</span>
          {colour && <span className="ml-2 font-normal text-steel-500">— {colour}</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {availableColours.map((c) => (
            <button
              key={c}
              onClick={() => setColour(c)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                colour === c
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── QUANTITY ── */}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-steel-900">Quantity</label>
        <div className="flex items-center rounded-lg border border-steel-300 w-fit">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-steel-600 hover:bg-steel-50">-</button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 border-x border-steel-300 text-center py-2 text-sm"
          />
          <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-steel-600 hover:bg-steel-50">+</button>
        </div>
      </div>

      {/* ── SUMMARY & PRICE ── */}
      <div className="rounded-2xl bg-steel-50 border border-steel-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-steel-900">Order Summary</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-2xl font-bold text-brand-600">{totalGirth}<span className="text-sm font-normal text-steel-500">mm</span></div>
            <div className="text-xs text-steel-500 mt-1">Total Girth</div>
          </div>
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-2xl font-bold text-amber-600">{foldCount}</div>
            <div className="text-xs text-steel-500 mt-1">Folds</div>
          </div>
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-2xl font-bold text-steel-700">{segments.length}</div>
            <div className="text-xs text-steel-500 mt-1">Segments</div>
          </div>
        </div>

        <div className="border-t border-steel-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-steel-600">Base rate ({material}, {gauge}):</span>
            <span className="font-medium">{formatCurrency(baseRatePerMetre * gaugeMultiplier)}/m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-steel-600">Girth: {totalGirth}mm = {totalGirthMetres.toFixed(3)}m</span>
            <span className="font-medium">{formatCurrency(baseRatePerMetre * gaugeMultiplier * totalGirthMetres)}</span>
          </div>
          {foldCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-steel-600">Folds ({foldCount} x $1.50):</span>
              <span className="font-medium">{formatCurrency(foldCost)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-steel-600">Unit price:</span>
            <span className="font-semibold text-steel-900">{formatCurrency(unitPrice)}</span>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-steel-600">Qty x {quantity}:</span>
              <span className="font-medium">{formatCurrency(lineTotal)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-steel-200 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-steel-900">Total:</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-steel-900">{formatCurrency(lineTotal)}</span>
              <p className="text-xs text-steel-500">Excl. GST</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          leftIcon={<ShoppingCart className="h-5 w-5" />}
          onClick={handleAddToCart}
          disabled={!colour}
        >
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="lg"
          leftIcon={<Zap className="h-5 w-5" />}
          disabled={!colour}
          onClick={() => {
            handleAddToCart();
            if (isAuthenticated && colour) router.push('/cart');
          }}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
