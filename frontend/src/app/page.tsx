'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Zap,
  Wrench,
  HelpCircle,
  Truck,
  MousePointer,
  Ruler,
  Calculator,
  ShoppingCart,
  Layers,
} from 'lucide-react';
import Tilt3DCard from '@/components/ui/Tilt3DCard';

// Smooth easing
const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Slow motion entrance variants
const slowReveal = {
  hidden: { opacity: 0, y: 60 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, delay, ease: smoothEase },
  }),
};

const slowScale = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 1.0, delay, ease: smoothEase },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: smoothEase },
  },
};

// Popular products data
const popularProducts = [
  { name: 'Flashings', slug: 'flashing', icon: '⚡', gradient: 'from-steel-700 to-steel-800' },
  { name: 'Downpipes', slug: 'downpipe', icon: '🔧', gradient: 'from-steel-600 to-steel-700' },
  { name: 'Rainheads', slug: 'rainwater-goods', icon: '💧', gradient: 'from-steel-700 to-steel-800' },
  { name: 'Laveline', slug: 'fascia-gutter', icon: '📐', gradient: 'from-steel-600 to-steel-700' },
  { name: 'Fascia & Gutter Accessories', slug: 'fascia-gutter', icon: '🔩', gradient: 'from-steel-700 to-steel-800' },
  { name: 'Ridge Capping', slug: 'roofing', icon: '🏠', gradient: 'from-steel-600 to-steel-700' },
];

// How it works steps
const howItWorks = [
  { icon: MousePointer, title: 'Choose', description: 'Select your product type and style' },
  { icon: Ruler, title: 'Dimensions', description: 'Enter your exact measurements' },
  { icon: Calculator, title: 'Get Instant Quote', description: 'See live pricing immediately' },
  { icon: ShoppingCart, title: 'Order', description: 'Add to cart and checkout' },
];

// Why choose us features
const whyChoose = [
  { icon: Zap, title: 'Same-day manufacturing', color: 'bg-amber-500', iconColor: 'text-white' },
  { icon: Wrench, title: 'Custom flashings made to size.', color: 'bg-brand-600', iconColor: 'text-white' },
  { icon: HelpCircle, title: 'Live pricing – no waiting for quotes', color: 'bg-rose-500', iconColor: 'text-white' },
  { icon: Truck, title: 'Fast delivery across Australia', color: 'bg-brand-500', iconColor: 'text-white' },
];

// Floating particle component
function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/20"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{
        y: [0, -30, 0],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 4 + Math.random() * 3,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// 3D Metal Sheet SVG component
