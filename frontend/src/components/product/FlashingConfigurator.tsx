'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, RotateCcw, ChevronDown } from 'lucide-react';
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
  lengthMm: number;
}

type FoldType = 'Nothing' | 'Hook Fold' | 'Squash Fold' | 'Semi Squash Fold';

const FOLD_OPTIONS: FoldType[] = ['Nothing', 'Hook Fold', 'Squash Fold', 'Semi Squash Fold'];

// Available girths (rounded up to nearest)
const AVAILABLE_GIRTHS = [100, 150, 200, 240, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 900, 1000, 1100, 1200];

function roundUpGirth(girth: number): number {
  for (const g of AVAILABLE_GIRTHS) {
    if (girth <= g) return g;
  }
  return AVAILABLE_GIRTHS[AVAILABLE_GIRTHS.length - 1]; // max 1200
}

const COLOUR_OPTIONS: Record<string, string[]> = {
  'Colorbond': [
    'Basalt', 'Bluegum', 'Classic Cream', 'Cottage Green', 'Deep Ocean', 'Dover White', 'Dune',
    'Evening Haze', 'Gully', 'Ironstone', 'Jasper', 'Manor Red',
    'Monument', 'Night Sky', 'Pale Eucalypt', 'Paperbark',
    'Shale Grey', 'Southerly', 'Surfmist', 'Wallaby',
    'Windspray', 'Woodland Grey',
  ],
  'Matt Colorbond': ['Basalt', 'Bluegum', 'Dune', 'Monument', 'Shale Grey', 'Surfmist'],
  'Ultra Colorbond': ['Deep Ocean', 'Dune', 'Monument', 'Shale Grey', 'Surfmist', 'Wallaby', 'Windspray', 'Woodland Grey'],
  'Galvanised': ['Galvanised'],
  'Zinc': ['Zinc'],
};

const GAUGE_BY_MATERIAL: Record<string, string[]> = {
  'Colorbond': ['0.55mm'],
  'Matt Colorbond': ['0.55mm'],
  'Ultra Colorbond': ['0.55mm'],
  'Galvanised': ['0.55mm', '0.75mm', '0.95mm'],
  'Zinc': ['0.55mm', '0.75mm', '0.95mm'],
};

const GAUGE_MULTIPLIERS: Record<string, number> = {
  '0.35mm': 0.85,
  '0.42mm': 1.0,
  '0.48mm': 1.15,
  '0.55mm': 1.30,
  '0.75mm': 1.60,
  '0.95mm': 2.00,
};

const FOLD_TYPE_COST: Record<FoldType, number> = {
  'Nothing': 0,
  'Hook Fold': 2.00,
  'Squash Fold': 2.50,
  'Semi Squash Fold': 3.00,
};

// ── HELPERS ──

