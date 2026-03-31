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
  Home, Factory, Quote, Sparkles, ArrowUpRight,
} from 'lucide-react';
import { productApi } from '@/services/product.service';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════ */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const categories = [
  { name: 'Roofing', slug: 'roofing', desc: 'Roof sheets, ridging & polycarbonate', icon: Layers, gradient: 'from-sky-500 to-blue-700' },
  { name: 'Cladding', slug: 'cladding', desc: 'Interlocking wall panels & trims', icon: Package, gradient: 'from-slate-500 to-slate-700' },
  { name: 'Fascia & Gutter', slug: 'fascia-gutter', desc: 'Guttering, fascia boards & fittings', icon: Wrench, gradient: 'from-brand-500 to-brand-700' },
  { name: 'Downpipe', slug: 'downpipe', desc: 'Round & square downpipes & fittings', icon: PipetteIcon, gradient: 'from-teal-500 to-teal-700' },
  { name: 'Flashing', slug: 'flashing', desc: 'Custom roof & wall flashings', icon: Zap, gradient: 'from-orange-500 to-orange-700' },
  { name: 'Rainwater', slug: 'rainwater-goods', desc: 'Rainheads, sumps & overflows', icon: Droplets, gradient: 'from-cyan-500 to-cyan-700' },
  { name: 'Accessories', slug: 'accessories', desc: 'Screws, rivets & fixings', icon: Hammer, gradient: 'from-amber-500 to-amber-700' },
];


