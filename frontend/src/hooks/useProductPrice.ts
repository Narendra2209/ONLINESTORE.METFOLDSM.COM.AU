'use client';

import { useState, useEffect, useRef } from 'react';
import { productApi } from '@/services/product.service';
import { PriceCalculationResponse } from '@/types/product';

interface UsePriceOptions {
  productId: string;
  selectedAttributes: Record<string, string>;
  length?: number;
  quantity: number;
  enabled?: boolean;
}

export function useProductPrice({
  productId,
  selectedAttributes,
  length,
  quantity,
  enabled = true,
}: UsePriceOptions) {
  const [priceData, setPriceData] = useState<PriceCalculationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled || !productId) return;

    // Check if we have enough attributes selected
    const hasAttributes = Object.keys(selectedAttributes).length > 0;
    if (!hasAttributes) {
      setPriceData(null);
      return;
    }

    // Debounce the API call
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setIsCalculating(true);
      setError(null);

      try {
        const data = await productApi.calculatePrice(productId, {
          selectedAttributes,
          length,
          quantity,
        });
        setPriceData(data);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to calculate price';
        setError(message);
        setPriceData(null);
      } finally {
        setIsCalculating(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [productId, JSON.stringify(selectedAttributes), length, quantity, enabled]);

  return { priceData, isCalculating, error };
}
