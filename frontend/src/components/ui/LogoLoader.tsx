'use client';

import { cn } from '@/lib/utils';

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullPage?: boolean;
}

export default function LogoLoader({ size = 'md', text, className, fullPage = false }: LogoLoaderProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
  };

  const loader = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        <div className={cn('animate-pulse', sizes[size])}>
          <img src="/images/navicon.png" alt="Loading" className="h-full w-full object-contain" />
        </div>
        <div className={cn(
          'absolute inset-0 rounded-full border-2 border-brand-600/30 border-t-brand-600 animate-spin',
          size === 'sm' ? '-m-1.5' : size === 'md' ? '-m-2' : '-m-3'
        )} />
      </div>
      {text && <p className="text-sm text-steel-500 font-medium animate-pulse">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}