function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

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
  const [points, setPoints] = useState<Point[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const wasDragging = useRef(false);

  // Label position offsets (user can drag labels away from default position)
  const [segLabelOffsets, setSegLabelOffsets] = useState<Record<number, { dx: number; dy: number }>>({});
  const [angleLabelOffsets, setAngleLabelOffsets] = useState<Record<number, { dx: number; dy: number }>>({});

  // Which label is currently in edit mode (null = show static text)
  const [editingSegment, setEditingSegment] = useState<number | null>(null);
  const [editingAngle, setEditingAngle] = useState<number | null>(null);
  const labelDragRef = useRef<{ type: 'seg' | 'angle'; idx: number; startX: number; startY: number; origDx: number; origDy: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Fold state
  const [startFold, setStartFold] = useState<FoldType>('Nothing');
  const [startFoldMm, setStartFoldMm] = useState(0);
  const [startFoldDir, setStartFoldDir] = useState<'Up' | 'Down'>('Up'); // Up=inside diagram, Down=outside diagram
  const [startFoldAngle, setStartFoldAngle] = useState(140); // default Hook=140, Squash=180
  const [endFold, setEndFold] = useState<FoldType>('Nothing');
  const [endFoldMm, setEndFoldMm] = useState(0);
  const [endFoldDir, setEndFoldDir] = useState<'Up' | 'Down'>('Up');
  const [endFoldAngle, setEndFoldAngle] = useState(140);
  const [showStartFoldMenu, setShowStartFoldMenu] = useState(false);
  const [showEndFoldMenu, setShowEndFoldMenu] = useState(false);

  // Angle at each interior fold point (index maps to interior point index: points[1], points[2], ...)
  const [foldAngles, setFoldAngles] = useState<number[]>([]);

  // Config state
  const [material, setMaterial] = useState('Colorbond');
  const [colour, setColour] = useState('');
  const [colourSide, setColourSide] = useState<'Inside' | 'Outside'>('Outside'); // Which side has the colour
  const [gauge, setGauge] = useState('0.55mm');
  const [quantity, setQuantity] = useState(1);
  const [flashingLength, setFlashingLength] = useState(0); // length in metres (max 8m)
  const [tagName, setTagName] = useState('');

  // Load saved flashing config from localStorage (for Edit Flashing)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flashingConfig');
      if (saved) {
        const cfg = JSON.parse(saved);
        if (cfg.points?.length > 0) setPoints(cfg.points);
        if (cfg.segments?.length > 0) setSegments(cfg.segments);
        if (cfg.foldAngles) setFoldAngles(cfg.foldAngles);
        if (cfg.material) setMaterial(cfg.material);
        if (cfg.colour) setColour(cfg.colour);
        if (cfg.colourSide) setColourSide(cfg.colourSide);
        if (cfg.gauge) setGauge(cfg.gauge);
        if (cfg.quantity) setQuantity(cfg.quantity);
        if (cfg.flashingLength) setFlashingLength(cfg.flashingLength);
        if (cfg.tagName) setTagName(cfg.tagName);
        if (cfg.startFold) setStartFold(cfg.startFold);
        if (cfg.startFoldMm) setStartFoldMm(cfg.startFoldMm);
        if (cfg.startFoldAngle) setStartFoldAngle(cfg.startFoldAngle);
        if (cfg.startFoldDir) setStartFoldDir(cfg.startFoldDir);
        if (cfg.endFold) setEndFold(cfg.endFold);
        if (cfg.endFoldMm) setEndFoldMm(cfg.endFoldMm);
        if (cfg.endFoldAngle) setEndFoldAngle(cfg.endFoldAngle);
        if (cfg.endFoldDir) setEndFoldDir(cfg.endFoldDir);
      }
    } catch { /* ignore */ }
  }, []);

  // Keep segments array in sync with points count
  useEffect(() => {
    if (points.length >= 2 && segments.length !== points.length - 1) {
      const newSegments: Segment[] = [];
      for (let i = 0; i < points.length - 1; i++) {
        newSegments.push(segments[i] || { lengthMm: 0 });
      }
      setSegments(newSegments);
    }
  }, [points.length, segments]);

  // Keep foldAngles in sync with interior points count
  useEffect(() => {
    const interiorCount = Math.max(0, points.length - 2);
    if (foldAngles.length !== interiorCount) {
      const newAngles: number[] = [];
      for (let i = 0; i < interiorCount; i++) {
        newAngles.push(foldAngles[i] ?? 90); // default 90°
      }
      setFoldAngles(newAngles);
    }
  }, [points.length, foldAngles]);

  // Reset colour when material changes
  useEffect(() => {
    setColour('');
  }, [material]);

  // ── CALCULATIONS ──

  const totalGirth = segments.reduce((sum, s) => sum + s.lengthMm, 0);
  const foldCount = Math.max(0, points.length - 2);
  const roundedGirth = roundUpGirth(totalGirth);

  // Price lookup state — fetched from backend based on girth + folds + material + thickness
  const [lookupPrice, setLookupPrice] = useState<number | null>(null);
  const [lookupSku, setLookupSku] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);

  // Fetch price from backend when girth/folds/material/gauge changes
  useEffect(() => {
    if (totalGirth <= 0 || !material) { setLookupPrice(null); setLookupSku(''); return; }
    const thickness = parseFloat(gauge) || 0.55;

    setPriceLoading(true);
    import('@/lib/axios').then(({ default: api }) => {
      api.get(`/products/flashing-price`, {
        params: { girth: roundedGirth, folds: foldCount, material: material.toUpperCase(), thickness }
      })
        .then((res: any) => {
          setLookupPrice(res.data?.data?.price ?? null);
          setLookupSku(res.data?.data?.sku || `FC${roundedGirth}G${foldCount}F`);
        })
        .catch(() => { setLookupPrice(null); setLookupSku(''); })
        .finally(() => setPriceLoading(false));
    });
  }, [roundedGirth, foldCount, material, gauge, totalGirth]);

  const unitPrice = lookupPrice ?? 0;
  const lineTotal = unitPrice * flashingLength;

  // ── DRAWING HANDLERS ──

  const getSvgPoint = useCallback((e: React.MouseEvent): Point => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - rect.left) / rect.width) * 700),
      y: Math.round(((e.clientY - rect.top) / rect.height) * 400),
    };
  }, []);

  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    // Don't add a point if we just finished dragging
    if (wasDragging.current) { wasDragging.current = false; return; }
    if (draggingIdx !== null) return;
    const target = e.target as SVGElement;
    if (target.closest('.point-handle')) return;

    const pt = getSvgPoint(e);
    setPoints((prev) => [...prev, pt]);
    setSegments((prev) => [...prev, { lengthMm: 0 }]);
  }, [draggingIdx, getSvgPoint]);

  const handlePointMouseDown = useCallback((idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingIdx(idx);
    wasDragging.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingIdx === null) return;
    wasDragging.current = true;
    const pt = getSvgPoint(e);
    setPoints((prev) => {
      const next = [...prev];
      next[draggingIdx] = pt;
      return next;
    });
  }, [draggingIdx, getSvgPoint]);

  const handleMouseUp = useCallback(() => {
    if (draggingIdx !== null) {
      setDraggingIdx(null);
    }
  }, [draggingIdx]);

  // Remove first segment/point
  const removeFirst = () => {
    if (points.length <= 2) return;
    setPoints((prev) => prev.slice(1));
    setSegments((prev) => prev.slice(1));
  };

  // Remove last segment/point
  const removeLast = () => {
    if (points.length <= 2) return;
    setPoints((prev) => prev.slice(0, -1));
    setSegments((prev) => prev.slice(0, -1));
  };

  const resetDiagram = () => {
    setPoints([]);
    setSegments([]);
    setStartFold('Nothing');
    setStartFoldMm(0);
    setStartFoldDir('Up');
    setStartFoldAngle(140);
    setEndFold('Nothing');
    setEndFoldMm(0);
    setEndFoldDir('Up');
    setEndFoldAngle(140);
    setFoldAngles([]);
    setColourSide('Outside');
    setFlashingLength(0);
    setTagName('');
  };

  const updateSegmentLength = (idx: number, value: number) => {
    setSegments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], lengthMm: Math.max(0, Math.min(8000, value)) };
      return next;
    });
  };

  // ── ADD TO CART ──

  const handleAddToCart = () => {
    if (points.length < 2) {
      toast.error('Please draw at least one line on the diagram');
      return;
    }
    if (!material) {
      toast.error('Please select a material');
      return;
    }
    if (!colour) {
      toast.error('Please select a colour');
      return;
    }
    if (!gauge) {
      toast.error('Please select a gauge');
      return;
    }

    const label = tagName.trim() || `Custom Flashing`;
    const attrs = [
      { attributeName: 'Tag Name', value: label },
      { attributeName: 'Material', value: material },
      { attributeName: 'Colour', value: colour },
      { attributeName: 'Colour Side', value: colourSide },
      { attributeName: 'Gauge', value: gauge },
      { attributeName: 'Total Girth', value: `${totalGirth}mm` },
      ...(flashingLength > 0 ? [{ attributeName: 'Length', value: `${flashingLength}m` }] : []),
      { attributeName: 'Folds', value: String(foldCount) },
      ...(startFold !== 'Nothing' ? [{ attributeName: 'Start Fold', value: `${startFold} — ${startFoldMm}mm, ${startFoldAngle}°, ${startFoldDir === 'Up' ? 'Inside' : 'Outside'}` }] : []),
      ...(endFold !== 'Nothing' ? [{ attributeName: 'End Fold', value: `${endFold} — ${endFoldMm}mm, ${endFoldAngle}°, ${endFoldDir === 'Up' ? 'Inside' : 'Outside'}` }] : []),
      ...foldAngles.map((angle, i) => ({
        attributeName: `Fold ${i + 1} Angle`,
        value: `${angle}°`,
      })),
      ...segments.map((s, i) => ({
        attributeName: `Segment ${String.fromCharCode(65 + i)}`,
        value: `${s.lengthMm}mm`,
      })),
    ];

    // Capture the diagram as an image for the cart
    const diagramImage = captureDiagramImage();

    // Save flashing config to localStorage so Edit can restore it
    try {
      localStorage.setItem('flashingConfig', JSON.stringify({
        points, segments, foldAngles, material, colour, colourSide, gauge, quantity,
        flashingLength, tagName, startFold, startFoldMm, startFoldAngle, startFoldDir,
        endFold, endFoldMm, endFoldAngle, endFoldDir,
      }));
    } catch { /* ignore */ }

    try {
      addItem({
        _id: '',
        product: {
          _id: 'flashing-custom',
          name: `${label} — ${material} ${colour}`,
          slug: 'custom-flashing',
          sku: lookupSku || `FC${roundedGirth}G${foldCount}F`,
          images: diagramImage ? [{ url: diagramImage, alt: `${label} diagram` }] : [],
        },
        selectedAttributes: attrs,
        pricingModel: 'per_piece',
        unitPrice,
        quantity,
        lineTotal,
      });
      toast.success('Custom flashing added to cart!');
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Failed to add to cart. Please try again.');
    }
  };

  // ── RENDER ──

  const availableColours = COLOUR_OPTIONS[material] || [];

  // Capture SVG diagram as a data URL image for cart
  const captureDiagramImage = (): string => {
    try {
      const svg = svgRef.current;
      if (!svg || points.length < 2) return '';

      // Calculate bounding box of all points with padding
      const pad = 60;
      const minX = Math.min(...points.map(p => p.x)) - pad;
      const minY = Math.min(...points.map(p => p.y)) - pad;
      const maxX = Math.max(...points.map(p => p.x)) + pad;
      const maxY = Math.max(...points.map(p => p.y)) + pad;
      const w = maxX - minX;
      const h = maxY - minY;

      // Clone SVG and crop viewBox to the drawing area
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('viewBox', `${minX} ${minY} ${w} ${h}`);
      clone.setAttribute('width', String(w));
      clone.setAttribute('height', String(h));

      // White background instead of grid
      const gridRect = clone.querySelector('rect');
      if (gridRect) gridRect.setAttribute('fill', 'white');

      // Remove instruction text and colour label
      clone.querySelectorAll('text').forEach(t => {
        const txt = t.textContent || '';
        if (txt.includes('Click to add') || txt.includes('Colour')) t.remove();
      });

      const svgData = new XMLSerializer().serializeToString(clone);
      return `data:image/svg+xml,${encodeURIComponent(svgData)}`;
    } catch {
      return '';
    }
  };

  // Draw fold indicator at start/end using actual angle
  // Up = inside the diagram, Down = outside the diagram
  const renderFoldIndicator = (point: Point, foldType: FoldType, isStart: boolean) => {
    if (foldType === 'Nothing') return null;
    const foldMm = isStart ? startFoldMm : endFoldMm;
    const foldDir = isStart ? startFoldDir : endFoldDir;
    const foldAngle = isStart ? startFoldAngle : endFoldAngle;
    if (foldMm <= 0) return null;

    const secondPoint = isStart ? points[1] : points[points.length - 2];
    if (!secondPoint) return null;

    // Direction along the line FROM the endpoint TOWARD its neighbor
    const dx = secondPoint.x - point.x;
    const dy = secondPoint.y - point.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    // Angle of the line segment in radians
    const lineAngle = Math.atan2(dy, dx);

    // Perpendicular direction sign: Up (inside) vs Down (outside)
    const sign = foldDir === 'Up' ? -1 : 1;

    // Scale fold line length proportionally (1mm = ~0.3px in SVG, min 8px)
    const foldLen = Math.max(8, foldMm * 0.3);

    // The fold goes perpendicular to the line (90 degrees)
    const perpAngle = lineAngle + (sign * Math.PI / 2);
    const foldEndX = point.x + Math.cos(perpAngle) * foldLen;
    const foldEndY = point.y + Math.sin(perpAngle) * foldLen;

    // The return bend uses the user's angle
    // Convert fold angle to radians — angle is measured from the fold line back
    const returnLen = foldLen * 0.6;
    const angleRad = (foldAngle * Math.PI) / 180;

    // Label
    const foldLabel = foldType === 'Hook Fold' ? 'HF' : foldType === 'Squash Fold' ? 'SF' : 'SSF';

    let foldPath = '';
    if (foldType === 'Hook Fold') {
      // Hook: go perpendicular, then bend back at the specified angle
      const returnAngle = perpAngle + Math.PI - angleRad;
      const returnX = foldEndX + Math.cos(returnAngle) * returnLen;
      const returnY = foldEndY + Math.sin(returnAngle) * returnLen;
      foldPath = `M ${point.x} ${point.y} L ${foldEndX} ${foldEndY} L ${returnX} ${returnY}`;
    } else if (foldType === 'Squash Fold') {
      // Squash: go perpendicular, then fold flat (angle determines how flat)
      const returnAngle = perpAngle + angleRad - Math.PI;
      const returnX = foldEndX + Math.cos(returnAngle) * returnLen;
      const returnY = foldEndY + Math.sin(returnAngle) * returnLen;
      foldPath = `M ${point.x} ${point.y} L ${foldEndX} ${foldEndY} L ${returnX} ${returnY}`;
    } else if (foldType === 'Semi Squash Fold') {
      // Semi squash: partial fold back
      const returnAngle = perpAngle + (Math.PI - angleRad) * 0.5;
      const returnX = foldEndX + Math.cos(returnAngle) * returnLen;
      const returnY = foldEndY + Math.sin(returnAngle) * returnLen;
      foldPath = `M ${point.x} ${point.y} L ${foldEndX} ${foldEndY} L ${returnX} ${returnY}`;
    }

    return (
      <g key={`fold-${isStart ? 'start' : 'end'}`}>
        <path d={foldPath} fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Fold label with mm and angle */}
        <text
          x={foldEndX + (foldEndX - point.x) * 0.3}
          y={foldEndY + (foldEndY - point.y) * 0.3}
          textAnchor="middle"
          className="text-[7px] font-bold fill-red-600 select-none pointer-events-none"
        >
          {foldLabel} {foldMm}mm
        </text>
        <text
          x={foldEndX + (foldEndX - point.x) * 0.3}
          y={foldEndY + (foldEndY - point.y) * 0.3 + 9}
          textAnchor="middle"
          className="text-[6px] fill-red-500 select-none pointer-events-none"
        >
          {foldAngle}°
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── TAG NAME ── */}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-steel-900">
          Tag Name <span className="text-steel-400 font-normal text-xs">(label for this flashing)</span>
        </label>
        <input
          type="text"
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="e.g. Front Fascia, Garage Barge, Ridge Cap..."
          className="w-full max-w-md rounded-lg border border-steel-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      {/* ── DIAGRAM AREA + RIGHT SIDEBAR ── */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-steel-900">Draw Your Flashing Profile</h3>
          <button
            onClick={resetDiagram}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-steel-600 bg-steel-100 rounded-lg hover:bg-steel-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* LEFT: Diagram */}
          <div className="flex-1 relative rounded-2xl border-2 border-dashed border-steel-300 bg-steel-50/50 overflow-hidden">
            <svg
              ref={svgRef}
              viewBox="0 0 700 400"
              className="w-full h-[350px] sm:h-[400px] md:h-[450px] cursor-crosshair"
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
              <rect width="700" height="400" fill="url(#grid)" />

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

              {/* Colour side indicator — coloured offset line on the colour side */}
              {points.length >= 2 && points.map((p, i) => {
                if (i === points.length - 1) return null;
                const next = points[i + 1];
                const dx = next.x - p.x;
                const dy = next.y - p.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;

                // Perpendicular offset direction
                const perpX = -dy / len;
                const perpY = dx / len;
                const sign = colourSide === 'Inside' ? 1 : -1;
                const offset = 6; // pixels offset from main line

                const x1 = p.x + perpX * offset * sign;
                const y1 = p.y + perpY * offset * sign;
                const x2 = next.x + perpX * offset * sign;
                const y2 = next.y + perpY * offset * sign;

                // Midpoint for label
                const mx = (x1 + x2) / 2 + perpX * 6 * sign;
                const my = (y1 + y2) / 2 + perpY * 6 * sign;

                return (
                  <g key={`colour-side-${i}`}>
                    {/* Coloured dashed line on the colour side */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={colourSide === 'Inside' ? '#dc2626' : '#2563eb'}
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                      opacity="0.6"
                    />
                  </g>
                );
              })}

              {/* Segment labels — positioned OUTSIDE the shape */}
              {points.length >= 2 && (() => {
                // Calculate centroid of all points (center of the shape)
                const cx = points.reduce((s, pt) => s + pt.x, 0) / points.length;
                const cy = points.reduce((s, pt) => s + pt.y, 0) / points.length;

                return points.map((p, i) => {
                  if (i === points.length - 1) return null;
                  const next = points[i + 1];
                  const dx = next.x - p.x;
                  const dy = next.y - p.y;
                  const len = Math.sqrt(dx * dx + dy * dy) || 1;
                  const midX = (p.x + next.x) / 2;
                  const midY = (p.y + next.y) / 2;

                  // Two perpendicular directions
                  const perpX1 = -dy / len;
                  const perpY1 = dx / len;
                  const perpX2 = dy / len;
                  const perpY2 = -dx / len;

                  // Pick the direction that points AWAY from the centroid (= outside)
                  const test1X = midX + perpX1;
                  const test1Y = midY + perpY1;
                  const test2X = midX + perpX2;
                  const test2Y = midY + perpY2;
                  const dist1 = (test1X - cx) * (test1X - cx) + (test1Y - cy) * (test1Y - cy);
                  const dist2 = (test2X - cx) * (test2X - cx) + (test2Y - cy) * (test2Y - cy);

                  const perpX = dist1 > dist2 ? perpX1 : perpX2;
                  const perpY = dist1 > dist2 ? perpY1 : perpY2;

                  const offsetDist = 45;
                  const labelX = midX + perpX * offsetDist;
                  const labelY = midY + perpY * offsetDist;
                  const seg = segments[i];
                  if (!seg) return null;

                  const letter = String.fromCharCode(65 + i);

                  const segOff = segLabelOffsets[i] || { dx: 0, dy: 0 };
                  const finalLabelX = labelX + segOff.dx;
                  const finalLabelY = labelY + segOff.dy;

                  const isEditingSeg = editingSegment === i;

                  return (
                    <g key={`seg-${i}`}>
                      {isEditingSeg ? (
                        <foreignObject x={finalLabelX - 38} y={finalLabelY - 16} width="76" height="32"
                          style={{ cursor: 'move' }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if ((e.target as HTMLElement).tagName === 'INPUT') return;
                            labelDragRef.current = { type: 'seg', idx: i, startX: e.clientX, startY: e.clientY, origDx: segOff.dx, origDy: segOff.dy };
                            const onMove = (ev: MouseEvent) => {
                              if (!labelDragRef.current) return;
                              const ddx = ev.clientX - labelDragRef.current.startX;
                              const ddy = ev.clientY - labelDragRef.current.startY;
                              setSegLabelOffsets((prev) => ({ ...prev, [i]: { dx: labelDragRef.current!.origDx + ddx, dy: labelDragRef.current!.origDy + ddy } }));
                            };
                            const onUp = () => { labelDragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          }}
                        >
                          <div className="flex items-center justify-center h-full">
                            <div className="flex items-center bg-white border-2 border-blue-500 rounded-md px-1.5 py-0.5 shadow-md gap-1">
                              <span className="text-[11px] font-bold text-blue-600 cursor-move">{letter}</span>
                              <input
                                type="number"
                                min={0}
                                autoFocus
                                value={seg.lengthMm || ''}
                                onChange={(e) => updateSegmentLength(i, parseInt(e.target.value) || 0)}
                                onBlur={() => setEditingSegment(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setEditingSegment(null); }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-[40px] text-[13px] font-bold text-blue-800 text-center bg-transparent outline-none border-none p-0 cursor-text"
                                placeholder="mm"
                              />
                            </div>
                          </div>
                        </foreignObject>
                      ) : (
                        <g
                          style={{ cursor: 'move' }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            labelDragRef.current = { type: 'seg', idx: i, startX: e.clientX, startY: e.clientY, origDx: segOff.dx, origDy: segOff.dy };
                            const onMove = (ev: MouseEvent) => {
                              if (!labelDragRef.current) return;
                              const ddx = ev.clientX - labelDragRef.current.startX;
                              const ddy = ev.clientY - labelDragRef.current.startY;
                              setSegLabelOffsets((prev) => ({ ...prev, [i]: { dx: labelDragRef.current!.origDx + ddx, dy: labelDragRef.current!.origDy + ddy } }));
                            };
                            const onUp = () => { labelDragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                            window.addEventListener('mousemove', onMove);
                            window.addEventListener('mouseup', onUp);
                          }}
                          onClick={(e) => { e.stopPropagation(); setEditingSegment(i); }}
                        >
                          {/* Invisible hit area for dragging/clicking */}
                          <rect x={finalLabelX - 36} y={finalLabelY - 14} width="72" height="28" rx="5" fill="transparent" />
                          <text x={finalLabelX} y={finalLabelY + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1d4ed8">
                            {seg.lengthMm > 0 ? `${seg.lengthMm}mm` : letter}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                });
              })()}

              {/* Fold indicators at interior points — black triangle showing colour side + angle */}
              {points.map((p, i) => {
                if (i === 0 || i === points.length - 1) return null;
                if (points.length < 3) return null;

                const prev = points[i - 1];
                const next = points[i + 1];

                // Direction vectors
                const dx1 = p.x - prev.x;
                const dy1 = p.y - prev.y;
                const dx2 = next.x - p.x;
                const dy2 = next.y - p.y;

                // Bisector direction (points inward)
                const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
                const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
                const nx1 = dx1 / len1;
                const ny1 = dy1 / len1;
                const nx2 = dx2 / len2;
                const ny2 = dy2 / len2;

                // Perpendicular of incoming segment (left side = inside)
                const perpX = -ny1;
                const perpY = nx1;

                // Triangle pointing to the colour side
                const triSize = 7;
                const sign = colourSide === 'Inside' ? 1 : -1;
                const triTipX = p.x + perpX * triSize * sign;
                const triTipY = p.y + perpY * triSize * sign;
                const triBaseX1 = p.x + nx1 * 4;
                const triBaseY1 = p.y + ny1 * 4;
                const triBaseX2 = p.x - nx1 * 4;
                const triBaseY2 = p.y - ny1 * 4;

                const angle = foldAngles[i - 1] ?? 90;

                // Bisector direction — points away from both segments (into the corner)
                // Use the average of the two outward normals
                const bisX = -(nx1 + nx2);
                const bisY = -(ny1 + ny2);
                const bisLen = Math.sqrt(bisX * bisX + bisY * bisY) || 1;
                const nbisX = bisX / bisLen;
                const nbisY = bisY / bisLen;

                // Position angle label along the bisector, far from the fold point
                const angleLabelDist = 35;
                const angleLabelX = p.x + nbisX * angleLabelDist;
                const angleLabelY = p.y + nbisY * angleLabelDist;

                return (
                  <g key={`fold-${i}`}>
                    {/* Black filled triangle showing colour side */}
                    <polygon
                      points={`${triTipX},${triTipY} ${triBaseX1},${triBaseY1} ${triBaseX2},${triBaseY2}`}
                      fill="#000000"
                      stroke="#000000"
                      strokeWidth="0.5"
                    />
                    {/* Angle label — static by default, editable on click */}
                    {(() => {
                      const angOff = angleLabelOffsets[i] || { dx: 0, dy: 0 };
                      const finalAngleX = angleLabelX + angOff.dx;
                      const finalAngleY = angleLabelY + angOff.dy;
                      const isEditingAng = editingAngle === i;

                      const handleAngleChange = (val: number) => {
                        const clamped = Math.max(0, Math.min(360, val));
                        setFoldAngles((prev) => { const n = [...prev]; n[i - 1] = clamped; return n; });
                        const foldPointIdx = i;
                        if (foldPointIdx < points.length - 1 && foldPointIdx > 0) {
                          const prevPt = points[foldPointIdx - 1];
                          const curr = points[foldPointIdx];
                          const nextPt = points[foldPointIdx + 1];
                          const ddx = curr.x - prevPt.x;
                          const ddy = curr.y - prevPt.y;
                          const inAngle = Math.atan2(ddy, ddx);
                          const outLen = Math.sqrt((nextPt.x - curr.x) ** 2 + (nextPt.y - curr.y) ** 2) || 60;
                          const turnRad = ((180 - clamped) * Math.PI) / 180;
                          const outAngle = inAngle + turnRad;
                          setPoints((p) => {
                            const np = [...p];
                            np[foldPointIdx + 1] = {
                              x: Math.round(curr.x + Math.cos(outAngle) * outLen),
                              y: Math.round(curr.y + Math.sin(outAngle) * outLen),
                            };
                            return np;
                          });
                        }
                      };

                      const dragHandlers = {
                        onMouseDown: (e: React.MouseEvent) => {
                          e.stopPropagation();
                          if ((e.target as HTMLElement).tagName === 'INPUT') return;
                          labelDragRef.current = { type: 'angle', idx: i, startX: e.clientX, startY: e.clientY, origDx: angOff.dx, origDy: angOff.dy };
                          const onMove = (ev: MouseEvent) => {
                            if (!labelDragRef.current) return;
                            const ddx = ev.clientX - labelDragRef.current.startX;
                            const ddy = ev.clientY - labelDragRef.current.startY;
                            setAngleLabelOffsets((prev) => ({ ...prev, [i]: { dx: labelDragRef.current!.origDx + ddx, dy: labelDragRef.current!.origDy + ddy } }));
                          };
                          const onUp = () => { labelDragRef.current = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                          window.addEventListener('mousemove', onMove);
                          window.addEventListener('mouseup', onUp);
                        },
                      };

                      if (isEditingAng) {
                        return (
                          <foreignObject x={finalAngleX - 32} y={finalAngleY - 16} width="64" height="32"
                            style={{ cursor: 'move' }}
                            {...dragHandlers}
                          >
                            <div className="flex items-center justify-center h-full">
                              <div className="flex items-center bg-white border-2 border-red-500 rounded-md px-1.5 py-0.5 shadow-md gap-0.5">
                                <input
                                  type="number"
                                  min={0}
                                  max={360}
                                  autoFocus
                                  value={angle}
                                  onChange={(e) => handleAngleChange(parseInt(e.target.value) || 0)}
                                  onBlur={() => setEditingAngle(null)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingAngle(null); }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-[34px] text-[13px] font-bold text-red-600 text-center bg-transparent outline-none border-none p-0 cursor-text"
                                />
                                <span className="text-[12px] font-bold text-red-500">°</span>
                              </div>
                            </div>
                          </foreignObject>
                        );
                      }

                      return (
                        <g
                          style={{ cursor: 'move' }}
                          {...dragHandlers}
                          onClick={(e) => { e.stopPropagation(); setEditingAngle(i); }}
                        >
                          {/* Invisible hit area for dragging/clicking */}
                          <rect x={finalAngleX - 30} y={finalAngleY - 14} width="60" height="28" rx="5" fill="transparent" />
                          <text x={finalAngleX} y={finalAngleY + 5} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#dc2626">{angle}°</text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Start/End fold type indicators */}
              {points.length >= 2 && renderFoldIndicator(points[0], startFold, true)}
              {points.length >= 2 && renderFoldIndicator(points[points.length - 1], endFold, false)}

              {/* Draggable points — small open circles at all points like reference image */}
              {points.map((p, i) => (
                <g key={`pt-${i}`} className="point-handle" style={{ cursor: 'grab' }}>
                  <circle cx={p.x} cy={p.y} r="14" fill="transparent" onMouseDown={(e) => handlePointMouseDown(i, e)} />
                  <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#6366f1" strokeWidth="1.5" onMouseDown={(e) => handlePointMouseDown(i, e)} />
                </g>
              ))}

              {/* Colour side label — top right of diagram */}
              {points.length >= 2 && (
                <text x={680} y={20} textAnchor="end" className="text-[11px] font-bold select-none pointer-events-none" fill={colourSide === 'Inside' ? '#dc2626' : '#2563eb'}>
                  Colour {colourSide}
                </text>
              )}

              {/* Instructions */}
              <text x="350" y="390" textAnchor="middle" className="text-[10px] fill-steel-400 select-none pointer-events-none">
                Click to add points. Drag points to adjust shape.
              </text>
            </svg>
          </div>

          {/* Controls — below on mobile, right side on desktop */}
          <div className="md:w-[140px] flex-shrink-0 flex flex-wrap md:flex-col gap-2">
            {/* Reverse Colour Side */}
            <button
              onClick={() => setColourSide(colourSide === 'Inside' ? 'Outside' : 'Inside')}
              className="w-full py-2 text-[11px] font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Reverse Color
            </button>

            {/* Remove First */}
            <button
              onClick={removeFirst}
              disabled={points.length <= 2}
              className={cn(
                'w-full flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold rounded-lg transition-colors',
                points.length <= 2 ? 'bg-steel-100 text-steel-400 cursor-not-allowed' : 'bg-pink-500 text-white hover:bg-pink-600'
              )}
            >
              Remove First
            </button>

            {/* Remove Last */}
            <button
              onClick={removeLast}
              disabled={points.length <= 2}
              className={cn(
                'w-full flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold rounded-lg transition-colors',
                points.length <= 2 ? 'bg-steel-100 text-steel-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
              )}
            >
              Remove Last
            </button>

            {/* Start Fold */}
            <div className="relative">
              <button
                onClick={() => { setShowStartFoldMenu(!showStartFoldMenu); setShowEndFoldMenu(false); }}
                className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Start Fold <ChevronDown className="h-3 w-3" />
              </button>
              {showStartFoldMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[160px] rounded-lg bg-white border border-steel-200 shadow-xl py-1">
                  {FOLD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStartFold(opt); setShowStartFoldMenu(false);
                        if (opt === 'Hook Fold') setStartFoldAngle(140);
                        else if (opt === 'Squash Fold') setStartFoldAngle(180);
                        else if (opt === 'Semi Squash Fold') setStartFoldAngle(160);
                      }}
                      className={cn('block w-full text-left px-3 py-1.5 text-xs hover:bg-steel-50', startFold === opt ? 'font-bold text-brand-600 bg-brand-50' : 'text-steel-700')}
                    >{opt}</button>
                  ))}
                </div>
              )}
              {startFold !== 'Nothing' && (
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div className="flex items-center gap-0.5">
                    <input type="number" min={0} value={startFoldMm} onChange={(e) => setStartFoldMm(Math.max(0, parseInt(e.target.value) || 0))} className="w-full rounded border border-steel-300 px-1 py-1 text-[10px] text-center" />
                    <span className="text-[9px] text-steel-500">mm</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <input type="number" min={0} max={360} value={startFoldAngle} onChange={(e) => setStartFoldAngle(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))} className="w-full rounded border border-steel-300 px-1 py-1 text-[10px] text-center" />
                    <span className="text-[9px] text-steel-500">°</span>
                  </div>
                  <select value={startFoldDir} onChange={(e) => setStartFoldDir(e.target.value as 'Up' | 'Down')} className="col-span-2 rounded border border-steel-300 px-1 py-1 text-[10px]">
                    <option value="Up">Up (Inside)</option>
                    <option value="Down">Down (Outside)</option>
                  </select>
                </div>
              )}
            </div>

            {/* End Fold — at the bottom */}
            <div className="relative">
              <button
                onClick={() => { setShowEndFoldMenu(!showEndFoldMenu); setShowStartFoldMenu(false); }}
                className="w-full flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                End Fold <ChevronDown className="h-3 w-3" />
              </button>
              {showEndFoldMenu && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[160px] rounded-lg bg-white border border-steel-200 shadow-xl py-1">
                  {FOLD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setEndFold(opt); setShowEndFoldMenu(false);
                        if (opt === 'Hook Fold') setEndFoldAngle(140);
                        else if (opt === 'Squash Fold') setEndFoldAngle(180);
                        else if (opt === 'Semi Squash Fold') setEndFoldAngle(160);
                      }}
                      className={cn('block w-full text-left px-3 py-1.5 text-xs hover:bg-steel-50', endFold === opt ? 'font-bold text-brand-600 bg-brand-50' : 'text-steel-700')}
                    >{opt}</button>
                  ))}
                </div>
              )}
              {endFold !== 'Nothing' && (
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div className="flex items-center gap-0.5">
                    <input type="number" min={0} value={endFoldMm} onChange={(e) => setEndFoldMm(Math.max(0, parseInt(e.target.value) || 0))} className="w-full rounded border border-steel-300 px-1 py-1 text-[10px] text-center" />
                    <span className="text-[9px] text-steel-500">mm</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <input type="number" min={0} max={360} value={endFoldAngle} onChange={(e) => setEndFoldAngle(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))} className="w-full rounded border border-steel-300 px-1 py-1 text-[10px] text-center" />
                    <span className="text-[9px] text-steel-500">°</span>
                  </div>
                  <select value={endFoldDir} onChange={(e) => setEndFoldDir(e.target.value as 'Up' | 'Down')} className="col-span-2 rounded border border-steel-300 px-1 py-1 text-[10px]">
                    <option value="Up">Up (Inside)</option>
                    <option value="Down">Down (Outside)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div className="rounded-lg border border-steel-200 bg-white p-2">
              <p className="text-[10px] font-bold text-steel-700 mb-1.5 text-center">Quantity</p>
              <div className="flex items-center rounded border border-steel-300">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1 text-steel-600 hover:bg-steel-50 text-sm">-</button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 border-x border-steel-300 text-center py-1 text-xs"
                />
                <button onClick={() => setQuantity(quantity + 1)} className="px-2 py-1 text-steel-600 hover:bg-steel-50 text-sm">+</button>
              </div>
            </div>

            {/* Length (metres) */}
            <div className="rounded-lg border border-steel-200 bg-white p-2">
              <p className="text-[10px] font-bold text-steel-700 mb-1.5 text-center">Length (m)</p>
              <input
                type="number"
                min={0}
                max={8}
                step={0.1}
                value={flashingLength || ''}
                onChange={(e) => setFlashingLength(Math.max(0, Math.min(8, parseFloat(e.target.value) || 0)))}
                placeholder="Max 8m"
                className="w-full rounded border border-steel-300 px-2 py-1 text-xs text-center font-medium focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>{/* end flex row */}
      </div>

      {/* Segment lengths and fold angles are now editable inline in the diagram above */}

      {/* Fold angles are now editable inline in the diagram above */}

      {/* ── MATERIAL & COLOUR ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Material */}
        <div>
          <label className="mb-2 block text-sm font-bold text-steel-900">
            Material <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(COLOUR_OPTIONS).map((mat) => (
              <button
                key={mat}
                onClick={() => {
                  setMaterial(mat);
                  // Auto-select gauge: first option for the chosen material
                  const gauges = GAUGE_BY_MATERIAL[mat] || ['0.55mm'];
                  setGauge(gauges[0]);
                }}
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
            {(GAUGE_BY_MATERIAL[material] || ['0.55mm']).map((g: string) => (
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

      {/* ── SUMMARY & PRICE ── */}
      <div className="rounded-2xl bg-steel-50 border border-steel-200 p-4 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-steel-900">Order Summary</h3>

        {tagName && (
          <div className="text-sm text-brand-600 font-semibold">{tagName}</div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-xl font-bold text-brand-600">{totalGirth}<span className="text-xs font-normal text-steel-500">mm</span></div>
            <div className="text-xs text-steel-500 mt-1">Total Girth</div>
          </div>
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-xl font-bold text-amber-600">{foldCount}</div>
            <div className="text-xs text-steel-500 mt-1">Folds</div>
          </div>
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-sm font-bold text-steel-700 truncate">{material || '—'}</div>
            <div className="text-xs text-steel-500 mt-1">Material</div>
          </div>
          <div className="text-center rounded-xl bg-white p-3 border border-steel-100">
            <div className="text-sm font-bold text-steel-700 truncate">{colour || '—'}</div>
            <div className="text-xs text-steel-500 mt-1">Colour</div>
          </div>
        </div>

        {/* Fold types */}
        {(startFold !== 'Nothing' || endFold !== 'Nothing') && (
          <div className="flex flex-wrap gap-2">
            {startFold !== 'Nothing' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                Start: {startFold} — {startFoldMm}mm, {startFoldAngle}°, {startFoldDir === 'Up' ? 'Inside' : 'Outside'}
              </span>
            )}
            {endFold !== 'Nothing' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 px-2.5 py-1 rounded-full border border-red-200">
                End: {endFold} — {endFoldMm}mm, {endFoldAngle}°, {endFoldDir === 'Up' ? 'Inside' : 'Outside'}
              </span>
            )}
          </div>
        )}

        <div className="border-t border-steel-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-steel-600">Price:</span>
            <span className="font-semibold text-steel-900">
              {priceLoading ? 'Loading...' : lookupPrice !== null ? formatCurrency(unitPrice) : 'Price on request'}
            </span>
          </div>
          {flashingLength > 0 && lookupPrice !== null && (
            <div className="flex justify-between text-sm">
              <span className="text-steel-600">{formatCurrency(unitPrice)} × {flashingLength}m</span>
              <span className="font-medium">{formatCurrency(unitPrice * flashingLength)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-steel-200 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-steel-900">Total:</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-steel-900">
                {lookupPrice !== null && flashingLength > 0 ? formatCurrency(unitPrice * flashingLength * quantity) : '$0.00'}
              </span>
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
        >
          Add to Cart
        </Button>
        <Button
          variant="outline"
          size="lg"
          leftIcon={<Zap className="h-5 w-5" />}
          onClick={() => {
            handleAddToCart();
            if (colour) router.push('/cart');
          }}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
