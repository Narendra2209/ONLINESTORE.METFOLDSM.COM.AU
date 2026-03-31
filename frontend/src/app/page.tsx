'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Shield, Truck, Headphones, Award, ChevronRight,
  Layers, Droplets, Wrench, PipetteIcon, Hammer, Package, Zap,
  CheckCircle2, Star, MapPin, Clock, Phone, Building2, HardHat,
  Home, Factory,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  {
    name: 'Roofing',
    slug: 'roofing',
    description: 'Roof sheets, accessories & polycarbonate',
    icon: Layers,
    gradient: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
  },
  {
    name: 'Cladding Panels',
    slug: 'cladding',
    description: 'Interlocking wall cladding & accessories',
    icon: Package,
    gradient: 'from-slate-600 to-slate-800',
    bg: 'bg-slate-50',
  },
  {
    name: 'Fascia & Gutter',
    slug: 'fascia-gutter',
    description: 'Guttering, fascia boards & fittings',
    icon: Wrench,
    gradient: 'from-brand-500 to-brand-700',
    bg: 'bg-brand-50',
  },
  {
    name: 'Downpipe',
    slug: 'downpipe',
    description: 'Downpipes, clips, offsets & pops',
    icon: PipetteIcon,
    gradient: 'from-teal-500 to-teal-700',
    bg: 'bg-teal-50',
  },
  {
    name: 'Flashing',
    slug: 'flashing',
    description: 'Custom roof & wall flashing products',
    icon: Zap,
    gradient: 'from-orange-500 to-orange-700',
    bg: 'bg-orange-50',
  },
  {
    name: 'Rainwater Goods',
    slug: 'rainwater-goods',
    description: 'Rainheads, sumps & dambuster products',
    icon: Droplets,
    gradient: 'from-cyan-500 to-cyan-700',
    bg: 'bg-cyan-50',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Screws, insulation & fixings',
    icon: Hammer,
    gradient: 'from-amber-500 to-amber-700',
    bg: 'bg-amber-50',
  },
];

const stats = [
  { value: 500, suffix: '+', label: 'Products Available' },
  { value: 22, suffix: '', label: 'Colorbond Colours' },
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction' },
];

const features = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Premium Australian-standard Colorbond and Galvanised materials backed by manufacturer warranties.',
    color: 'from-blue-500 to-blue-600',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    icon: Truck,
    title: 'Australia-Wide Delivery',
    description: 'Reliable shipping across Australia with real-time order tracking and fast turnaround.',
    color: 'from-emerald-500 to-emerald-600',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    icon: Headphones,
    title: 'Expert Trade Support',
    description: 'Our trade-experienced team is ready to help with specs, sizing, and product selection.',
    color: 'from-violet-500 to-violet-600',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    icon: Award,
    title: 'Trade Pricing',
    description: 'Competitive rates, volume discounts and exclusive pricing tiers for registered trade accounts.',
    color: 'from-amber-500 to-amber-600',
    shadowColor: 'shadow-amber-500/20',
  },
];

const steps = [
  {
    num: '01',
    title: 'Choose Your Product',
    description: 'Browse our full range of roofing, cladding and rainwater products. Filter by material, colour and finish.',
    icon: Package,
  },
  {
    num: '02',
    title: 'Configure & Price',
    description: 'Select your dimensions, material and colour. Live pricing updates instantly as you configure.',
    icon: Zap,
  },
  {
    num: '03',
    title: 'Order & Deliver',
    description: 'Add to cart, checkout securely and we\'ll deliver to your site anywhere in Australia.',
    icon: Truck,
  },
];

