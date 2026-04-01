'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion, useInView, useScroll, useTransform, AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight, Shield, Truck, Headphones, Award,
  Layers, Droplets, Wrench, PipetteIcon, Hammer, Package, Zap,
  CheckCircle2, Star, Phone, Building2, HardHat,
  Home, Factory, Sparkles, ArrowUpRight, ShoppingCart,
} from 'lucide-react';
import { productApi } from '@/services/product.service';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════ */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const categories = [
  { name: 'Roofing', slug: 'roofing', desc: 'Roofing, ridging & polycarbonate', icon: Layers, gradient: 'from-sky-500 to-blue-700', match: ['roof-sheets', 'roofing', 'polycarbonate'] },
  { name: 'Cladding', slug: 'cladding', desc: 'Interlocking wall panels & trims', icon: Package, gradient: 'from-slate-500 to-slate-700', match: ['cladding-panels', 'cladding'] },
  { name: 'Fascia & Gutter', slug: 'fascia-gutter', desc: 'Guttering, fascia boards & fittings', icon: Wrench, gradient: 'from-brand-500 to-brand-700', match: ['fascia', 'gutter'] },
  { name: 'Downpipes', slug: 'downpipe', desc: 'Round & square downpipes & fittings', icon: PipetteIcon, gradient: 'from-teal-500 to-teal-700', match: ['downpipe'] },
  { name: 'Flashing', slug: 'flashing', desc: 'Custom roof & wall flashings', icon: Zap, gradient: 'from-orange-500 to-orange-700', match: ['flashing'] },
  { name: 'Rainwater Goods', slug: 'rainwater-goods', desc: 'Rainheads, sumps & dambusters', icon: Droplets, gradient: 'from-cyan-500 to-cyan-700', match: ['dambuster', 'rainhead', 'rainwater', 'sump'] },
  { name: 'Accessories', slug: 'accessories', desc: 'Insulation & accessories', icon: Hammer, gradient: 'from-amber-500 to-amber-700', match: ['insulation', 'accessories', 'screws'] },
];


const features = [
  { icon: Shield, title: 'Quality Guaranteed', desc: 'All products meet Australian Standards with manufacturer warranties.', color: 'from-blue-500 to-blue-600' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Reliable shipping with tracking. Metro & regional delivery nationwide.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Headphones, title: 'Expert Support', desc: 'Trade-experienced team for sizing, specs and project planning.', color: 'from-violet-500 to-violet-600' },
  { icon: Award, title: 'Trade Pricing', desc: 'Exclusive rates, volume discounts and 30-day terms for trade.', color: 'from-amber-500 to-amber-600' },
];


/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE
   ═══════════════════════════════════════════════════════════════════════ */

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease, delay }}
      className={className}>{children}</motion.div>
  );
}

function Stagger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}>{children}</motion.div>
  );
}

function FadeItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 50, scale: 0.96 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } },
    }} className={className}>{children}</motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RIBBON PRODUCT FLOW — infinite horizontal scroll of product cards
   ═══════════════════════════════════════════════════════════════════════ */