const stats = [
  { value: 500, suffix: '+', label: 'Products' },
  { value: 22, suffix: '', label: 'Colorbond Colours' },
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

const features = [
  { icon: Shield, title: 'Quality Guaranteed', desc: 'All products meet Australian Standards with manufacturer warranties.', color: 'from-blue-500 to-blue-600' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Reliable shipping with tracking. Metro & regional delivery nationwide.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Headphones, title: 'Expert Support', desc: 'Trade-experienced team for sizing, specs and project planning.', color: 'from-violet-500 to-violet-600' },
  { icon: Award, title: 'Trade Pricing', desc: 'Exclusive rates, volume discounts and 30-day terms for trade.', color: 'from-amber-500 to-amber-600' },
];

const testimonials = [
  { name: 'James Mitchell', role: 'Licensed Builder, Melbourne', text: 'Metfold has been our go-to for every roofing job. The online configurator saves us hours on quoting and the quality is consistent every time.', stars: 5 },
  { name: 'Sarah Chen', role: 'Project Manager, Sydney', text: 'Excellent range of Colorbond products. The trade pricing and fast delivery have made a real difference to our project timelines.', stars: 5 },
  { name: 'Dave Kowalski', role: 'Roofing Contractor, Brisbane', text: 'The custom flashing tool is a game changer. I can spec exact profiles and get a price immediately. Will not go anywhere else.', stars: 5 },
];

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE
   ═══════════════════════════════════════════════════════════════════════ */

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView) return;
    let c = 0; const inc = value / 50;
    const t = setInterval(() => { c += inc; if (c >= value) { setCount(value); clearInterval(t); } else setCount(Math.floor(c)); }, 40);
    return () => clearInterval(t);
  }, [inView, value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

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
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productApi.getProducts({ sortBy: 'best_sellers', limit: 12 }).then((res) => {
      if (Array.isArray(res?.data)) setProducts(res.data.slice(0, 12));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ═══════════════  HERO  ════════════════════════════════════════════ */}
      <section ref={heroRef}
        aria-label="Metfold Sheet Metal — Premium roofing and cladding supplies"
        className="relative overflow-hidden bg-[#050b14]">

        {/* BG */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(0,116,197,0.1),transparent_55%)]" />
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 opacity-[0.018]">
            <div className="h-[140%] w-full" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }} />
          </motion.div>
          <motion.div animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[0%] right-[5%] h-[700px] w-[700px] rounded-full bg-brand-600/[0.04] blur-[200px]" />
          <motion.div animate={{ y: [0, 15, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.025] blur-[160px]" />
          <motion.div animate={{ x: ['-120%', '300%'] }}
            transition={{ duration: 16, repeat: Infinity, repeatDelay: 14, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-[10%] h-full bg-gradient-to-r from-transparent via-white/[0.01] to-transparent skew-x-[-12deg]" />
        </div>

        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Metfold Sheet Metal',
              description: 'Australia\'s trusted supplier of Colorbond roofing, wall cladding, fascia & gutter, downpipes, flashings and rainwater goods. Configure online with live pricing.',
              url: 'https://metfoldsm.com.au',
              image: '/images/logo.png',
              priceRange: '$$',
              address: { '@type': 'PostalAddress', addressCountry: 'AU' },
              geo: { '@type': 'GeoCoordinates', latitude: -33.8688, longitude: 151.2093 },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '07:00', closes: '17:00',
              },
              sameAs: [],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Roofing & Sheet Metal Products',
                itemListElement: categories.map((c) => ({
                  '@type': 'OfferCatalog',
                  name: c.name,
                  description: c.desc,
                })),
              },
            }),
          }}
        />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10">
          {/* Main hero content — centered */}
          <div className="container-main py-24 lg:py-0">
            <div className="flex flex-col items-center justify-center text-center min-h-[75vh] max-w-3xl mx-auto">

              <Reveal delay={0.1}>
                <div className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.06] px-5 py-2 text-[13px] text-brand-300/80 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                  </span>
                  Online Ordering Now Live
                </div>
              </Reveal>

              <Reveal delay={0.25}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[-0.04em] leading-[0.92] text-white">
                  Premium{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-cyan-300 bg-clip-text text-transparent">Roofing</span>
                    <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ duration: 1, delay: 1.5, ease }}
                      className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-400 to-cyan-400 origin-left rounded-full" />
                  </span>
                  <br />
                  <span className="text-white/20">&</span> Sheet Metal
                </h1>
              </Reveal>

              <Reveal delay={0.45}>
                <p className="mt-8 text-lg sm:text-xl text-steel-400/70 leading-relaxed max-w-xl font-light">
                  Configure Colorbond roofing, cladding, flashings and rainwater goods
                  online with <span className="text-white font-medium">instant pricing</span> — delivered anywhere in Australia.
                </p>
              </Reveal>

              <Reveal delay={0.6}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                  <Link href="/products"
                    className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-brand-600 px-9 py-4.5 text-sm font-bold text-white overflow-hidden shadow-xl shadow-brand-700/40 hover:shadow-brand-500/50 transition-all duration-500 hover:-translate-y-0.5">
                    <span className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-[length:200%] group-hover:animate-gradient-x" />
                    <span className="relative flex items-center gap-2.5">Shop All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" /></span>
                  </Link>
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] px-9 py-4.5 text-sm font-semibold text-white/70 hover:bg-white/[0.04] hover:border-white/[0.14] hover:text-white/90 transition-all duration-300">
                    Get a Quote
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.75}>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-steel-500/60">
                  {['No Minimum Order', 'Instant Pricing', 'GST Invoice', 'Trade Accounts'].map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-brand-500/40" />{t}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>

          {/* ── Product Ribbon — flowing below hero text ── */}
          <div className="mt-4 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 1.2 }}
            >
              <div className="container-main mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-brand-500/40" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-400/60">Popular Products</span>
                  </div>
                  <Link href="/products" className="group text-[11px] font-bold text-brand-400/50 hover:text-brand-400 transition-colors flex items-center gap-1.5">
                    View all <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
              <ProductRibbon products={products} />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-20" />
      </section>

      {/* ═══════════════  MARQUEE  ═════════════════════════════════════════ */}
      <div className="bg-white py-5 border-b border-steel-100/60 overflow-hidden" aria-hidden="true">
        <div className="animate-marquee">
          {[...Array(3)].flatMap((_, r) =>
            ['Premium Colorbond', 'Custom Flashings', 'Live Pricing', 'Trade Accounts', 'Australia-Wide Delivery', '500+ Products', 'Roofing & Cladding', 'Expert Support'].map((t, i) => (
              <span key={`${r}-${i}`} className="inline-flex items-center gap-5 mx-10 text-[11px] font-semibold text-steel-300/70 whitespace-nowrap uppercase tracking-[0.35em]">
                <span className="h-[3px] w-[3px] rounded-full bg-brand-400/60" />{t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ═══════════════  STATS  ═══════════════════════════════════════════ */}
      <section aria-label="Key figures" className="py-24 lg:py-32 bg-gradient-to-b from-white to-steel-50/40">
        <div className="container-main">
          <Reveal><div className="text-center mb-14">
            <span className="text-[11px] font-extrabold text-brand-600 tracking-[0.3em] uppercase mb-3 block">Metfold in Numbers</span>
            <h2 className="text-3xl font-black text-steel-900 lg:text-4xl tracking-tight">Trusted Across Australia</h2>
          </div></Reveal>
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <FadeItem key={s.label}>
                <div className="group relative rounded-[1.75rem] bg-white p-10 border border-steel-100/80 text-center shadow-sm hover:shadow-2xl hover:shadow-brand-100/40 hover:-translate-y-3 transition-all duration-700 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 group-hover:from-brand-50/50 to-transparent transition-all duration-700" />
                  <div className="relative text-5xl font-black text-steel-900 lg:text-[3.5rem] tracking-tight leading-none">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="relative mt-3 text-[13px] font-medium text-steel-400 tracking-wide">{s.label}</div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-600 origin-left rounded-b-[1.75rem]" />
                </div>
              </FadeItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══════════════  CATEGORIES  ══════════════════════════════════════ */}
      <section aria-labelledby="cat-h" className="py-24 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-brand-50/20 to-transparent pointer-events-none" />
        <div className="container-main relative">
          <Reveal><div className="text-center mb-16">
            <span className="text-[11px] font-extrabold text-brand-600 tracking-[0.3em] uppercase mb-3 block">Product Range</span>
            <h2 id="cat-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">Shop by Category</h2>
            <p className="mt-4 text-steel-500 max-w-xl mx-auto leading-relaxed">Premium Colorbond and Galvanised products for residential and commercial projects.</p>
          </div></Reveal>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <FadeItem key={cat.slug}>
                <Link href={`/categories/${cat.slug}`}
                  className="group relative flex items-center gap-5 rounded-2xl bg-white p-6 border border-steel-100/80 hover:border-brand-200 transition-all duration-600 hover:shadow-2xl hover:shadow-brand-100/40 hover:-translate-y-2 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 group-hover:from-brand-50/40 to-transparent transition-all duration-700" />
                  <div className={`relative flex-shrink-0 h-[60px] w-[60px] rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-xl shadow-brand-600/10 group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-600`}>
                    <cat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <h3 className="font-bold text-steel-900 group-hover:text-brand-600 transition-colors leading-tight text-[15px]">{cat.name}</h3>
                    <p className="text-xs text-steel-400 mt-1 leading-relaxed">{cat.desc}</p>
                  </div>
                  <ArrowUpRight className="relative h-4 w-4 text-steel-200 group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
                </Link>
              </FadeItem>
            ))}
            <FadeItem>
              <Link href="/products" className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200/60 bg-brand-50/20 p-6 h-full min-h-[90px] text-brand-600 font-bold text-sm hover:bg-brand-50/50 hover:border-brand-400 transition-all duration-300">
                View All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeItem>
          </Stagger>
        </div>
      </section>

      {/* ═══════════════  HOW IT WORKS  ════════════════════════════════════ */}
      <section aria-labelledby="steps-h" className="py-28 lg:py-36 bg-gradient-to-b from-steel-50/40 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-50/15 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-cyan-50/10 to-transparent pointer-events-none" />
        <div className="container-main relative">
          <Reveal><div className="text-center mb-20">
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
      <section aria-labelledby="why-h" className="py-28 lg:py-36 bg-steel-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(0,116,197,0.07),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_20%_80%,rgba(12,147,231,0.04),transparent)] pointer-events-none" />
        <div className="container-main relative z-10">
          <Reveal><div className="text-center mb-16">
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

      {/* ═══════════════  TESTIMONIALS  ════════════════════════════════════ */}
      <section aria-labelledby="test-h" className="py-28 lg:py-36 bg-gradient-to-b from-white to-steel-50/50">
        <div className="container-main">
          <Reveal><div className="text-center mb-16">
            <span className="text-[11px] font-extrabold text-brand-600 tracking-[0.3em] uppercase mb-3 block">Customer Reviews</span>
            <h2 id="test-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">Trusted by the Trade</h2>
            <p className="mt-4 text-steel-400 max-w-lg mx-auto leading-relaxed">Hear what builders, contractors and project managers say about working with us.</p>
          </div></Reveal>
          <div className="max-w-3xl mx-auto"><Reveal>
            <div className="relative bg-white rounded-[2rem] border border-steel-100/80 p-12 lg:p-16 shadow-xl shadow-steel-200/30 overflow-hidden">
              <Quote className="absolute top-8 right-10 h-28 w-28 text-steel-100/40 -rotate-12" />
              <AnimatePresence mode="wait">
                <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease }} className="relative">
                  <div className="flex gap-1 mb-6">{[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}</div>
                  <blockquote className="text-lg lg:text-xl text-steel-700 leading-relaxed font-medium italic">
                    &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                  </blockquote>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-lg shadow-lg">
                      {testimonials[activeTestimonial].name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-steel-900">{testimonials[activeTestimonial].name}</div>
                      <div className="text-sm text-steel-500">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-center gap-2 mt-10">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setActiveTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${i === activeTestimonial ? 'w-8 bg-brand-600' : 'w-2 bg-steel-200 hover:bg-steel-300'}`} />
                ))}
              </div>
            </div>
          </Reveal></div>
        </div>
      </section>

      {/* ═══════════════  CUSTOMERS  ═══════════════════════════════════════ */}
      <section aria-labelledby="serve-h" className="py-28 lg:py-32 bg-steel-50/40">
        <div className="container-main">
          <Reveal><div className="text-center mb-16">
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
              <Link href="/register" className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-9 py-4 text-sm font-black text-brand-600 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300">
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