function MetalSheetRender() {
  return (
    <motion.div
      className="relative w-full h-full"
      animate={{ rotateY: [0, 5, 0, -5, 0], rotateX: [0, -3, 0, 3, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
    >
      <svg viewBox="0 0 400 250" className="w-full h-auto drop-shadow-2xl" style={{ filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.4))' }}>
        <defs>
          <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="30%" stopColor="#2d3748" />
            <stop offset="60%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>
          <linearGradient id="ribHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#718096" />
            <stop offset="50%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#2d3748" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* Main sheet body */}
        <path d="M 30 60 L 370 40 L 380 200 L 20 220 Z" fill="url(#metalGrad)" filter="url(#shadow)" />
        {/* Ribs */}
        {[0, 1, 2, 3, 4].map((i) => {
          const x1 = 65 + i * 65;
          const x2 = x1 + 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${56 - i * 0.5} L ${x1 - 3} ${56 - i * 0.5 - 12} L ${x2 + 3} ${56 - i * 0.5 - 12} L ${x2} ${56 - i * 0.5} M ${x1 - 1} ${216 + i * 0.5} L ${x1 - 4} ${216 + i * 0.5 - 12} L ${x2 + 4} ${216 + i * 0.5 - 12} L ${x2 + 1} ${216 + i * 0.5}`}
                fill="url(#ribHighlight)"
              />
              <line
                x1={x1}
                y1={56 - i * 0.5}
                x2={x1 - 1}
                y2={216 + i * 0.5}
                stroke="#718096"
                strokeWidth="1.5"
                opacity="0.5"
              />
            </g>
          );
        })}
        {/* Edge highlight */}
        <path d="M 30 60 L 370 40" stroke="#a0aec0" strokeWidth="1" opacity="0.6" fill="none" />
        <path d="M 20 220 L 380 200" stroke="#1a202c" strokeWidth="1" opacity="0.4" fill="none" />
      </svg>
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <section ref={heroRef} className="relative min-h-[100vh] flex items-center overflow-hidden bg-steel-950">
        {/* Aurora background */}
        <div className="absolute inset-0 aurora-bg" />

        {/* Animated light streaks */}
        <div className="light-streak" />

        {/* Glow orbs */}
        <div className="hero-glow absolute top-[10%] right-[15%] w-[500px] h-[500px] bg-brand-600/15" />
        <div className="hero-glow absolute bottom-[20%] left-[5%] w-[400px] h-[400px] bg-brand-400/10" style={{ animationDelay: '2s' }} />
        <div className="hero-glow absolute top-[50%] right-[30%] w-[300px] h-[300px] bg-accent-500/8" style={{ animationDelay: '4s' }} />

        {/* Animated grid overlay */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }} />
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingParticle delay={0} x="10%" y="20%" size={3} />
          <FloatingParticle delay={1.5} x="25%" y="60%" size={2} />
          <FloatingParticle delay={0.8} x="45%" y="30%" size={4} />
          <FloatingParticle delay={2.2} x="70%" y="70%" size={2} />
          <FloatingParticle delay={3} x="85%" y="15%" size={3} />
          <FloatingParticle delay={1} x="60%" y="50%" size={2} />
          <FloatingParticle delay={2.8} x="35%" y="80%" size={3} />
          <FloatingParticle delay={0.5} x="90%" y="45%" size={2} />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="container-main relative z-10 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div>
              <motion.div
                variants={slowReveal}
                initial="hidden"
                animate="visible"
                custom={0.1}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 text-sm text-brand-300 mb-8"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Now accepting online orders
              </motion.div>

              <motion.h1
                variants={slowReveal}
                initial="hidden"
                animate="visible"
                custom={0.3}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.1]"
              >
                Fast Online Ordering for{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400 bg-clip-text text-transparent">
                    Roofing & Sheet Metal
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-400 to-accent-400 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.2, duration: 0.8, ease: smoothEase }}
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={slowReveal}
                initial="hidden"
                animate="visible"
                custom={0.5}
                className="mt-6 text-lg sm:text-xl text-steel-300 leading-relaxed"
              >
                Live Pricing &bull; Instant Quotes &bull; Australia-Wide Delivery
              </motion.p>

              <motion.div
                variants={slowReveal}
                initial="hidden"
                animate="visible"
                custom={0.7}
                className="mt-10 flex flex-wrap gap-4"
              >
                <Link
                  href="/products"
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-brand-600/30 btn-shine"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 transition-opacity group-hover:opacity-0" />
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="relative">Browse Products</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-xl border-2 border-white/15 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-all duration-300"
                >
                  Get a Quote
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </Link>
              </motion.div>
            </div>

            {/* Right: 3D Product Card + Metal Sheet */}
            <motion.div
              variants={slowScale}
              initial="hidden"
              animate="visible"
              custom={0.6}
              className="hidden lg:block relative"
            >
              <div className="relative h-[500px]" style={{ perspective: 1200 }}>
                {/* 3D Metal sheet render behind card */}
                <motion.div
                  className="absolute -top-4 -left-12 w-[350px] h-[220px] opacity-60"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MetalSheetRender />
                </motion.div>

                {/* Main configurator card with Tilt3D */}
                <div className="absolute top-6 right-0 w-[320px]">
                  <Tilt3DCard maxTilt={6} glare>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="rounded-2xl bg-white/[0.1] backdrop-blur-xl border border-white/15 p-6 shadow-2xl"
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
                          <Layers className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-base">5-Ribsheet</div>
                          <div className="text-steel-400 text-xs">Configurable Product</div>
                        </div>
                      </div>
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-steel-400">Finish</span>
                          <span className="text-white bg-white/10 px-4 py-1.5 rounded-lg text-xs font-medium">Colorbond</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-steel-400">Colour</span>
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-[#3B3F3F] border-2 border-white/20 shadow-inner" />
                            <span className="text-white text-xs font-medium">Monument</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-steel-400">Thickness</span>
                          <span className="text-white bg-white/10 px-4 py-1.5 rounded-lg text-xs font-medium">0.42mm</span>
                        </div>
                        <div className="h-px bg-white/10 my-3" />
                        <div className="flex items-center justify-between">
                          <span className="text-steel-400 text-sm">Price</span>
                          <span className="text-2xl font-bold text-brand-400">
                            $14.50<span className="text-sm font-normal text-steel-400">/m</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Tilt3DCard>
                </div>

                {/* Floating colour swatches card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                  className="absolute bottom-16 left-4 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/10 p-4 shadow-xl"
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
                          className="h-8 w-8 rounded-lg border border-white/20 cursor-pointer transition-transform duration-200 hover:scale-110"
                          style={{ backgroundColor: c.color }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Floating delivery badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-4 right-8 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/10 px-4 py-3 shadow-xl"
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
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ====== WHY CHOOSE + POPULAR PRODUCTS ====== */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Why Customers Choose Metfold */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: smoothEase }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-steel-900 mb-8">
                Why Customers Choose Metfold
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {whyChoose.map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.7, ease: smoothEase }}
                    whileHover={{ y: -4, transition: { duration: 0.3 } }}
                    className="group rounded-2xl bg-steel-50 border border-steel-100 p-5 hover:shadow-lg hover:border-steel-200 transition-shadow duration-300"
                  >
                    <div className={`h-10 w-10 rounded-xl ${item.color} flex items-center justify-center mb-3 shadow-md transition-transform duration-300 group-hover:scale-110`}>
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <p className="text-sm font-semibold text-steel-800 leading-snug">{item.title}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Popular Products */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease: smoothEase }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-steel-900 mb-8">
                Popular Products
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {popularProducts.map((product, i) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: smoothEase }}
                  >
                    <Link
                      href={`/categories/${product.slug}`}
                      className="group block rounded-2xl bg-steel-50 border border-steel-100 p-4 text-center hover:shadow-lg hover:border-steel-200 transition-all duration-300"
                    >
                      <div className={`mx-auto h-20 w-20 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center mb-3 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <span className="text-2xl">{product.icon}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-steel-700 group-hover:text-brand-600 transition-colors duration-300 leading-tight">
                        {product.name}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="py-16 lg:py-24 bg-steel-50">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: smoothEase }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-steel-900">How It Works</h2>
            <p className="mt-3 text-steel-500 max-w-lg mx-auto">
              Order custom roofing and sheet metal products in four simple steps
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8"
          >
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                className="group relative text-center"
              >
                <div className="mx-auto h-20 w-20 rounded-2xl bg-white border border-steel-100 shadow-lg flex items-center justify-center mb-4 transition-all duration-500 group-hover:shadow-xl group-hover:border-brand-200 group-hover:bg-brand-50">
                  <step.icon className="h-8 w-8 text-steel-400 group-hover:text-brand-600 transition-colors duration-300" />
                </div>
                <div className="absolute -top-2 -right-2 sm:right-0 h-7 w-7 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-steel-900 mb-1">{step.title}</h3>
                <p className="text-xs text-steel-500 leading-relaxed">{step.description}</p>

                {/* Connector line */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden sm:block absolute top-10 -right-4 lg:-right-5 w-8 lg:w-10">
                    <div className="h-px bg-steel-200 w-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-steel-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== COLOUR RANGE ====== */}
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
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-white lg:text-4xl">Full Colorbond Colour Range</h2>
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

      {/* ====== CTA SECTION ====== */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: smoothEase }}
          className="container-main relative z-10 text-center"
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold text-white lg:text-4xl">Are You a Trade Customer?</h2>
            <p className="mt-4 text-lg text-brand-100 leading-relaxed">
              Register for a trade account to unlock exclusive pricing, volume discounts,
              and priority delivery for your business.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-brand-600 overflow-hidden transition-all hover:shadow-xl hover:shadow-brand-900/20 btn-shine"
              >
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
