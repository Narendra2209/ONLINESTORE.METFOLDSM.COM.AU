'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight, Shield, Truck, Headphones, Award,
  Layers, Droplets, Wrench, PipetteIcon, Hammer, Package, Zap,
  CheckCircle2, Star, Phone, Building2, HardHat,
  Home, Factory, Play, Quote, ArrowUpRight, Sparkles,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════ */

const categories = [
  { name: 'Roofing', slug: 'roofing', desc: 'Premium roof sheets, ridging & polycarbonate', icon: Layers, img: '/images/navicon.png', gradient: 'from-sky-500 to-blue-700' },
  { name: 'Cladding', slug: 'cladding', desc: 'Interlocking wall panels & trims', icon: Package, img: '/images/navicon.png', gradient: 'from-slate-500 to-slate-700' },
  { name: 'Fascia & Gutter', slug: 'fascia-gutter', desc: 'Guttering, fascia boards & accessories', icon: Wrench, img: '/images/navicon.png', gradient: 'from-brand-500 to-brand-700' },
  { name: 'Downpipe', slug: 'downpipe', desc: 'Round & square downpipes, clips & offsets', icon: PipetteIcon, img: '/images/navicon.png', gradient: 'from-teal-500 to-teal-700' },
  { name: 'Flashing', slug: 'flashing', desc: 'Custom roof & wall flashings to spec', icon: Zap, img: '/images/navicon.png', gradient: 'from-orange-500 to-orange-700' },
  { name: 'Rainwater', slug: 'rainwater-goods', desc: 'Rainheads, sumps & overflows', icon: Droplets, img: '/images/navicon.png', gradient: 'from-cyan-500 to-cyan-700' },
  { name: 'Accessories', slug: 'accessories', desc: 'Screws, rivets, insulation & fixings', icon: Hammer, img: '/images/navicon.png', gradient: 'from-amber-500 to-amber-700' },
];

const stats = [
  { value: 500, suffix: '+', label: 'Products' },
  { value: 22, suffix: '', label: 'Colorbond Colours' },
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
];

const features = [
  { icon: Shield, title: 'Quality Guaranteed', desc: 'All products meet Australian Standards with full manufacturer warranties on every order.', color: 'from-blue-500 to-blue-600' },
  { icon: Truck, title: 'Australia-Wide Delivery', desc: 'Reliable shipping with real-time tracking. Metro and regional delivery available nationwide.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Headphones, title: 'Expert Trade Support', desc: 'Our trade-experienced team assists with sizing, product specs and project planning.', color: 'from-violet-500 to-violet-600' },
  { icon: Award, title: 'Trade Pricing', desc: 'Exclusive pricing, volume discounts and 30-day payment terms for registered trade accounts.', color: 'from-amber-500 to-amber-600' },
];

const steps = [
  { n: '01', title: 'Browse & Select', desc: 'Explore our full range. Filter by category, material, colour or finish.', icon: Package },
  { n: '02', title: 'Configure & Price', desc: 'Pick dimensions, material and colour. See live pricing update instantly.', icon: Zap },
  { n: '03', title: 'Order & Deliver', desc: 'Checkout securely and we deliver to your site anywhere in Australia.', icon: Truck },
];

const colours = [
  '#E8E4D8', '#D5D1C4', '#C5BFA8', '#B2B1A4', '#8A8D85', '#A0A19A', '#6E6E6B',
  '#D9CB8E', '#C0B590', '#B5AB8A', '#A09878', '#87826C', '#7A7258', '#5E2028',
  '#8B8680', '#5C5D4E', '#6B7B52', '#2D5A3D', '#565E6B', '#2C3E50', '#1A1A2E', '#3B3F3F',
];
const colourNames = [
  'Dover White', 'Surfmist', 'Southerly', 'Shale Grey', 'Bluegum', 'Windspray', 'Basalt',
  'Classic Cream', 'Paperbark', 'Evening Haze', 'Dune', 'Gully', 'Jasper', 'Manor Red',
  'Wallaby', 'Woodland Grey', 'Pale Eucalypt', 'Cottage Green', 'Ironstone', 'Deep Ocean', 'Night Sky', 'Monument',
];

const testimonials = [
  { name: 'James Mitchell', role: 'Licensed Builder, Melbourne', text: 'Metfold has been our go-to for every roofing job. The online configurator saves us hours on quoting and the quality is consistent every time.', stars: 5 },
  { name: 'Sarah Chen', role: 'Project Manager, Sydney', text: 'Excellent range of Colorbond products. The trade pricing and fast delivery have made a real difference to our project timelines.', stars: 5 },
  { name: 'Dave Kowalski', role: 'Roofing Contractor, Brisbane', text: 'The custom flashing tool is a game changer. I can spec exact profiles and get a price immediately. Will not go anywhere else.', stars: 5 },
];

const ticker = [
  'Premium Colorbond Range', 'Custom Flashings Online', 'Live Pricing',
  'Trade Accounts', 'Australia-Wide Delivery', '500+ Products',
  'Roofing & Cladding', 'Fascia & Guttering', 'Expert Support',
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const inc = value / 50;
    const t = setInterval(() => {
      c += inc;
      if (c >= value) { setCount(value); clearInterval(t); }
      else setCount(Math.floor(c));
    }, 40);
    return () => clearInterval(t);
  }, [inView, value]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* Magnetic button — cursor-follow hover effect */
function MagneticWrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.25);
  }, [x, y]);

  const reset = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Reveal wrapper — scroll triggered */
