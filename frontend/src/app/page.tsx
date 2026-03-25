'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Truck,
  Headphones,
  Award,
  ChevronRight,
  Layers,
  Droplets,
  Wrench,
  PipetteIcon,
  Hammer,
  Package,
  Zap,
} from 'lucide-react';

const categories = [
  { name: 'Roofing', slug: 'roofing', description: 'Roof sheets, accessories & polycarbonate', icon: Layers, color: 'from-blue-500 to-blue-700' },
  { name: 'Cladding', slug: 'cladding', description: 'Wall cladding panels & accessories', icon: Package, color: 'from-steel-600 to-steel-800' },
  { name: 'Fascia & Gutter', slug: 'fascia-gutter', description: 'Guttering, fascia boards & fittings', icon: Wrench, color: 'from-brand-500 to-brand-700' },
  { name: 'Downpipe', slug: 'downpipe', description: 'Downpipes, clips, offsets & pops', icon: PipetteIcon, color: 'from-teal-500 to-teal-700' },
  { name: 'Flashing', slug: 'flashing', description: 'Roof & wall flashing products', icon: Zap, color: 'from-orange-500 to-orange-700' },
  { name: 'Rainwater Goods', slug: 'rainwater-goods', description: 'Rainheads, sumps & dambuster products', icon: Droplets, color: 'from-cyan-500 to-cyan-700' },
  { name: 'Accessories', slug: 'accessories', description: 'Screws, insulation & fixings', icon: Hammer, color: 'from-amber-500 to-amber-700' },
];

const features = [
  { icon: Shield, title: 'Quality Guaranteed', description: 'Premium Australian-standard materials with manufacturer warranties', color: 'bg-blue-500' },
  { icon: Truck, title: 'Fast Delivery', description: 'Reliable shipping across Australia with real-time tracking', color: 'bg-emerald-500' },
  { icon: Headphones, title: 'Expert Support', description: 'Trade-experienced team ready to help with your project', color: 'bg-violet-500' },
  { icon: Award, title: 'Trade Pricing', description: 'Competitive rates and volume discounts for trade accounts', color: 'bg-amber-500' },
];