function ProductRibbon({ products }: { products: Product[] }) {
  if (!products.length) return null;
  // Double for seamless loop
  const items = [...products, ...products];

  return (
    <div className="relative w-full overflow-hidden py-14 ribbon-viewport">
      {/* Center spotlight glow */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[500px] bg-brand-500/[0.08] blur-[120px] pointer-events-none z-0" />

      {/* Scrolling track — pure CSS */}
      <div className="ribbon-track gap-6">
        {items.map((product, i) => {
          const img = product.images?.find((im) => im.isDefault)?.url || product.images?.[0]?.url;
          const isQuote = product.pricingModel === 'quote_only';
          return (
            <Link
              key={`${product._id}-${i}`}
              href={`/products/${product.slug}`}
              className="ribbon-card group relative flex-shrink-0 w-[280px] rounded-2xl overflow-hidden
                bg-white/[0.05] backdrop-blur-xl border border-white/[0.06]"
            >
              {/* Image */}
              <div className="relative h-[200px] bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex items-center justify-center overflow-hidden">
                {img ? (
                  <img src={img} alt={product.name} loading="lazy"
                    className="max-h-[170px] max-w-[230px] object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <Package className="h-14 w-14 text-white/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050b14]/60 via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="px-5 pb-5 pt-3">
                {product.category && (
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-brand-400/80 mb-1 block">
                    {product.category.name}
                  </span>
                )}
                <h3 className="text-sm font-bold text-white/90 leading-tight line-clamp-1 group-hover:text-brand-300 transition-colors">
                  {product.name}
                </h3>
                <div className="mt-2.5 flex items-center justify-between">
                  <div>
                    {isQuote ? (
                      <span className="text-xs font-bold text-brand-400">Request Quote</span>
                    ) : product.priceRange ? (
                      <span className="text-sm font-black text-white/80">
                        From {formatCurrency(product.priceRange.min)}
                        {product.pricingModel === 'per_metre' && <span className="text-[10px] text-white/30 font-normal ml-0.5">/m</span>}
                      </span>
                    ) : product.price ? (
                      <span className="text-sm font-black text-white/80">{formatCurrency(product.price)}</span>
                    ) : (
                      <span className="text-[11px] text-white/30">Configure for pricing</span>
                    )}
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-brand-400 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT SHOWCASE — carousel with orange card + product image + nav arrows
   ═══════════════════════════════════════════════════════════════════════ */

function ProductShowcase({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const showcaseProducts = products.slice(0, 8);
  const len = showcaseProducts.length;

  const prev = () => setCurrent((c) => (c - 1 + len) % len);
  const next = () => setCurrent((c) => (c + 1) % len);

  // No auto-advance — only changes on arrow click

  if (!len) return null;

  const p = showcaseProducts[current];
  const img = p?.images?.find((im) => im.isDefault)?.url || p?.images?.[0]?.url;

  return (
    <section aria-label="Product Showcase" className="py-12 lg:py-16 bg-white relative overflow-hidden">
      <div className="container-main">
        <Reveal>
          <div className="relative flex items-center justify-center">
            {/* Main layout */}
            <div className="relative w-full max-w-[900px] mx-14 lg:mx-20 h-[300px] lg:h-[360px]">
              {/* Orange card — large, behind left */}
              <div className="absolute left-5 top-[-8%] bottom-[-8%] w-[260px] lg:w-[330px] rounded-3xl bg-gradient-to-b from-brand-500 to-brand-700 shadow-2xl z-0">
                <span className="absolute left-[-20px] lg:left-[-0px] top-1/2 text-white/80 font-black text-4xl lg:text-6xl tracking-wider select-none"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'translateY(-50%) rotate(180deg)' }}>
                  PRODUCTS
                </span>
              </div>

              {/* Dark card with background image */}
              <div className="absolute left-[140px] lg:left-[180px] right-0 top-0 bottom-0 rounded-3xl shadow-2xl z-[1] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-steel-700 via-steel-800 to-steel-900" />
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: 'url(/images/warehouse-bg.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
                <div className="absolute inset-0 bg-gradient-to-r from-steel-800/80 via-transparent to-transparent" />
              </div>

              {/* Left arrow — touching orange card */}
              <button onClick={prev}
                className="absolute left-[2px] top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 h-12 w-12 rounded-full bg-white border border-steel-200 shadow-lg flex items-center justify-center hover:bg-steel-50 hover:shadow-xl transition-all duration-300">
                <ArrowRight className="h-5 w-5 text-steel-700 rotate-180" />
              </button>

              {/* Right arrow — touching dark card */}
              <button onClick={next}
                className="absolute right-[-2px] top-1/2 -translate-y-1/2 translate-x-1/2 z-20 h-12 w-12 rounded-full bg-white border border-steel-200 shadow-lg flex items-center justify-center hover:bg-steel-50 hover:shadow-xl transition-all duration-300">
                <ArrowRight className="h-5 w-5 text-steel-700" />
              </button>

              {/* Product image — white card overlapping both */}
              <AnimatePresence mode="wait">
                <motion.div key={`img-${current}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease }}
                  className="absolute left-[100px] lg:left-[130px] top-[8%] bottom-[8%] w-[200px] lg:w-[250px] z-10 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-4 overflow-hidden"
                >
                  {img ? (
                    <img src={img} alt={p.name}
                      className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Package className="h-20 w-20 text-steel-200" />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Product info — right side */}
              <AnimatePresence mode="wait">
                <motion.div key={`info-${current}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease, delay: 0.1 }}
                  className="absolute left-[50%] lg:left-[48%] right-0 top-0 bottom-0 z-10 flex flex-col items-center justify-center px-4 lg:px-8"
                >
                  {p.category && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-300/80 mb-2">
                      {p.category.name}
                    </span>
                  )}
                  <h3 className="text-lg lg:text-2xl font-black text-white leading-tight mb-5 text-center">
                    {p.name}
                  </h3>
                  <Link href={`/products/${p.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-3 text-sm font-bold text-white uppercase tracking-wider hover:from-brand-400 hover:to-brand-500 transition-all shadow-lg shadow-brand-600/30">
                    Know More
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {showcaseProducts.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-brand-600' : 'w-2.5 bg-steel-200 hover:bg-steel-300'}`} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORIES FAN — semicircle with hover product image
   ═══════════════════════════════════════════════════════════════════════ */

function CategoriesFan({ products }: { products: Product[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Get a representative product for each category using match keywords
  const getCategoryProduct = (matchWords: string[]) => {
    return products.find((pr) => {
      const pSlug = pr.category?.slug || '';
      const pName = (pr.category?.name || '').toLowerCase();
      const pProductName = pr.name.toLowerCase();
      return matchWords.some((w) => pSlug.includes(w) || pName.includes(w) || pProductName.includes(w));
    }) || null;
  };

  const hoveredCat = hoveredIdx !== null ? categories[hoveredIdx] : null;
  const hoveredProduct = hoveredCat ? getCategoryProduct(hoveredCat.match) : null;
  const hoveredImg = hoveredProduct?.images?.find((im) => im.isDefault)?.url || hoveredProduct?.images?.[0]?.url || '';

  return (
    <section aria-labelledby="cat-h" className="py-12 lg:py-16 bg-gradient-to-b from-white to-steel-50/30 relative overflow-hidden">
      <div className="container-main relative">
        <Reveal><div className="text-center mb-10">
          <span className="text-[11px] font-extrabold text-brand-600 tracking-[0.3em] uppercase mb-3 block">Product Range</span>
          <h2 id="cat-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">Shop by Category</h2>
          <p className="mt-4 text-steel-500 max-w-xl mx-auto leading-relaxed">Premium Colorbond and Galvanised products for residential and commercial projects.</p>
        </div></Reveal>
        <Reveal>
          <div className="relative mx-auto" style={{ maxWidth: '1000px', aspectRatio: '2 / 1.1' }}>
            {/* SVG fan segments only */}
            <svg viewBox="0 0 1000 550" className="w-full h-full absolute inset-0">
              {categories.map((_, i) => {
                const total = categories.length;
                const startAngle = Math.PI + (i * Math.PI) / total;
                const endAngle = Math.PI + ((i + 1) * Math.PI) / total;
                const cx = 500, cy = 520, r = 480, innerR = 120;
                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);
                const ix1 = cx + innerR * Math.cos(endAngle);
                const iy1 = cy + innerR * Math.sin(endAngle);
                const ix2 = cx + innerR * Math.cos(startAngle);
                const iy2 = cy + innerR * Math.sin(startAngle);
                return (
                  <path key={i}
                    d={`M ${ix2} ${iy2} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 0 0 ${ix2} ${iy2} Z`}
                    fill={hoveredIdx === i ? 'rgba(0,116,197,0.16)' : i % 2 === 0 ? 'rgba(0,116,197,0.07)' : 'rgba(0,116,197,0.035)'}
                    stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </svg>

            {/* HTML labels inside segments — no rotation, just positioned */}
            {categories.map((cat, i) => {
              const total = categories.length;
              const midAngle = Math.PI + ((i + 0.5) * Math.PI) / total;
              const labelR = 0.72;
              // Convert to percentage of the container
              const leftPct = 50 + labelR * Math.cos(midAngle) * 48;
              const topPct = 95 + labelR * Math.sin(midAngle) * 87;
              return (
                <Link key={cat.slug} href={`/categories/${cat.slug}`}
                  className="absolute z-10 flex flex-col items-center text-center cursor-pointer group -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <span className={`text-sm lg:text-lg font-extrabold transition-colors duration-200 whitespace-nowrap ${hoveredIdx === i ? 'text-brand-600' : 'text-steel-700'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[9px] lg:text-[10px] text-steel-400 max-w-[120px] leading-tight mt-0.5 hidden lg:block">
                    {cat.desc}
                  </span>
                </Link>
              );
            })}

            {/* Center circle with logo — at the fan's center point */}
            <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[40%] w-28 h-28 lg:w-36 lg:h-36 rounded-full bg-white shadow-2xl border border-steel-100 flex items-center justify-center z-10 overflow-hidden">
              <img src="/images/logo.png" alt="Metfold" className="w-[85%] h-auto object-contain" />
            </div>

            {/* Hover product image — dynamically positioned near the hovered segment */}
            <AnimatePresence>
              {hoveredCat && hoveredIdx !== null && (() => {
                const total = categories.length;
                const midAngle = Math.PI + ((hoveredIdx + 0.5) * Math.PI) / total;
                const popR = 0.95;
                const popLeft = 50 + popR * Math.cos(midAngle) * 48;
                const popTop = 95 + popR * Math.sin(midAngle) * 87;
                return (
                  <motion.div
                    key={`pop-${hoveredIdx}`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease }}
                    className="absolute z-20 hidden lg:block -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${popLeft}%`, top: `${popTop}%` }}
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-2xl bg-white pointer-events-auto" style={{ width: '200px', height: '140px' }}>
                      {hoveredImg ? (
                        <img src={hoveredImg} alt={hoveredCat.name} className="w-full h-full object-contain p-2 bg-steel-50" />
                      ) : (
                        <div className="w-full h-full bg-steel-50 flex items-center justify-center">
                          <Package className="h-10 w-10 text-steel-200" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-steel-900/90 to-transparent px-3 py-2">
                        <div className="text-[11px] font-bold text-white truncate">{hoveredProduct?.name || hoveredCat.name}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productApi.getProducts({ limit: 50 }).then((res) => {
      if (Array.isArray(res?.data)) setProducts(res.data);
    }).catch(() => { });
  }, []);

  return (
    <>
      {/* ═══════════════  HERO  ════════════════════════════════════════════ */}
      <section ref={heroRef}
        aria-label="Metfold Sheet Metal — Premium roofing and cladding supplies"
        className="relative overflow-hidden bg-white">

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Store', name: 'Metfold Sheet Metal',
          description: 'Australia\'s trusted supplier of Colorbond roofing, wall cladding, fascia & gutter, downpipes, flashings and rainwater goods.',
          url: 'https://metfoldsm.com.au', image: '/images/logo.png', priceRange: '$$',
          address: { '@type': 'PostalAddress', addressCountry: 'AU' },
        }) }} />

        <div className="container-main relative">
          <div className="flex flex-col lg:flex-row items-center min-h-[85vh] py-16 lg:py-0 gap-10 lg:gap-16">
            {/* Left — Text content */}
            <motion.div style={{ opacity: heroOpacity }} className="flex-1 max-w-xl relative z-10">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.1 }}>
                <div className="inline-flex items-center gap-2.5 rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-[12px] font-semibold text-brand-600 mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
                  </span>
                  Online Ordering Now Live
                </div>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-[1.05] text-steel-900">
                Australia&apos;s Trusted{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">Roofing</span>
                  <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.2, ease }}
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-500 to-brand-400 origin-left rounded-full" />
                </span>{' '}
                &amp; Sheet Metal Supplier
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.4 }}
                className="mt-6 text-base sm:text-lg text-steel-500 leading-relaxed">
                Configure Colorbond roofing, cladding, flashings and rainwater goods online with{' '}
                <span className="text-steel-800 font-semibold">instant pricing</span> — delivered anywhere in Australia.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease, delay: 0.55 }}
                className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/products"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-300">
                  Shop All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-steel-200 px-7 py-3.5 text-sm font-semibold text-steel-700 hover:border-brand-300 hover:text-brand-600 transition-all duration-300">
                  Get a Quote
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-steel-400">
                {['No Minimum Order', 'Instant Pricing', 'GST Invoice', 'Trade Accounts'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-500" />{t}
                  </div>
                ))}
              </motion.div>

              {/* Trust stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="mt-10 flex items-center gap-8 border-t border-steel-100 pt-8">
                {[
                  { val: '500+', label: 'Products' },
                  { val: '15+', label: 'Years' },
                  { val: '98%', label: 'Satisfaction' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-black text-steel-900">{s.val}</div>
                    <div className="text-xs text-steel-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Hero visual */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease, delay: 0.3 }}
              className="flex-1 relative hidden lg:flex items-center justify-center">
              {/* Large gradient circle bg */}
              <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-50 via-brand-100/50 to-transparent -right-10 -top-10" />

              {/* Product cards floating */}
              <div className="relative w-[480px] h-[480px]">
                {/* Main featured product */}
                {products[0] && (
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-[10%] left-[10%] w-[260px] rounded-2xl bg-white shadow-2xl shadow-steel-200/60 border border-steel-100 overflow-hidden z-10">
                    <div className="h-[180px] bg-steel-50 flex items-center justify-center p-4">
                      {products[0].images?.[0]?.url ? (
                        <img src={products[0].images[0].url} alt={products[0].name} className="max-h-full max-w-full object-contain" />
                      ) : <Package className="h-16 w-16 text-steel-200" />}
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">{products[0].category?.name}</div>
                      <div className="text-sm font-bold text-steel-900 mt-1 line-clamp-1">{products[0].name}</div>
                      {products[0].priceRange && (
                        <div className="text-sm font-black text-brand-600 mt-1">From {formatCurrency(products[0].priceRange.min)}</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Secondary product card */}
                {products[1] && (
                  <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-[15%] right-[0%] w-[200px] rounded-xl bg-white shadow-xl shadow-steel-200/40 border border-steel-100 overflow-hidden z-20">
                    <div className="h-[120px] bg-steel-50 flex items-center justify-center p-3">
                      {products[1].images?.[0]?.url ? (
                        <img src={products[1].images[0].url} alt={products[1].name} className="max-h-full max-w-full object-contain" />
                      ) : <Package className="h-12 w-12 text-steel-200" />}
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-bold text-steel-900 line-clamp-1">{products[1].name}</div>
                    </div>
                  </motion.div>
                )}

                {/* Floating badges */}
                <motion.div animate={{ y: [0, -6, 0], x: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-[5%] right-[10%] bg-white rounded-xl shadow-lg border border-steel-100 px-4 py-3 z-30">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-steel-900">Quality Assured</div>
                      <div className="text-[9px] text-steel-400">AS Standards</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="absolute bottom-[5%] left-[5%] bg-white rounded-xl shadow-lg border border-steel-100 px-4 py-3 z-30">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-brand-500" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-steel-900">Fast Delivery</div>
                      <div className="text-[9px] text-steel-400">Australia-wide</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════  PRODUCT SHOWCASE CAROUSEL  ══════════════════════ */}
      <ProductShowcase products={products} />

      {/* ═══════════════  CATEGORIES FAN  ═════════════════════════════════ */}
      <CategoriesFan products={products} />

      {/* ═══════════════  HOW IT WORKS  ════════════════════════════════════ */}
      <section aria-labelledby="steps-h" className="py-12 lg:py-16 bg-gradient-to-b from-steel-50/40 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-cyan-50/10 to-transparent pointer-events-none" />
        <div className="container-main relative">
          <Reveal><div className="text-center mb-10">
            <span className="text-[11px] font-extrabold text-brand-600 tracking-[0.3em] uppercase mb-3 block">How It Works</span>
            <h2 id="steps-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">Order in 3 Easy Steps</h2>
            <p className="mt-4 text-steel-400 max-w-lg mx-auto leading-relaxed">Fast, transparent and hassle-free — from configuration to delivery.</p>
          </div></Reveal>
          <div className="grid lg:grid-cols-3 gap-10 relative">
            <div className="hidden lg:block absolute top-16 left-[calc(16.66%+2.5rem)] right-[calc(16.66%+2.5rem)] h-[2px]">
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                transition={{ duration: 1.4, ease, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 origin-left rounded-full" />
            </div>
            {[
              { n: '01', title: 'Browse & Select', desc: 'Explore our range. Filter by category, material, colour or finish.', icon: Package },
              { n: '02', title: 'Configure & Price', desc: 'Pick dimensions, material and colour. See live pricing instantly.', icon: Zap },
              { n: '03', title: 'Order & Deliver', desc: 'Checkout securely. We deliver to your site anywhere in Australia.', icon: Truck },
            ].map((step, i) => (
              <Reveal key={step.n} delay={0.2 + i * 0.15}>
                <div className="group relative text-center">
                  <div className="relative mx-auto mb-8 w-20 h-20">
                    <div className="absolute inset-0 rounded-3xl bg-brand-500/10 group-hover:bg-brand-500/15 scale-100 group-hover:scale-[1.3] transition-all duration-700" />
                    <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-600/25 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-500">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 h-8 w-8 rounded-xl bg-steel-900 text-white text-xs font-black flex items-center justify-center shadow-lg">{step.n}</span>
                  </div>
                  <h3 className="text-xl font-bold text-steel-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-steel-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════  WHY US  ══════════════════════════════════════════ */}
      <section aria-labelledby="why-h" className="py-12 lg:py-16 bg-steel-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(0,116,197,0.07),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_20%_80%,rgba(12,147,231,0.04),transparent)] pointer-events-none" />
        <div className="container-main relative z-10">
          <Reveal><div className="text-center mb-10">
            <span className="text-[11px] font-extrabold text-brand-400 tracking-[0.3em] uppercase mb-3 block">Why Metfold</span>
            <h2 id="why-h" className="text-4xl font-black text-white lg:text-5xl tracking-tight">Built for the Trade</h2>
            <p className="mt-4 text-steel-400 max-w-xl mx-auto">Premium materials, expert knowledge, and a seamless online experience.</p>
          </div></Reveal>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <FadeItem key={f.title}>
                <div className="group relative rounded-[1.75rem] bg-white/[0.03] border border-white/[0.05] p-10 text-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-700 hover:-translate-y-3 overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-brand-500/[0.05] to-transparent" />
                  <div className={`relative mx-auto h-[72px] w-[72px] rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-2xl mb-7 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-600`}>
                    <f.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="relative text-[17px] font-bold text-white mb-3">{f.title}</h3>
                  <p className="relative text-sm text-steel-400/80 leading-relaxed">{f.desc}</p>
                  <div className={`absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r ${f.color} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-600 rounded-b-[1.75rem]`} />
                </div>
              </FadeItem>
            ))}
          </Stagger>
        </div>
      </section>


      {/* ═══════════════  CUSTOMERS  ═══════════════════════════════════════ */}
      <section aria-labelledby="serve-h" className="py-12 lg:py-16 bg-steel-50/40">
        <div className="container-main">
          <Reveal><div className="text-center mb-10">
            <span className="text-[11px] font-extrabold text-brand-600 tracking-[0.3em] uppercase mb-3 block">Our Customers</span>
            <h2 id="serve-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">Built for Every Project</h2>
            <p className="mt-4 text-steel-400 max-w-lg mx-auto leading-relaxed">Whether you're a homeowner renovating or a commercial contractor — we have you covered.</p>
          </div></Reveal>
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HardHat, label: 'Builders & Roofers', desc: 'Trade accounts with exclusive volume pricing' },
              { icon: Home, label: 'Homeowners', desc: 'Quality materials for renovations & new builds' },
              { icon: Building2, label: 'Commercial', desc: 'Large-scale project supply & consulting' },
              { icon: Factory, label: 'Contractors', desc: 'Reliable supply chain & fast turnaround' },
            ].map((c) => (
              <FadeItem key={c.label}>
                <div className="group text-center p-10 rounded-[1.75rem] border border-steel-100/80 bg-white hover:shadow-2xl hover:shadow-brand-100/30 hover:-translate-y-3 transition-all duration-700 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-50/0 group-hover:from-brand-50/40 to-transparent transition-all duration-700" />
                  <div className="relative h-[68px] w-[68px] rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100/80 border border-brand-100/50 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-600">
                    <c.icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <h3 className="relative font-bold text-steel-900 mb-2 text-[15px]">{c.label}</h3>
                  <p className="relative text-xs text-steel-400 leading-relaxed">{c.desc}</p>
                </div>
              </FadeItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══════════════  TRADE CTA  ═══════════════════════════════════════ */}
      <section aria-labelledby="trade-h" className="relative py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800" />
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.12, 0.04] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/3 -right-1/4 h-[800px] w-[800px] rounded-full bg-white/10 blur-[160px]" />
          <motion.div animate={{ scale: [1.1, 1, 1.1], opacity: [0.03, 0.1, 0.03] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute -bottom-1/3 -left-1/4 h-[700px] w-[700px] rounded-full bg-white/10 blur-[140px]" />
        </div>
        <div className="container-main relative z-10 text-center">
          <Reveal><div className="mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 px-5 py-2 text-sm font-bold text-white/90 mb-8">
              <Sparkles className="h-4 w-4" />Exclusive Trade Benefits
            </div>
            <h2 id="trade-h" className="text-4xl font-black text-white lg:text-5xl tracking-tight">Ready to Save More?</h2>
            <p className="mt-5 text-lg text-brand-100/90 leading-relaxed">Register for a free trade account — unlock exclusive pricing, volume discounts and priority delivery.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-9 py-4 text-sm font-black text-brand-600 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
                Apply for Trade Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 px-9 py-4 text-sm font-bold text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                Contact Sales
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Award, label: '10% Trade Discount' }, { icon: Star, label: 'Volume Pricing' },
                { icon: Truck, label: 'Priority Delivery' }, { icon: Shield, label: '30-Day Terms' },
              ].map((b) => (
                <div key={b.label} className="rounded-2xl bg-white/[0.06] border border-white/[0.06] px-4 py-4 hover:bg-white/[0.1] transition-all duration-300">
                  <b.icon className="h-5 w-5 text-brand-200 mx-auto mb-2" /><div className="text-xs font-bold text-white/90">{b.label}</div>
                </div>
              ))}
            </div>
          </div></Reveal>
        </div>
      </section>

      {/* ═══════════════  CONTACT  ═════════════════════════════════════════ */}
      <section aria-label="Contact" className="py-14 bg-steel-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgba(0,116,197,0.04),transparent)] pointer-events-none" />
        <div className="container-main relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Need help choosing the right product?</h2>
              <p className="text-steel-400/70 text-sm mt-1.5">Our expert team is available Monday to Friday for sizing, specs and quotes.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/contact" className="group inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-brand-500 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-brand-600/20">
                <Phone className="h-4 w-4" />Get in Touch
              </Link>
              <Link href="/products" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