function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const offset = { up: [0, 60], down: [0, -60], left: [60, 0], right: [-60, 0] }[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offset[0], y: offset[1] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.85, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Stagger container */
function StaggerWrap({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  // Hover colour swatch
  const [hoveredColour, setHoveredColour] = useState<number | null>(null);

  return (
    <>
      {/* ═══════════════  HERO  ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        aria-label="Metfold Sheet Metal — Australia's trusted roofing and cladding supplier"
        className="relative min-h-screen flex items-center overflow-hidden bg-[#060d18]"
      >
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,116,197,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_100%,rgba(0,116,197,0.08),transparent_50%)]" />

          {/* Parallax grid */}
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 opacity-[0.03]">
            <div className="h-[120%] w-full" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)`,
              backgroundSize: '80px 80px',
            }} />
          </motion.div>

          {/* Animated gradient orbs */}
          <motion.div
            animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[5%] right-[10%] h-[700px] w-[700px] rounded-full bg-brand-600/[0.07] blur-[160px]"
          />
          <motion.div
            animate={{ y: [0, 20, 0], x: [0, -20, 0], scale: [1.05, 0.95, 1.05] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute bottom-[0%] left-[0%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.05] blur-[130px]"
          />
          <motion.div
            animate={{ y: [-10, 10, -10], scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-[40%] left-[45%] h-[400px] w-[400px] rounded-full bg-accent-500/[0.04] blur-[120px]"
          />

          {/* Slow diagonal light streaks */}
          <motion.div
            animate={{ x: ['-120%', '250%'] }}
            transition={{ duration: 10, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut' }}
            className="absolute top-0 left-0 w-[20%] h-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent skew-x-[-15deg]"
          />
          <motion.div
            animate={{ x: ['-120%', '250%'] }}
            transition={{ duration: 12, repeat: Infinity, repeatDelay: 10, ease: 'easeInOut', delay: 4 }}
            className="absolute top-0 left-0 w-[10%] h-full bg-gradient-to-r from-transparent via-brand-400/[0.03] to-transparent skew-x-[-20deg]"
          />

          {/* Floating particles — subtle dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -(80 + i * 30), 0],
                x: [0, (i % 2 === 0 ? 40 : -40), 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                delay: i * 1.5,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full bg-brand-400/30"
              style={{
                width: 3 + i,
                height: 3 + i,
                left: `${15 + i * 14}%`,
                top: `${25 + (i % 3) * 20}%`,
              }}
            />
          ))}
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="container-main relative z-10 py-20 lg:py-0">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center min-h-[80vh]">

            {/* ── Left: text (7 cols) ── */}
            <div className="lg:col-span-7 lg:pr-8">
              <Reveal delay={0.1}>
                <div className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] px-5 py-2 text-sm text-brand-300 mb-8">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
                  </span>
                  Online Ordering Now Live — Australia Wide
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <h1 className="text-[2.75rem] sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-black tracking-[-0.03em] leading-[0.95] text-white">
                  Premium{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-brand-300 via-brand-400 to-cyan-300 bg-clip-text text-transparent">
                      Roofing
                    </span>
                    <motion.span
                      animate={{ scaleX: [0, 1] }}
                      transition={{ duration: 0.8, delay: 1.2, ease }}
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-400 to-cyan-400 origin-left rounded-full"
                    />
                  </span>
                  <br />
                  & Sheet Metal
                  <br />
                  <span className="text-steel-400">Supplies</span>
                </h1>
              </Reveal>

              <Reveal delay={0.35}>
                <p className="mt-7 text-lg sm:text-xl text-steel-300/90 leading-relaxed max-w-xl font-light">
                  Configure Colorbond roofing, wall cladding, flashings and rainwater goods
                  online with{' '}
                  <span className="text-white font-medium">live pricing</span>{' '}
                  — delivered to your project site anywhere in Australia.
                </p>
              </Reveal>

              <Reveal delay={0.5}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <MagneticWrap>
                    <Link
                      href="/products"
                      className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-brand-600 px-8 py-4 text-sm font-bold text-white overflow-hidden shadow-xl shadow-brand-700/40 hover:shadow-brand-600/60 transition-all duration-500"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 bg-[length:200%] group-hover:animate-gradient-x transition-all" />
                      <span className="relative flex items-center gap-2.5">
                        Shop All Products
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                      </span>
                    </Link>
                  </MagneticWrap>
                  <MagneticWrap>
                    <Link
                      href="/flashing"
                      className="group inline-flex items-center gap-2.5 rounded-2xl border border-white/[0.12] backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Custom Flashings
                    </Link>
                  </MagneticWrap>
                </div>
              </Reveal>

              <Reveal delay={0.65}>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-steel-400/80">
                  {['No Minimum Order', 'Instant Pricing', 'GST Invoice', 'Trade Accounts'].map((t) => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-400/70" />
                      {t}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* ── Right: floating product cards (5 cols) ── */}
            <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-[420px] h-[520px]">
                {/* Main configurator card */}
                <motion.div
                  animate={{ y: [0, -14, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-0 inset-x-0 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/[0.08] p-7 shadow-2xl shadow-black/30"
                >
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-600/40">
                      <Layers className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">5-Rib Roof Sheet</div>
                      <div className="text-steel-500 text-xs mt-0.5">Configurable Product</div>
                    </div>
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400 tracking-wide uppercase">
                      In Stock
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { l: 'Finish', v: 'Colorbond' },
                      { l: 'Colour', v: 'Monument', swatch: '#3B3F3F' },
                      { l: 'Gauge', v: '0.42mm BMT' },
                      { l: 'Length', v: '3,600 mm' },
                    ].map((r) => (
                      <div key={r.l} className="flex items-center justify-between">
                        <span className="text-steel-500 text-sm">{r.l}</span>
                        <div className="flex items-center gap-2">
                          {r.swatch && <span className="h-4 w-4 rounded-full border border-white/15" style={{ background: r.swatch }} />}
                          <span className="bg-white/[0.07] text-white/90 text-xs font-medium px-3 py-1 rounded-lg">{r.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/[0.06] flex items-end justify-between">
                    <div>
                      <div className="text-steel-500 text-xs mb-0.5">Live Price</div>
                      <div className="text-3xl font-black text-white">
                        $52<span className="text-lg">.20</span>
                        <span className="text-sm font-normal text-steel-500 ml-1">inc GST</span>
                      </div>
                    </div>
                    <div className="bg-brand-600 rounded-xl px-4 py-2 text-xs font-bold text-white">
                      Add to Cart
                    </div>
                  </div>
                </motion.div>

                {/* Floating colour palette */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute bottom-24 -left-6 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] p-4 shadow-xl shadow-black/20"
                >
                  <div className="text-[10px] font-bold text-steel-500 uppercase tracking-wider mb-3">Popular Colours</div>
                  <div className="flex gap-2">
                    {[
                      { c: '#3B3F3F', n: 'Monument' },
                      { c: '#D5D1C4', n: 'Surfmist' },
                      { c: '#6E6E6B', n: 'Basalt' },
                      { c: '#5C5D4E', n: 'Woodland' },
                      { c: '#565E6B', n: 'Ironstone' },
                    ].map((s) => (
                      <div
                        key={s.n}
                        title={s.n}
                        className="h-9 w-9 rounded-xl border border-white/15 shadow-md hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer"
                        style={{ background: s.c }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Delivery badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                  className="absolute bottom-4 -right-2 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.08] px-5 py-3.5 shadow-xl shadow-black/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Fast Delivery</div>
                      <div className="text-steel-500 text-[11px]">All States & Territories</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════  MARQUEE TICKER  ══════════════════════════════════ */}
      <div className="relative bg-white py-5 border-b border-steel-100 overflow-hidden" aria-hidden="true">
        <div className="animate-marquee">
          {[...ticker, ...ticker, ...ticker].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 mx-8 text-sm font-bold text-steel-400 whitespace-nowrap uppercase tracking-widest">
              <span className="h-1 w-1 rounded-full bg-brand-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════  STATS  ═══════════════════════════════════════════ */}
      <section aria-label="Key figures" className="py-20 lg:py-28 bg-white">
        <div className="container-main">
          <StaggerWrap className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s) => (
              <StaggerItem key={s.label}>
                <div className="group relative rounded-3xl bg-white p-8 border border-steel-100 text-center shadow-sm hover:shadow-2xl hover:shadow-brand-100/60 hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-default">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-brand-100/0 group-hover:from-brand-50/70 group-hover:to-transparent transition-all duration-700" />
                  <div className="relative text-5xl font-black text-steel-900 lg:text-6xl tracking-tight">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="relative mt-2 text-sm font-medium text-steel-500 tracking-wide">{s.label}</div>
                  <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-brand-400 to-brand-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl" />
                </div>
              </StaggerItem>
            ))}
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════════════  CATEGORIES  ══════════════════════════════════════ */}
      <section aria-labelledby="cat-h" className="py-20 lg:py-28 bg-steel-50/70">
        <div className="container-main">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-extrabold text-brand-600 tracking-[0.2em] uppercase mb-3">
                Product Range
              </span>
              <h2 id="cat-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">
                Shop by Category
              </h2>
              <p className="mt-4 text-steel-500 max-w-xl mx-auto text-base leading-relaxed">
                Premium Colorbond and Galvanised products for residential and commercial projects — all configurable online with instant pricing.
              </p>
            </div>
          </Reveal>

          <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <StaggerItem key={cat.slug}>
                <Link
                  href={`/categories/${cat.slug}`}
                  aria-label={`Browse ${cat.name}`}
                  className="group relative flex items-center gap-4 rounded-2xl bg-white p-5 border border-steel-100 hover:border-brand-200 transition-all duration-500 hover:shadow-xl hover:shadow-brand-100/60 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Hover bg gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 to-transparent group-hover:from-brand-50/60 transition-all duration-700" />

                  <div className={`relative flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-[-3deg] transition-all duration-500`}>
                    <cat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <h3 className="font-bold text-steel-900 group-hover:text-brand-600 transition-colors duration-300 leading-tight">{cat.name}</h3>
                    <p className="text-xs text-steel-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                  </div>
                  <ArrowUpRight className="relative h-4 w-4 text-steel-300 group-hover:text-brand-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
                </Link>
              </StaggerItem>
            ))}

            {/* View All CTA tile */}
            <StaggerItem>
              <Link
                href="/products"
                className="group flex items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/30 p-5 h-full min-h-[80px] text-brand-600 font-bold text-sm hover:bg-brand-50 hover:border-brand-400 transition-all duration-300"
              >
                View All Products
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </StaggerItem>
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════════════  HOW IT WORKS  ════════════════════════════════════ */}
      <section aria-labelledby="steps-h" className="py-20 lg:py-28 bg-white relative overflow-hidden">
        {/* Subtle bg decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-50/40 to-transparent pointer-events-none" />

        <div className="container-main relative">
          <Reveal>
            <div className="text-center mb-20">
              <span className="inline-block text-xs font-extrabold text-brand-600 tracking-[0.2em] uppercase mb-3">
                How It Works
              </span>
              <h2 id="steps-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">
                Order in 3 Easy Steps
              </h2>
              <p className="mt-4 text-steel-500 max-w-lg mx-auto">
                Our online platform makes ordering roofing and sheet metal products fast, transparent and hassle-free.
              </p>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Connector line — desktop */}
            <div className="hidden lg:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[2px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 origin-left rounded-full"
              />
            </div>

            {steps.map((step, i) => (
              <Reveal key={step.n} delay={0.2 + i * 0.15}>
                <div className="group relative text-center">
                  {/* Icon container */}
                  <div className="relative mx-auto mb-8 w-20 h-20">
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-3xl bg-brand-500/10 group-hover:bg-brand-500/20 scale-100 group-hover:scale-125 transition-all duration-700" />
                    <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-600/30 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-500">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="absolute -top-3 -right-3 h-8 w-8 rounded-xl bg-steel-900 text-white text-xs font-black flex items-center justify-center shadow-lg">
                      {step.n}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-steel-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-steel-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.6}>
            <div className="mt-16 text-center">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-steel-900 px-8 py-4 text-sm font-bold text-white hover:bg-steel-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Configuring Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════  WHY CHOOSE US  ═══════════════════════════════════ */}
      <section aria-labelledby="why-h" className="py-20 lg:py-28 bg-steel-950 relative overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_70%_50%,rgba(0,116,197,0.1),transparent)]" />
        </div>

        <div className="container-main relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-extrabold text-brand-400 tracking-[0.2em] uppercase mb-3">
                Why Metfold
              </span>
              <h2 id="why-h" className="text-4xl font-black text-white lg:text-5xl tracking-tight">
                Built for the Trade
              </h2>
              <p className="mt-4 text-steel-400 max-w-xl mx-auto">
                Premium materials, expert knowledge, and a seamless online ordering experience built for builders, roofers and contractors.
              </p>
            </div>
          </Reveal>

          <StaggerWrap className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group relative rounded-3xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] p-8 text-center hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-500/0 to-brand-500/0 group-hover:from-brand-500/5 group-hover:to-transparent transition-all duration-700" />

                  <div className={`relative mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-xl mb-6 group-hover:scale-110 group-hover:rotate-[-5deg] transition-all duration-500`}>
                    <f.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="relative text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="relative text-sm text-steel-400 leading-relaxed">{f.desc}</p>

                  <div className={`absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r ${f.color} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 rounded-b-3xl`} />
                </div>
              </StaggerItem>
            ))}
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════════════  COLOUR SHOWCASE  ═════════════════════════════════ */}
      <section aria-labelledby="col-h" className="py-20 lg:py-28 bg-white relative overflow-hidden">
        <div className="container-main">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-extrabold text-brand-600 tracking-[0.2em] uppercase mb-3">
                Colour Selection
              </span>
              <h2 id="col-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">
                22 Colorbond Colours
              </h2>
              <p className="mt-4 text-steel-500 max-w-xl mx-auto">
                The full standard Colorbond range plus Matt, Ultra, Galvanised and Zinc finishes — available across all roofing and cladding products.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative max-w-3xl mx-auto">
              {/* Colour grid */}
              <div className="flex flex-wrap justify-center gap-3">
                {colours.map((hex, i) => (
                  <motion.div
                    key={hex}
                    onHoverStart={() => setHoveredColour(i)}
                    onHoverEnd={() => setHoveredColour(null)}
                    whileHover={{ scale: 1.35, zIndex: 30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="relative"
                  >
                    <div
                      className="h-12 w-12 rounded-xl border-2 border-steel-200/50 shadow-md cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                      style={{ background: hex }}
                    />
                    <AnimatePresence>
                      {hoveredColour === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl bg-steel-900 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl z-40"
                        >
                          {colourNames[i]}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-steel-900" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Label row */}
              <div className="flex flex-wrap justify-center gap-3 mt-8 text-xs font-bold text-steel-400 uppercase tracking-widest">
                {['Colorbond', 'Matt Colorbond', 'Ultra', 'Galvanised', 'Zincalume', 'VM Zinc'].map((f) => (
                  <span key={f} className="bg-steel-50 border border-steel-100 px-3 py-1.5 rounded-lg">{f}</span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="text-center mt-12">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors"
              >
                Explore all colours and finishes
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════  TESTIMONIALS  ════════════════════════════════════ */}
      <section aria-labelledby="test-h" className="py-20 lg:py-28 bg-steel-50/70">
        <div className="container-main">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-extrabold text-brand-600 tracking-[0.2em] uppercase mb-3">
                Customer Reviews
              </span>
              <h2 id="test-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">
                Trusted by the Trade
              </h2>
            </div>
          </Reveal>

          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="relative bg-white rounded-3xl border border-steel-100 p-10 lg:p-14 shadow-lg overflow-hidden">
                {/* BG quote mark */}
                <Quote className="absolute top-6 right-8 h-24 w-24 text-steel-100 -rotate-12" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease }}
                    className="relative"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

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

                {/* Dots */}
                <div className="flex justify-center gap-2 mt-10">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        i === activeTestimonial ? 'w-8 bg-brand-600' : 'w-2.5 bg-steel-200 hover:bg-steel-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════  WHO WE SERVE  ════════════════════════════════════ */}
      <section aria-labelledby="serve-h" className="py-20 lg:py-24 bg-white">
        <div className="container-main">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-xs font-extrabold text-brand-600 tracking-[0.2em] uppercase mb-3">
                Our Customers
              </span>
              <h2 id="serve-h" className="text-4xl font-black text-steel-900 lg:text-5xl tracking-tight">
                Built for Every Project
              </h2>
            </div>
          </Reveal>

          <StaggerWrap className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: HardHat, label: 'Builders & Roofers', desc: 'Trade accounts with exclusive volume pricing' },
              { icon: Home, label: 'Homeowners', desc: 'Quality materials for renovations and new builds' },
              { icon: Building2, label: 'Commercial', desc: 'Large-scale supply for commercial projects' },
              { icon: Factory, label: 'Contractors', desc: 'Reliable supply chain and fast turnaround' },
            ].map((c) => (
              <StaggerItem key={c.label}>
                <div className="group text-center p-8 rounded-3xl border border-steel-100 bg-white hover:shadow-xl hover:shadow-brand-100/50 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-50/0 to-brand-50/0 group-hover:from-brand-50/60 group-hover:to-transparent transition-all duration-700" />
                  <div className="relative h-16 w-16 rounded-2xl bg-brand-50 border border-brand-100 mx-auto flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-brand-100 transition-all duration-500">
                    <c.icon className="h-7 w-7 text-brand-600" />
                  </div>
                  <h3 className="relative font-bold text-steel-900 mb-1.5">{c.label}</h3>
                  <p className="relative text-xs text-steel-500 leading-relaxed">{c.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerWrap>
        </div>
      </section>

      {/* ═══════════════  TRADE CTA  ═══════════════════════════════════════ */}
      <section aria-labelledby="trade-h" className="relative py-24 lg:py-32 overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800" />
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/3 -right-1/4 h-[800px] w-[800px] rounded-full bg-white/10 blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.06, 0.14, 0.06] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            className="absolute -bottom-1/3 -left-1/4 h-[700px] w-[700px] rounded-full bg-white/10 blur-[130px]"
          />
        </div>

        <div className="container-main relative z-10 text-center">
          <Reveal>
            <div className="mx-auto max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 px-5 py-2 text-sm font-bold text-white/90 mb-8">
                <Sparkles className="h-4 w-4" />
                Exclusive Trade Benefits
              </div>

              <h2 id="trade-h" className="text-4xl font-black text-white lg:text-5xl tracking-tight">
                Ready to Save More?
              </h2>
              <p className="mt-5 text-lg text-brand-100/90 leading-relaxed">
                Register for a free trade account to unlock exclusive pricing, volume discounts,
                extended payment terms and priority processing on all orders.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <MagneticWrap>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2.5 rounded-2xl bg-white px-9 py-4.5 text-sm font-black text-brand-600 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Apply for Trade Account
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticWrap>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/20 px-9 py-4.5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                >
                  Contact Sales
                </Link>
              </div>

              {/* Benefit cards */}
              <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Award, label: '10% Trade Discount' },
                  { icon: Star, label: 'Volume Pricing' },
                  { icon: Truck, label: 'Priority Delivery' },
                  { icon: Shield, label: '30-Day Terms' },
                ].map((b) => (
                  <div key={b.label} className="rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] px-4 py-4 hover:bg-white/[0.12] transition-all duration-300">
                    <b.icon className="h-5 w-5 text-brand-200 mx-auto mb-2" />
                    <div className="text-xs font-bold text-white/90">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════  CONTACT STRIP  ═══════════════════════════════════ */}
      <section aria-label="Contact us" className="py-12 bg-steel-900">
        <div className="container-main">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Need help choosing the right product?
              </h2>
              <p className="text-steel-400 text-sm mt-1">Our expert team is here Monday to Friday to assist with sizing, specs and quotes.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-500 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Get in Touch
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