const stats = [
  { value: 500, suffix: '+', label: 'Products Available' },
  { value: 22, suffix: '', label: 'Colorbond Colours' },
  { value: 15, suffix: '+', label: 'Years Experience' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction' },
];

// Animated counter component
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Shared easing
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Stagger container variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const scaleItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden bg-steel-950">
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-steel-950 via-steel-900 to-brand-950" />
          {/* Animated grid */}
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-0 opacity-[0.04]"
          >
            <div className="h-full w-full" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
          </motion.div>
          {/* Floating gradient orbs */}
          <div className="absolute top-20 right-[20%] h-[500px] w-[500px] rounded-full bg-brand-600/10 blur-[120px] animate-float" />
          <div className="absolute bottom-20 left-[10%] h-[400px] w-[400px] rounded-full bg-brand-400/8 blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/2 right-[5%] h-[300px] w-[300px] rounded-full bg-accent-500/5 blur-[80px] animate-float" />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="container-main relative z-10 py-12 sm:py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: smoothEase }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-sm text-brand-300 mb-6"
              >
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
                Now accepting online orders
              </motion.div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white lg:text-5xl xl:text-6xl">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="block"
                >
                  Industrial Roofing &
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="block mt-1"
                >
                  <span className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent">
                      Sheet Metal
                    </span>
                  </span>{' '}
                  Supplies
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-4 sm:mt-6 text-base sm:text-lg text-steel-300 leading-relaxed max-w-xl"
              >
                Premium Colorbond roofing, cladding, rainwater goods and accessories.
                Configure your products online with{' '}
                <span className="text-white font-medium">live pricing</span> and
                instant quotes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link
                  href="/products"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white overflow-hidden transition-all hover:shadow-lg hover:shadow-brand-600/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 transition-opacity group-hover:opacity-0" />
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative">Browse Products</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/15 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-all"
                >
                  Get a Quote
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side - floating product cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, ease: smoothEase }}
              className="hidden lg:block relative"
            >
              <div className="relative h-[450px]">
                {/* Main card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 left-8 right-8 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">5-Ribsheet</div>
                      <div className="text-steel-400 text-xs">Configurable Product</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-steel-400">Finish</span>
                      <span className="text-white bg-white/10 px-3 py-1 rounded-md text-xs">Colorbond</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-steel-400">Colour</span>
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-[#3B3F3F] border border-white/20" />
                        <span className="text-white text-xs">Monument</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-steel-400">Thickness</span>
                      <span className="text-white bg-white/10 px-3 py-1 rounded-md text-xs">0.42mm</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-steel-400 text-sm">Price</span>
                      <span className="text-xl font-bold text-brand-400">$14.50<span className="text-sm font-normal text-steel-400">/m</span></span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating colour swatches */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-12 left-0 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/10 p-4 shadow-xl"
                >
                  <div className="text-xs text-steel-400 mb-2">Popular Colours</div>
                  <div className="flex gap-2">
                    {[
                      { color: '#3B3F3F', name: 'Monument' },
                      { color: '#D5D1C4', name: 'Surfmist' },
                      { color: '#6E6E6B', name: 'Basalt' },
                      { color: '#5C5D4E', name: 'Woodland Grey' },
                      { color: '#C0B590', name: 'Paperbark' },
                    ].map((c) => (
                      <div key={c.name} className="group/swatch relative">
                        <div
                          className="h-8 w-8 rounded-lg border border-white/20 cursor-pointer transition-transform hover:scale-110"
                          style={{ backgroundColor: c.color }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating stats badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-8 right-4 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/10 px-4 py-3 shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Fast Delivery</div>
                      <div className="text-steel-400 text-xs">Australia Wide</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-20">
        <div className="container-main">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleItemVariants}
                className="relative group rounded-2xl bg-white p-6 shadow-lg shadow-steel-200/50 border border-steel-100 text-center hover:shadow-xl transition-shadow"
              >
                <div className="text-3xl font-bold text-steel-900 lg:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm text-steel-500">{stat.label}</div>
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wider uppercase mb-2">
              Our Range
            </span>
            <h2 className="text-3xl font-bold text-steel-900 lg:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-3 text-steel-500 max-w-lg mx-auto">
              Everything you need for your roofing and cladding project, from premium sheets to finishing accessories
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category) => (
              <motion.div key={category.slug} variants={itemVariants}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="group relative flex items-center gap-5 rounded-2xl bg-white p-6 border border-steel-100 hover:border-steel-200 transition-all duration-300 hover:shadow-lg hover:shadow-steel-100/80 overflow-hidden"
                >
                  {/* Hover gradient bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-steel-50/0 to-brand-50/0 group-hover:from-steel-50/50 group-hover:to-brand-50/30 transition-all duration-500" />

                  <div className={`relative flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <h3 className="font-semibold text-steel-900 group-hover:text-brand-600 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-steel-500 mt-0.5">{category.description}</p>
                  </div>

                  <div className="relative flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-steel-50 group-hover:bg-brand-50 flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="h-4 w-4 text-steel-300 group-hover:text-brand-500 transition-all duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 bg-steel-50">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wider uppercase mb-2">
              Why Choose Us
            </span>
            <h2 className="text-3xl font-bold text-steel-900 lg:text-4xl">
              Built for the Trade
            </h2>
            <p className="mt-3 text-steel-500 max-w-lg mx-auto">
              We understand what matters to builders, roofers, and contractors
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl bg-white p-8 border border-steel-100 text-center transition-shadow duration-300 hover:shadow-xl hover:shadow-steel-200/50"
              >
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-steel-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-steel-500 leading-relaxed">{feature.description}</p>
                <div className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="inline-block text-sm font-semibold text-brand-600 tracking-wider uppercase mb-2">
              Simple Process
            </span>
            <h2 className="text-3xl font-bold text-steel-900 lg:text-4xl">
              How It Works
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          >
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-steel-200 to-transparent" />

            {[
              { step: '01', title: 'Choose Product', description: 'Browse our range and select from roof sheets, cladding, guttering and more' },
              { step: '02', title: 'Configure & Price', description: 'Pick your finish, colour, thickness and length. See live pricing instantly' },
              { step: '03', title: 'Order & Deliver', description: 'Checkout online or request a quote. We cut to length and deliver to your site' },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                className="relative text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/25">
                  <span className="text-xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-steel-900">{item.title}</h3>
                <p className="mt-2 text-sm text-steel-500 max-w-xs mx-auto leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Colour Showcase Banner */}
      <section className="relative py-20 overflow-hidden bg-steel-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(0, 116, 197, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(240, 94, 6, 0.2) 0%, transparent 50%)',
          }} />
        </div>
        <div className="container-main relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white lg:text-4xl">
              Full Colorbond Colour Range
            </h2>
            <p className="mt-3 text-steel-400 max-w-lg mx-auto">
              All 22 standard Colorbond colours plus Matt, Ultra, Galvanised and Zinc finishes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
          >
            {[
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
            ].map((color, i) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.4, ease: smoothEase }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className="group relative"
              >
                <div
                  className="h-10 w-10 rounded-lg border border-white/20 shadow-md cursor-pointer transition-shadow hover:shadow-xl"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-[10px] font-medium text-steel-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none z-20">
                  {color.name}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-center mt-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors"
            >
              Explore all colours and finishes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="container-main relative z-10 text-center"
        >
          <div className="mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-sm text-white/90 mb-6"
            >
              <Award className="h-4 w-4" />
              Exclusive Trade Benefits
            </motion.div>

            <h2 className="text-3xl font-bold text-white lg:text-4xl">
              Are You a Trade Customer?
            </h2>
            <p className="mt-4 text-lg text-brand-100 leading-relaxed">
              Register for a trade account to unlock exclusive pricing, volume discounts,
              and priority delivery for your business.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-brand-600 overflow-hidden transition-all hover:shadow-xl hover:shadow-brand-900/20"
              >
                <span className="absolute inset-0 bg-white transition-opacity group-hover:opacity-0" />
                <span className="absolute inset-0 bg-gradient-to-r from-white to-brand-50 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative">Apply for Trade Account</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all"
              >
                Contact Sales
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-brand-200">
              {['10% Trade Discount', 'Volume Pricing', 'Priority Delivery', '30-Day Terms'].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
