'use client';

import React, { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Tilt3DCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  className?: string;
  glare?: boolean;
}

export default function Tilt3DCard({
  children,
  maxTilt = 8,
  perspective = 1000,
  scale = 1.02,
  className,
  glare = false,
}: Tilt3DCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scaleVal = useMotionValue(1);

  const springConfig = { stiffness: 300, damping: 30 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springScale = useSpring(scaleVal, springConfig);

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useMotionValue(0);
  const springGlareOpacity = useSpring(glareOpacity, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotateX.set((y - 0.5) * -maxTilt * 2);
      rotateY.set((x - 0.5) * maxTilt * 2);
      scaleVal.set(scale);
      if (glare) {
        glareX.set(x * 100);
        glareY.set(y * 100);
        glareOpacity.set(0.15);
      }
    },
    [maxTilt, scale, glare, rotateX, rotateY, scaleVal, glareX, glareY, glareOpacity]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scaleVal.set(1);
    glareOpacity.set(0);
  }, [rotateX, rotateY, scaleVal, glareOpacity]);

  return (
    <div style={{ perspective }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          scale: springScale,
          transformStyle: 'preserve-3d',
        }}
        className={cn('relative', className)}
      >
        {children}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
            style={{
              opacity: springGlareOpacity,
              background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
