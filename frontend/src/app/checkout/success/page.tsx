'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container-main py-16 text-center"><p className="text-steel-500">Loading...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="container-main py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />

      <h1 className="mt-6 text-3xl font-bold text-steel-900">Order Confirmed!</h1>

      <p className="mt-3 text-lg text-steel-600">
        Thank you for your order. We&apos;ve received your order and will begin processing it shortly.
      </p>

      {orderNumber && (
        <div className="mt-6 inline-block rounded-lg bg-steel-50 px-6 py-3 border border-steel-100">
          <p className="text-sm text-steel-500">Order Number</p>
          <p className="text-xl font-bold text-steel-900">{orderNumber}</p>
        </div>
      )}

      <p className="mt-6 text-sm text-steel-500">
        A confirmation email has been sent to your email address.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/account/orders">
          <Button leftIcon={<Package className="h-4 w-4" />}>
            View My Orders
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