const colorbondColours = [
  { hex: '#E8E4D8', name: 'Dover White' },
  { hex: '#D5D1C4', name: 'Surfmist' },
  { hex: '#C5BFA8', name: 'Southerly' },
  { hex: '#B2B1A4', name: 'Shale Grey' },
  { hex: '#8A8D85', name: 'Bluegum' },
  { hex: '#A0A19A', name: 'Windspray' },
  { hex: '#6E6E6B', name: 'Basalt' },
  { hex: '#D9CB8E', name: 'Classic Cream' },
  { hex: '#C0B590', name: 'Paperbark' },
  { hex: '#B5AB8A', name: 'Evening Haze' },
  { hex: '#A09878', name: 'Dune' },
  { hex: '#87826C', name: 'Gully' },
  { hex: '#7A7258', name: 'Jasper' },
  { hex: '#5E2028', name: 'Manor Red' },
  { hex: '#8B8680', name: 'Wallaby' },
  { hex: '#5C5D4E', name: 'Woodland Grey' },
  { hex: '#6B7B52', name: 'Pale Eucalypt' },
  { hex: '#2D5A3D', name: 'Cottage Green' },
  { hex: '#565E6B', name: 'Ironstone' },
  { hex: '#2C3E50', name: 'Deep Ocean' },
  { hex: '#1A1A2E', name: 'Night Sky' },
  { hex: '#3B3F3F', name: 'Monument' },
];

const tickerItems = [
  'Colorbond Roofing', 'Wall Cladding', 'Fascia & Gutter', 'Custom Flashing',
  'Rainwater Goods', 'Trade Pricing', 'Australia-Wide Delivery', '500+ Products',
  '22 Colorbond Colours', 'Live Online Pricing', 'Expert Support', 'Downpipes & Fittings',
];

