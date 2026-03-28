'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/types/product';
import { productApi } from '@/services/product.service';
import { useAuthStore } from '@/store/authStore';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { Package, FileText, Truck, Shield, ZoomIn, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const isAdmin = user?.role && ['super_admin', 'admin', 'manager', 'sales_staff', 'inventory_staff', 'content_staff'].includes(user.role);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;
    try {
      setUploading(true);
      const result = await productApi.uploadProductImage(product._id, file);
      if (result?.images) {
        setProduct({ ...product, images: result.images });
        setSelectedImage(result.images.length - 1);
      }
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productApi.getProductBySlug(slug);
        setProduct(data);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-main py-8 animate-fade-in-up">
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="mt-4 flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full mt-4" />
            <Skeleton className="h-48 w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-main py-20 text-center animate-fade-in-up">
        <Package className="mx-auto h-16 w-16 text-steel-300" />
        <h1 className="mt-4 text-2xl font-bold text-steel-900">Product not found</h1>
        <p className="mt-2 text-steel-500">The product you are looking for does not exist.</p>
      </div>
    );
  }

  const activeImage = product.images?.[selectedImage] || product.images?.find((i) => i.isDefault) || product.images?.[0];

  return (
    <div className="bg-white animate-fade-in-up">
      <div className="container-main py-4 sm:py-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            ...(product.category
              ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        {/* Product Layout */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-6 sm:gap-8 lg:gap-10 lg:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="group relative aspect-square rounded-2xl bg-steel-50 border border-steel-100 flex items-center justify-center overflow-hidden">
              {activeImage?.url ? (
                <>
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt || product.name}
                    className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-white/80 backdrop-blur-sm p-2 shadow-sm hover:bg-white transition-colors"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 text-steel-600 animate-spin" /> : <Upload className="h-4 w-4 text-steel-600" />}
                      </button>
                    )}
                    <div className="rounded-full bg-white/80 backdrop-blur-sm p-2 shadow-sm">
                      <ZoomIn className="h-4 w-4 text-steel-600" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-steel-300">
                  <Package className="h-24 w-24" />
                  {isAdmin && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Image
                    </button>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {/* Thumbnail strip */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'h-18 w-18 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all duration-200',
                      selectedImage === i
                        ? 'border-brand-600 ring-2 ring-brand-200 shadow-md'
                        : 'border-steel-200 hover:border-steel-300 opacity-70 hover:opacity-100'
                    )}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `Image ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info & Configurator */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.category && (
                <Badge variant="info">{product.category.name}</Badge>
              )}
              {product.isFeatured && <Badge variant="warning">Featured</Badge>}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-steel-900 lg:text-3xl tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-4 text-steel-600 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            <div className="mt-6 border-t border-steel-100 pt-6">
              <ProductConfigurator product={product} />
            </div>

            {/* Trust signals */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-steel-100 pt-4 sm:pt-6">
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
        </div>

        {/* Related Products / Accessories */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-14 border-t border-steel-100 pt-8">
            <h2 className="text-lg sm:text-xl font-bold text-steel-900 mb-5">Related Products & Accessories</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {product.relatedProducts.map((rp: any) => {
                const img = rp.images?.find((i: any) => i.isDefault) || rp.images?.[0];
                return (
                  <Link
                    key={rp._id}
                    href={`/products/${rp.slug}`}
                    className="group flex flex-col rounded-xl border border-steel-100 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-200 transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-steel-50 overflow-hidden">
                      {img?.url ? (
                        <img src={img.url} alt={img.alt || rp.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-10 w-10 text-steel-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      {rp.category && (
                        <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-steel-400 mb-0.5">{rp.category.name}</span>
                      )}
                      <h3 className="text-sm sm:text-base font-bold text-steel-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                        {rp.name}
                      </h3>
                      {rp.price && (
                        <p className="mt-2 text-sm font-bold text-steel-900">
                          ${rp.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs: Description, Specifications */}
        <div className="mt-8 sm:mt-14 border-t border-steel-100">
          <div className="flex gap-0">
            {['description', 'specifications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'relative px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'text-brand-600'
                    : 'text-steel-500 hover:text-steel-700'
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className={cn(
                  'absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full transition-transform duration-200',
                  activeTab === tab ? 'scale-x-100' : 'scale-x-0'
                )} />
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div
                className="prose prose-steel max-w-none prose-headings:font-semibold prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || '<p class="text-steel-500 italic">No description available.</p>' }}
              />
            )}

            {activeTab === 'specifications' && (
              <div className="max-w-lg">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], i) => (
                        <tr key={key} className={cn(
                          'border-b border-steel-100',
                          i % 2 === 0 ? 'bg-steel-50/50' : ''
                        )}>
                          <td className="py-3 px-4 font-medium text-steel-700">{key}</td>
                          <td className="py-3 px-4 text-steel-600">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-steel-500 italic">No specifications available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
