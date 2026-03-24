'use client';

import React from 'react';
import FlashingConfigurator from '@/components/product/FlashingConfigurator';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Truck, Shield, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FlashingPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container-main py-6">
        <Breadcrumb
          items={[
            { label: 'Flashing', href: '/flashing' },
            { label: 'Custom Flashing Configurator' },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left: Info & Diagram Preview */}
          <div>
            <h1 className="text-3xl font-bold text-steel-900 tracking-tight leading-tight">
              Custom Flashing
            </h1>
            <p className="mt-3 text-steel-600 leading-relaxed">
              Design your custom flashing profile by drawing the cross-section shape.
              Add points to define the bends, enter your required lengths, and we will
              calculate the total girth, number of folds, and price automatically.
            </p>

            <div className="mt-6 rounded-2xl bg-brand-50 border border-brand-100 p-5">
              <h3 className="text-sm font-bold text-brand-800 mb-2">How it works</h3>
              <ol className="space-y-2 text-sm text-brand-700">
                <li className="flex gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-200 text-brand-800 text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>Draw your flashing profile by clicking on the diagram to add bend points</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-200 text-brand-800 text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>Enter the exact length (in mm) for each segment</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-200 text-brand-800 text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>Drag points to adjust angles and shape</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-200 text-brand-800 text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                  <span>Choose your material, gauge, and colour</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-brand-200 text-brand-800 text-[10px] font-bold flex-shrink-0 mt-0.5">5</span>
                  <span>Add to cart — price is calculated automatically</span>
                </li>
              </ol>
            </div>

            <div className="mt-6 rounded-2xl bg-steel-50 border border-steel-100 p-5">
              <h3 className="text-sm font-bold text-steel-800 mb-3">Available Materials</h3>
              <div className="space-y-2 text-sm text-steel-600">
                <div className="flex justify-between"><span>Colorbond</span><span className="font-medium">22 colours</span></div>
                <div className="flex justify-between"><span>Matt Colorbond</span><span className="font-medium">6 colours</span></div>
                <div className="flex justify-between"><span>Ultra Colorbond</span><span className="font-medium">7 colours</span></div>
                <div className="flex justify-between"><span>Galvanised</span><span className="font-medium">1 finish</span></div>
                <div className="flex justify-between"><span>Zinc</span><span className="font-medium">1 finish</span></div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-steel-100 pt-6">
              {[
                { icon: Truck, label: 'Fast Delivery', color: 'text-brand-500' },
                { icon: Shield, label: 'Quality Guaranteed', color: 'text-green-500' },
                { icon: FileText, label: 'Tax Invoice', color: 'text-amber-500' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-steel-50">
                    <item.icon className={cn('h-4 w-4', item.color)} />
                  </div>
                  <span className="text-xs font-medium text-steel-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Configurator */}
          <div>
            <FlashingConfigurator />
          </div>
        </div>
      </div>
    </div>
  );
}