const customerTypes = [
  { icon: HardHat, label: 'Builders & Roofers', description: 'Trade accounts with volume pricing' },
  { icon: Home, label: 'Homeowners', description: 'Quality materials for renovations' },
  { icon: Building2, label: 'Commercial Projects', description: 'Large-scale supply and consulting' },
  { icon: Factory, label: 'Contractors', description: 'Reliable supply chain partner' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let current = 0;
    const steps = 60;
    const increment = value / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 2000 / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-xs font-bold text-brand-600 tracking-widest uppercase mb-4">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}

// ─── Framer Motion Variants ───────────────────────────────────────────────────

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease, delay: i * 0.1 },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease, delay: i * 0.07 },
  }),
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        aria-label="Hero — Metfold Sheet Metal Supplies"
        className="relative min-h-[95vh] flex items-center overflow-hidden bg-steel-950"
      >
        {/* Animated BG layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-steel-950 via-[#0a1220] to-[#0d1a2e]" />

          {/* Slow parallax grid */}
          <motion.div style={{ y: heroY }} className="absolute inset-0 opacity-[0.035]">
            <div className="h-full w-full" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }} />
          </motion.div>

          {/* Gradient orbs — slow float */}
          <div className="absolute top-[10%] right-[15%] h-[600px] w-[600px] rounded-full bg-brand-600/10 blur-[140px] animate-float" />
          <div className="absolute bottom-[5%] left-[5%] h-[450px] w-[450px] rounded-full bg-brand-400/7 blur-[110px] animate-float-delayed" />
          <div className="absolute top-[45%] right-[2%] h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-[90px] animate-float" />

          {/* Diagonal light streak */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 8, repeat: Infinity, repeatDelay: 6, ease: 'easeInOut' }}
              className="absolute top-0 left-0 w-[30%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-20deg]"
            />
          </div>
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="container-main relative z-10 py-16 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <motion.div
                custom={0} variants={fadeUp} initial="hidden" animate="visible"
                className="inline-flex items-center gap-2 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-sm text-brand-300 mb-6"
              >
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
                Now accepting online orders · Australia Wide
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white lg:text-6xl xl:text-7xl leading-[1.05]">
                <motion.span custom={1} variants={fadeUp} initial="hidden" animate="visible" className="block">
                  Premium Roofing
                </motion.span>
                <motion.span custom={2} variants={fadeUp} initial="hidden" animate="visible" className="block mt-1">
                  &{' '}
                  <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-cyan-400 bg-clip-text text-transparent">
                    Sheet Metal
                  </span>
                </motion.span>
                <motion.span custom={3} variants={fadeUp} initial="hidden" animate="visible" className="block mt-1 text-white/90">
                  Supplies
                </motion.span>
              </h1>

              <motion.p
                custom={4} variants={fadeUp} initial="hidden" animate="visible"
                className="mt-6 text-base sm:text-lg text-steel-300 leading-relaxed max-w-lg"
              >
                Configure Colorbond roofing, cladding, rainwater goods and flashings
                online with <span className="text-white font-semibold">live pricing</span> — delivered to your site anywhere in Australia.
              </motion.p>

              <motion.div
                custom={5} variants={fadeUp} initial="hidden" animate="visible"
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link
                  href="/products"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white overflow-hidden shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 transition-all hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-100 group-hover:opacity-0 transition-opacity" />
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">Shop All Products</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-xl border border-white/15 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/30 transition-all"
                >
                  Get a Quote
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* Trust row */}
              <motion.div
                custom={6} variants={fadeUp} initial="hidden" animate="visible"
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-steel-400"
              >
                {['No Minimum Order', 'Instant Online Pricing', 'GST Invoice Included', 'Trade Accounts Welcome'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-400 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — floating UI cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1, ease }}
              className="hidden lg:block relative h-[500px]"
            >
              {/* Main product configurator card */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-6 left-4 right-4 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">5-Rib Roof Sheet</div>
                    <div className="text-steel-400 text-xs">Configurable Product</div>
                  </div>
                  <div className="ml-auto">
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">In Stock</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Finish', value: 'Colorbond®' },
                    { label: 'Colour', value: 'Monument', swatch: '#3B3F3F' },
                    { label: 'Thickness', value: '0.42mm' },
                    { label: 'Length', value: '3,600 mm' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-steel-400">{row.label}</span>
                      <div className="flex items-center gap-2">
                        {row.swatch && <span className="h-4 w-4 rounded-full border border-white/20" style={{ background: row.swatch }} />}
                        <span className="text-white bg-white/10 px-3 py-0.5 rounded-lg text-xs font-medium">{row.value}</span>
                      </div>
                    </div>
                  ))}
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-steel-400 text-sm">Live Price</span>
                    <span className="text-2xl font-extrabold text-brand-400">
                      $52.20
                      <span className="text-sm font-normal text-steel-400 ml-1">inc GST</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Colour swatches badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="absolute bottom-20 left-0 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 p-4 shadow-xl"
              >
                <div className="text-xs font-semibold text-steel-400 mb-2.5">Popular Colours</div>
                <div className="flex gap-2">
                  {[
                    { c: '#3B3F3F', n: 'Monument' },
                    { c: '#D5D1C4', n: 'Surfmist' },
                    { c: '#6E6E6B', n: 'Basalt' },
                    { c: '#5C5D4E', n: 'Woodland Grey' },
                    { c: '#565E6B', n: 'Ironstone' },
                  ].map((s) => (
                    <div key={s.n} title={s.n}
                      className="h-9 w-9 rounded-xl border border-white/20 shadow-md cursor-pointer hover:scale-110 transition-transform"
                      style={{ background: s.c }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Delivery badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute bottom-8 right-2 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 px-4 py-3 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Fast Delivery</div>
                    <div className="text-steel-400 text-xs">Australia Wide</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ── Marquee Ticker ────────────────────────────────────────────────── */}
      <div className="bg-brand-600 py-3 overflow-hidden" aria-hidden="true">
        <div className="animate-marquee">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-6 text-sm font-semibold text-white whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="stats-heading" className="py-16 lg:py-24 bg-white">
        <div className="container-main">
          <h2 id="stats-heading" className="sr-only">Metfold by the numbers</h2>
          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i} variants={scaleIn}
                className="relative group rounded-2xl bg-gradient-to-br from-steel-50 to-white p-7 border border-steel-100 text-center shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-brand-100/0 group-hover:from-brand-50/60 group-hover:to-brand-50/20 transition-all duration-500" />
                <div className="relative text-4xl font-extrabold text-steel-900 lg:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="relative mt-1.5 text-sm font-medium text-steel-500">{stat.label}</div>
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section aria-labelledby="categories-heading" className="py-20 lg:py-28 bg-steel-50">
        <div className="container-main">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="text-center mb-14"
          >
            <SectionLabel>Our Product Range</SectionLabel>
            <h2 id="categories-heading" className="text-3xl font-extrabold text-steel-900 lg:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-3 text-steel-500 max-w-xl mx-auto text-base leading-relaxed">
              From premium Colorbond roof sheets to custom flashings — everything you need for residential
              and commercial roofing projects, configured online with live pricing.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {categories.map((cat, i) => (
              <motion.div key={cat.slug} custom={i} variants={fadeUp}>
                <Link
                  href={`/categories/${cat.slug}`}
                  aria-label={`Browse ${cat.name}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white p-5 border border-steel-100 hover:border-brand-200 transition-all duration-300 hover:shadow-xl hover:shadow-brand-100/60 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`relative flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                    <cat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-steel-900 group-hover:text-brand-600 transition-colors leading-tight">{cat.name}</h3>
                    <p className="text-xs text-steel-500 mt-0.5 leading-relaxed">{cat.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-steel-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                </Link>
              </motion.div>
            ))}

            {/* View all tile */}
            <motion.div custom={categories.length} variants={fadeUp}>
              <Link
                href="/products"
                className="group flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-5 h-full min-h-[80px] text-brand-600 font-semibold text-sm hover:bg-brand-50 hover:border-brand-400 transition-all duration-300"
              >
                <span>View All Products</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section aria-labelledby="process-heading" className="py-20 lg:py-28 bg-white">
        <div className="container-main">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="text-center mb-16"
          >
            <SectionLabel>Simple Process</SectionLabel>
            <h2 id="process-heading" className="text-3xl font-extrabold text-steel-900 lg:text-4xl">
              Order in 3 Easy Steps
            </h2>
            <p className="mt-3 text-steel-500 max-w-lg mx-auto">
              From configuration to delivery — our online platform makes ordering roofing and sheet metal simple and transparent.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative"
          >
            {/* Connector line */}
            <div className="hidden lg:block absolute top-14 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i} variants={fadeUp}
                className="relative z-10 group flex flex-col items-center text-center rounded-3xl bg-white border border-steel-100 p-8 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Step number bubble */}
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-600/30 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-steel-900 text-white text-[10px] font-extrabold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-steel-900 mb-2">{step.title}</h3>
                <p className="text-sm text-steel-500 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Who We Serve ──────────────────────────────────────────────────── */}
      <section aria-labelledby="customers-heading" className="py-16 lg:py-24 bg-steel-950">
        <div className="container-main">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="text-center mb-14"
          >
            <SectionLabel>Who We Serve</SectionLabel>
            <h2 id="customers-heading" className="text-3xl font-extrabold text-white lg:text-4xl">
              Built for Every Project
            </h2>
            <p className="mt-3 text-steel-400 max-w-lg mx-auto">
              Whether you're a homeowner renovating or a commercial contractor, we have the right product and pricing tier for you.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {customerTypes.map((ct, i) => (
              <motion.div
                key={ct.label}
                custom={i} variants={scaleIn}
                className="group rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 p-6 text-center hover:bg-white/[0.1] hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-800/20 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ct.icon className="h-6 w-6 text-brand-400" />
                </div>
                <h3 className="font-bold text-white text-sm">{ct.label}</h3>
                <p className="text-xs text-steel-400 mt-1 leading-relaxed">{ct.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section aria-labelledby="features-heading" className="py-20 lg:py-28 bg-white">
        <div className="container-main">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="text-center mb-16"
          >
            <SectionLabel>Why Metfold</SectionLabel>
            <h2 id="features-heading" className="text-3xl font-extrabold text-steel-900 lg:text-4xl">
              The Smart Choice for Trade & Retail
            </h2>
            <p className="mt-3 text-steel-500 max-w-lg mx-auto">
              We combine premium product quality with the convenience of online configuration, live pricing, and reliable delivery.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i} variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`group relative rounded-3xl bg-white p-8 border border-steel-100 text-center hover:shadow-2xl ${f.shadowColor} transition-all duration-500 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-steel-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} shadow-xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="relative text-base font-bold text-steel-900 mb-2">{f.title}</h3>
                <p className="relative text-sm text-steel-500 leading-relaxed">{f.description}</p>
                <div className={`absolute inset-x-0 bottom-0 h-1 rounded-b-3xl bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-all duration-300`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Colour Showcase ───────────────────────────────────────────────── */}
      <section aria-labelledby="colours-heading" className="relative py-20 lg:py-28 overflow-hidden bg-steel-950">
        {/* Gradient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 60% 50% at 20% 60%, rgba(0,116,197,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 30%, rgba(240,94,6,0.15) 0%, transparent 60%)',
          }} />
        </div>

        <div className="container-main relative z-10">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="text-center mb-12"
          >
            <SectionLabel>Finish Selection</SectionLabel>
            <h2 id="colours-heading" className="text-3xl font-extrabold text-white lg:text-4xl">
              Full Colorbond® Colour Range
            </h2>
            <p className="mt-3 text-steel-400 max-w-lg mx-auto">
              All 22 standard Colorbond colours plus Matt, Ultra, Galvanised and Zinc finishes — available across our entire roofing and cladding range.
            </p>
          </motion.div>

          <motion.div
            variants={stagger} initial="hidden" whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
          >
            {colorbondColours.map((color, i) => (
              <motion.div
                key={color.name}
                custom={i} variants={scaleIn}
                whileHover={{ scale: 1.25, zIndex: 20 }}
                className="group relative"
              >
                <div
                  className="h-11 w-11 rounded-xl border border-white/20 shadow-lg cursor-pointer hover:shadow-2xl transition-shadow"
                  style={{ background: color.hex }}
                  title={color.name}
                />
                <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[10px] font-semibold text-steel-800 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl pointer-events-none z-30">
                  {color.name}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-white" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible"
            viewport={{ once: true }}
            className="text-center mt-12 flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-600/30"
            >
              Explore All Colours & Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Trade CTA ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="trade-heading" className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/4 -right-1/4 h-[700px] w-[700px] rounded-full bg-white/10 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-white/10 blur-[100px]"
          />
        </div>

        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible"
          viewport={{ once: true }}
          className="container-main relative z-10 text-center"
        >
          <div className="mx-auto max-w-2xl">
            <motion.div
              custom={1} variants={fadeUp} initial="hidden" whileInView="visible"
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm font-semibold text-white/90 mb-6"
            >
              <Award className="h-4 w-4" />
              Exclusive Trade Benefits
            </motion.div>

            <h2 id="trade-heading" className="text-3xl font-extrabold text-white lg:text-4xl">
              Are You a Trade Customer?
            </h2>
            <p className="mt-4 text-lg text-brand-100 leading-relaxed">
              Register for a free trade account to unlock exclusive pricing, volume discounts,
              extended payment terms and priority delivery across all orders.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-brand-600 hover:shadow-2xl hover:shadow-brand-900/20 transition-all hover:-translate-y-0.5"
              >
                Apply for Trade Account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 hover:border-white/50 transition-all"
              >
                Contact Our Sales Team
              </Link>
            </div>

            {/* Trade benefits */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '10% Trade Discount', icon: Award },
                { label: 'Volume Pricing', icon: Star },
                { label: 'Priority Delivery', icon: Truck },
                { label: '30-Day Payment Terms', icon: Clock },
              ].map((b) => (
                <div key={b.label} className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 text-center">
                  <b.icon className="h-5 w-5 text-brand-200 mx-auto mb-1.5" />
                  <div className="text-xs font-semibold text-white">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Contact Strip ─────────────────────────────────────────────────── */}
      <section aria-labelledby="contact-strip-heading" className="py-10 bg-steel-900">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 id="contact-strip-heading" className="text-lg font-bold text-white">
                Need help with your order?
              </h2>
              <p className="text-steel-400 text-sm mt-0.5">Our expert team is here to assist with product selection, sizing and quotes.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-500 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                View Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
