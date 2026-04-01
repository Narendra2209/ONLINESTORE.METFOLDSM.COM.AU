'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ConfigurableAttribute } from '@/types/product';
import { useProductPrice } from '@/hooks/useProductPrice';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { ShoppingCart, Zap, Loader2, AlertCircle, Check, Trash2, Minus, Plus, Package } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductConfiguratorProps {
  product: Product;
}

// Dimension attribute names that store codes (value × 100 = mm)
const DIMENSION_ATTRS = ['Length', 'Width', 'Depth'];

// Dimension letter labels (e.g. Width = A, Length = B, Depth = C) for sump/rainhead products
const DIMENSION_LETTERS: Record<string, string> = { Width: 'A', Length: 'B', Depth: 'C' };

// Preferred display order for variant attributes
const ATTR_ORDER = ['Material', 'Colour', 'Rib Size', 'Cover Width', 'Thickness', 'Width', 'Length', 'Depth'];

// Colour codes for SKU suffix
const COLOUR_CODES: Record<string, string> = {
  'Basalt': 'BA',
  'Classic Cream': 'CC',
  'Cottage Green': 'CG',
  'Cove': 'CO',
  'Deep Ocean': 'DO',
  'Dover White': 'DW',
  'Dune': 'DU',
  'Evening Haze': 'EH',
  'Gully': 'GU',
  'Ironstone': 'IS',
  'Jasper': 'JA',
  'Mangrove': 'MG',
  'Manor Red': 'MR',
  'Monument': 'MO',
  'Night Sky': 'NS',
  'Pale Eucalypt': 'PE',
  'Paperbark': 'PB',
  'Shale Grey': 'SG',
  'Southerly': 'SO',
  'Surfmist': 'SM',
  'Terrain': 'TE',
  'Wallaby': 'WA',
  'Windspray': 'WS',
  'Woodland Grey': 'WG',
  'Bluegum': 'BG',
  'Zincalume': 'ZA',
  'Galvanised': 'GA',
  'Zinc': 'ZN',
  'Copper': 'CU',
  'Corten': 'CT',
  'VM ZINC': 'VZ',
};

function getColourCode(colour: string): string {
  return COLOUR_CODES[colour] || colour.substring(0, 2).toUpperCase();
}

// Colours available per material
const MATERIAL_COLOURS: Record<string, { name: string; hex: string }[]> = {
  'Colorbond': [
    { name: 'Basalt', hex: '#646560' },
    { name: 'Bluegum', hex: '#4A6670' },
    { name: 'Classic Cream', hex: '#E8D8A8' },
    { name: 'Cottage Green', hex: '#3A5243' },
    { name: 'Deep Ocean', hex: '#1B3A4B' },
    { name: 'Dover White', hex: '#E8E4D8' },
    { name: 'Dune', hex: '#B5A78C' },
    { name: 'Evening Haze', hex: '#C5BAA8' },
    { name: 'Gully', hex: '#5B6B52' },
    { name: 'Ironstone', hex: '#4A3C30' },
    { name: 'Jasper', hex: '#5C3A2E' },
    { name: 'Manor Red', hex: '#7B2D26' },
    { name: 'Monument', hex: '#35393B' },
    { name: 'Night Sky', hex: '#1E2326' },
    { name: 'Pale Eucalypt', hex: '#8DA07E' },
    { name: 'Paperbark', hex: '#C5B9A0' },
    { name: 'Shale Grey', hex: '#A8A49C' },
    { name: 'Southerly', hex: '#969E98' },
    { name: 'Surfmist', hex: '#DDD9CE' },
    { name: 'Wallaby', hex: '#817B6F' },
    { name: 'Windspray', hex: '#7E8580' },
    { name: 'Woodland Grey', hex: '#4B4D46' },
  ],
  'Matt Colorbond': [
    { name: 'Basalt', hex: '#5E5F5B' },
    { name: 'Bluegum', hex: '#4A6670' },
    { name: 'Dune', hex: '#ADA080' },
    { name: 'Monument', hex: '#2F3335' },
    { name: 'Shale Grey', hex: '#9E9A92' },
    { name: 'Surfmist', hex: '#D5D1C6' },
    { name: 'Wallaby', hex: '#797369' },
  ],
  'Ultra': [
    // { name: 'Basalt', hex: '#585955' },
    // { name: 'Cove', hex: '#345052' },
    { name: 'Deep Ocean', hex: '#152F3F' },
    { name: 'Dune', hex: '#A99A80' },
    { name: 'Monument', hex: '#2A2E30' },
    { name: 'Shale Grey', hex: '#959189' },
    { name: 'Surfmist', hex: '#CCC8BD' },
    { name: 'Wallaby', hex: '#797369' },
    { name: 'Windspray', hex: '#7E8580' },
    { name: 'Woodland Grey', hex: '#4B4D46' },
  ],
  'Zincalume': [
    { name: 'Zincalume', hex: '#B0B5B3' },
  ],
  'Galvanised': [
    { name: 'Galvanised', hex: '#B0B5B3' },
  ],
  'Zinc': [
    { name: 'Zinc', hex: '#C4C8CB' },
  ],
};

export default function ProductConfigurator({ product }: ProductConfiguratorProps) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [length, setLength] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedColour, setSelectedColour] = useState<string>('');
  // Raw typed values for dimension inputs — separate from the snapped/resolved code
  const [dimRawInputs, setDimRawInputs] = useState<Record<string, string>>({});
  const { addItem, items, removeItem, updateQuantity } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const isQuoteOnly = product.pricingModel === 'quote_only';
  const hasVariants = product.variants && product.variants.length > 0;

  // For variant-based products, we match selections to a variant
  // For pricing-rule-based products, we call the pricing API
  const isVariantBased = hasVariants && product.variants!.some((v) => v.priceOverride !== null);

  // Build unique values per attribute from variants
  const variantAttributeOptions = useMemo(() => {
    if (!isVariantBased || !product.variants) return {};

    const options: Record<string, { attrName: string; values: Set<string> }> = {};
    for (const variant of product.variants) {
      for (const attr of variant.attributes) {
        if (!options[attr.attributeName]) {
          options[attr.attributeName] = { attrName: attr.attributeName, values: new Set() };
        }
        options[attr.attributeName].values.add(attr.value);
      }
    }
    return options;
  }, [isVariantBased, product.variants]);

  // Find matching variant based on current selections
  const matchedVariant = useMemo(() => {
    if (!isVariantBased || !product.variants) return null;

    // Get all user-selectable attributes — exclude Finish Category when Material is used as the selector
    // Also exclude Colour from the "all selected" check — colour is tracked via selectedColour state
    const selectableAttrNames = Object.keys(variantAttributeOptions).filter(
      (name) =>
        !(name === 'Finish Category' && variantAttributeOptions['Material']?.values.size >= 1) &&
        name !== 'Colour'
    );
    const allSelected = selectableAttrNames.every((name) => selectedAttributes[name]);
    if (!allSelected) return null;

    // Build the effective colour value (from selectedColour state or selectedAttributes)
    const effectiveColour = selectedColour || selectedAttributes['Colour'] || '';

    // Find variant where all selected attributes match
    return product.variants.find((v) => {
      const nonColourMatch = selectableAttrNames.every((name) => {
        const varAttr = v.attributes.find((a) => a.attributeName === name);
        return varAttr && varAttr.value === selectedAttributes[name];
      });
      if (!nonColourMatch) return false;

      // If variant has Colour attribute, match against effectiveColour (case-insensitive)
      const varColour = v.attributes.find((a) => a.attributeName === 'Colour');
      if (varColour) {
        if (!effectiveColour) return false;
        return varColour.value.toLowerCase() === effectiveColour.toLowerCase();
      }
      // Variant has no Colour attribute — matches regardless of colour selection
      return true;
    }) || null;
  }, [isVariantBased, product.variants, selectedAttributes, selectedColour, variantAttributeOptions]);

  // Filter available values based on current selections (cascading)
  const getAvailableValues = (attrName: string): string[] => {
    if (!product.variants) return [];

    // Get all other selected attributes (not the current one, exclude internal keys like _userLength)
    // Also exclude attributes that don't exist in variant data (e.g. Colour for cladding)
    const variantAttrNames = new Set(Object.keys(variantAttributeOptions));
    const otherSelections = Object.entries(selectedAttributes).filter(
      ([k]) => k !== attrName && !k.startsWith('_') && variantAttrNames.has(k)
    );

    // Filter variants that match the other selections
    const matchingVariants = product.variants.filter((v) =>
      otherSelections.every(([name, value]) =>
        v.attributes.some((a) => a.attributeName === name && a.value === value)
      )
    );

    // Fallback: if filtering left no variants, use ALL variants (so dimension buttons always show)
    const variantsToUse = matchingVariants.length > 0 ? matchingVariants : product.variants;

    // Extract unique values for this attribute from matching variants
    const values = new Set<string>();
    for (const v of variantsToUse) {
      const attr = v.attributes.find((a) => a.attributeName === attrName);
      if (attr) values.add(attr.value);
    }

    return Array.from(values).sort((a, b) => {
      const na = parseFloat(a), nb = parseFloat(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  };

  // Determine if all required attributes are selected (for pricing-rule-based products)
  const requiredAttrs = product.configurableAttributes?.filter((ca) => ca.isRequired) || [];
  const allRequiredSelected = requiredAttrs.every(
    (ca) => selectedAttributes[ca.attribute._id]
  );
  const needsLength = product.pricingModel === 'per_metre';
  const isConfigComplete = allRequiredSelected && (!needsLength || (length && length > 0));

  // Calculate price (for pricing-rule-based products only)
  const { priceData, isCalculating, error: priceError } = useProductPrice({
    productId: product._id,
    selectedAttributes,
    length,
    quantity,
    enabled: !!(isConfigComplete && !isQuoteOnly && !isVariantBased),
  });

  // Filter colours based on selected finish category (for pricing-rule-based)
  const getFilteredValues = (ca: ConfigurableAttribute) => {
    const attr = ca.attribute;
    const allAllowed = !ca.allowedValues || ca.allowedValues.length === 0;
    const isAllowed = (v: any) => allAllowed || ca.allowedValues.includes(v.value);

    if (attr.slug === 'colour') {
      const finishAttr = product.configurableAttributes.find(
        (a) => a.attribute.slug === 'finish-category' || a.attribute.slug === 'color-category'
      );
      const selectedFinish = finishAttr ? selectedAttributes[finishAttr.attribute._id] : null;
      if (selectedFinish) {
        return attr.values.filter((v) => {
          const finishCategories = v.metadata?.finishCategories as string[] | undefined;
          return isAllowed(v) && (!finishCategories || finishCategories.includes(selectedFinish));
        });
      }
    }

    if (attr.slug === 'cover-width') {
      const ribAttr = product.configurableAttributes.find(
        (a) => a.attribute.slug === 'rib-size'
      );
      const selectedRib = ribAttr ? selectedAttributes[ribAttr.attribute._id] : null;
      if (selectedRib) {
        return attr.values.filter((v) => {
          const ribSizes = v.metadata?.ribSizes as string[] | undefined;
          return isAllowed(v) && (!ribSizes || ribSizes.includes(selectedRib));
        });
      }
    }

    return allAllowed ? attr.values : attr.values.filter((v) => isAllowed(v));
  };

  const handleAttributeChange = (key: string, value: string) => {
    const newAttrs = { ...selectedAttributes, [key]: value };

    // For pricing-rule-based: handle cascading resets
    if (!isVariantBased) {
      const attr = product.configurableAttributes.find((ca) => ca.attribute._id === key);
      if (attr?.attribute.slug === 'finish-category' || attr?.attribute.slug === 'color-category') {
        const colourAttr = product.configurableAttributes.find(
          (ca) => ca.attribute.slug === 'colour'
        );
        if (colourAttr) delete newAttrs[colourAttr.attribute._id];
      }
      if (attr?.attribute.slug === 'rib-size') {
        const coverAttr = product.configurableAttributes.find(
          (ca) => ca.attribute.slug === 'cover-width'
        );
        if (coverAttr) delete newAttrs[coverAttr.attribute._id];
      }
    }

    setSelectedAttributes(newAttrs);
  };

  const handleAddToCart = () => {

    let unitPrice: number;
    let lineTotal: number;
    let pricingModel: string;
    let attrEntries: { attributeName: string; value: string }[];

    if (isVariantBased && matchedVariant) {
      unitPrice = matchedVariant.priceOverride!;
      lineTotal = unitPrice * quantity;
      pricingModel = 'per_piece';
      attrEntries = matchedVariant.attributes.map((a) => ({
        attributeName: a.attributeName,
        value: a.value,
      }));
    } else if (priceData) {
      unitPrice = priceData.unitPrice;
      lineTotal = priceData.lineTotal;
      pricingModel = priceData.pricingModel;
      attrEntries = Object.entries(selectedAttributes).map(([attrId, value]) => {
        const ca = product.configurableAttributes.find(
          (a) => a.attribute._id === attrId
        );
        return { attributeName: ca?.attribute.name || attrId, value };
      });
    } else {
      return;
    }

    addItem({
      _id: '',
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        sku: isVariantBased && matchedVariant ? matchedVariant.sku : product.sku,
        images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
      },
      selectedAttributes: attrEntries,
      pricingModel,
      unitPrice,
      length: length || undefined,
      quantity,
      lineTotal,
    });

    toast.success('Added to cart');
  };

  // ═══════════ SIMPLE PRODUCT ═══════════
  if (product.type === 'simple') {
    return (
      <div className="space-y-4">
        <div className="text-3xl font-bold text-steel-900">
          {product.price ? formatCurrency(product.price) : 'Price unavailable'}
          {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
            <span className="ml-2 text-lg text-steel-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-steel-700">Qty:</label>
          <div className="flex items-center rounded-lg border border-steel-300">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-steel-600 hover:bg-steel-50">-</button>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border-x border-steel-300 text-center py-2 text-sm" />
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-steel-600 hover:bg-steel-50">+</button>
          </div>
        </div>

        {product.price && (
          <div className="text-lg font-semibold text-steel-700">
            Total: {formatCurrency(product.price * quantity)}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            leftIcon={<ShoppingCart className="h-5 w-5" />}
            onClick={() => {
              addItem({
                _id: '',
                product: {
                  _id: product._id, name: product.name, slug: product.slug, sku: product.sku,
                  images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
                },
                selectedAttributes: [],
                pricingModel: 'fixed',
                unitPrice: product.price!,
                quantity,
                lineTotal: product.price! * quantity,
              });
              toast.success('Added to cart');
            }}
            disabled={!product.price}
          >
            Add to Cart
          </Button>
          <Button variant="outline" size="lg" leftIcon={<Zap className="h-5 w-5" />} onClick={() => {
            addItem({
              _id: '',
              product: {
                _id: product._id, name: product.name, slug: product.slug, sku: product.sku,
                images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
              },
              selectedAttributes: [],
              pricingModel: 'fixed',
              unitPrice: product.price!,
              quantity,
              lineTotal: product.price! * quantity,
            });
            router.push('/cart');
          }} disabled={!product.price}>
            Buy Now
          </Button>
        </div>
      </div>
    );
  }

  /* cladding now uses the variant system below */
  if (false as boolean) {
    const claddingMaterial = '', claddingRib = '', claddingCover = 0, claddingLength = 0, claddingColour = '';
    const setCladdingMaterial = (_: any) => {}, setCladdingRib = (_: any) => {}, setCladdingCover = (_: any) => {}, setCladdingLength = (_: any) => {}, setCladdingColour = (_: any) => {};
    const claddingPanels: any[] = [], claddingLoaded = true;
    const COLOUR_CODES: Record<string, string> = {};
    const getColourCode = (c: string) => COLOUR_CODES[c] || c.substring(0, 2); // eslint-disable-line @typescript-eslint/no-unused-vars
    const cMaterials: string[] = [], cRibs: string[] = [], cCovers: number[] = [];
    const cMatchedPanel: any = null, needsColour = false, cColours: any[] = [], effectiveColour = '';
    const cSkuWithColour = '';
    const cUnitPrice = 0, cLineTotal = 0, cAllSelected = false;

    const handleCladdingAddToCart = () => {
      if (!cMatchedPanel) {
        toast.error('Please select material, rib size, and cover width');
        return;
      }
      if (needsColour && !claddingColour) {
        toast.error('Please select a colour');
        return;
      }
      if (!claddingLength || (claddingLength as number) <= 0 || (claddingLength as number) > 8) {
        toast.error('Please enter a valid length (0.1 – 8m)');
        return;
      }
      addItem({
        _id: '',
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          sku: cSkuWithColour,
          images: product.images.map((i: any) => ({ url: i.url, alt: i.alt })),
        },
        selectedAttributes: [
          { attributeName: 'Material', value: cMatchedPanel.material },
          { attributeName: 'Colour', value: effectiveColour },
          { attributeName: 'Rib', value: cMatchedPanel.rib },
          { attributeName: 'Cover', value: `${cMatchedPanel.cover}mm` },
          ...(cMatchedPanel.gauge ? [{ attributeName: 'Gauge', value: cMatchedPanel.gauge }] : []),
        ],
        pricingModel: 'per_metre',
        unitPrice: cMatchedPanel.basePrice,
        length: claddingLength as number,
        quantity,
        lineTotal: cLineTotal,
      });
      toast.success('Added to cart');
      useCartStore.getState().setCartOpen(true);
    };

    if (!claddingLoaded) {
      return <div className="py-8 text-center text-steel-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
    }

    if (claddingPanels.length === 0) {
      return <div className="py-8 text-center text-steel-500">No pricing data available for this product yet.</div>;
    }

    return (
      <div className="space-y-5">
        {/* 1. Material */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-steel-700">
            Material <span className="text-red-500">*</span>
            {claddingMaterial && <span className="ml-2 font-normal text-steel-500">— {claddingMaterial}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {cMaterials.map((mat: string) => (
              <button
                key={mat}
                onClick={() => { setCladdingMaterial(mat); setCladdingRib(''); setCladdingCover(''); setCladdingColour(''); }}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                  claddingMaterial === mat
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                )}
              >
                {mat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Colour — only for Colorbond, Matt Colorbond, Ultra */}
        {needsColour && (
          <div className={cn(!claddingMaterial && 'opacity-50 pointer-events-none')}>
            <label className="mb-2 block text-sm font-semibold text-steel-700">
              Colour <span className="text-red-500">*</span>
              {claddingColour && <span className="ml-2 font-normal text-steel-500">— {claddingColour}</span>}
              <span className="ml-2 font-normal text-steel-400 text-xs">({cColours.length} colours)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {cColours.map((colour) => (
                <button
                  key={colour.name}
                  onClick={() => setCladdingColour(colour.name)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all',
                    claddingColour === colour.name
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                  )}
                  title={colour.name}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-steel-300 flex-shrink-0"
                    style={{ backgroundColor: colour.hex }}
                  />
                  {colour.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Rib Size */}
        <div className={cn(!claddingMaterial && 'opacity-50 pointer-events-none')}>
          <label className="mb-2 block text-sm font-semibold text-steel-700">
            Rib Size <span className="text-red-500">*</span>
            {claddingRib && <span className="ml-2 font-normal text-steel-500">— {claddingRib}</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {cRibs.map((rib: string) => (
              <button
                key={rib}
                onClick={() => { setCladdingRib(rib); setCladdingCover(''); }}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                  claddingRib === rib
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                )}
              >
                {rib}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Cover Width */}
        <div className={cn(!claddingRib && 'opacity-50 pointer-events-none')}>
          <label className="mb-2 block text-sm font-semibold text-steel-700">
            Cover Width <span className="text-red-500">*</span>
            {claddingCover && <span className="ml-2 font-normal text-steel-500">— {claddingCover}mm</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {cCovers.map((cover: number) => (
              <button
                key={cover}
                onClick={() => setCladdingCover(cover)}
                className={cn(
                  'px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                  claddingCover === cover
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                )}
              >
                {cover}mm
              </button>
            ))}
          </div>
        </div>

        {/* 5. Length */}
        <div className={cn(!cMatchedPanel && 'opacity-50 pointer-events-none')}>
          <label className="mb-2 block text-sm font-semibold text-steel-700">
            Length (metres) <span className="text-red-500">*</span>
            <span className="ml-2 font-normal text-steel-400 text-xs">Max 8m</span>
          </label>
          <input
            type="number"
            min="0.1"
            max="8"
            step="0.1"
            value={claddingLength}
            onChange={(e) => setCladdingLength(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder="Enter length (0.1 – 8m)"
            disabled={!cMatchedPanel}
            className="w-full rounded-lg border border-steel-300 px-4 py-3 text-sm text-steel-900 placeholder:text-steel-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-steel-50 disabled:text-steel-400"
          />
          {claddingLength && (claddingLength as number) > 8 && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Maximum length is 8 metres
            </p>
          )}
        </div>

        {/* 6. Quantity */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-steel-700">
            Quantity <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center rounded-lg border border-steel-300 w-fit">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-steel-600 hover:bg-steel-50">-</button>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border-x border-steel-300 text-center py-2 text-sm" />
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-steel-600 hover:bg-steel-50">+</button>
          </div>
        </div>

        {/* Price box */}
        {cMatchedPanel && (
          <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-brand-700">
              <Check className="h-4 w-4" />
              <span className="font-medium">SKU: {cSkuWithColour}</span>
            </div>
            <div className="flex justify-between text-sm text-steel-600">
              <span>Unit price:</span>
              <span className="font-bold text-steel-900">{formatCurrency(cMatchedPanel.basePrice)}/LM</span>
            </div>
            {cAllSelected && (
              <>
                <div className="flex justify-between text-sm text-steel-600">
                  <span>Per sheet ({formatCurrency(cMatchedPanel.basePrice)} x {claddingLength}m):</span>
                  <span className="font-bold text-steel-900">{formatCurrency(cUnitPrice)}</span>
                </div>
                <div className="border-t border-brand-200 pt-2 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-steel-700">Total:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-steel-900">{formatCurrency(cLineTotal)}</span>
                    <span className="block text-xs text-steel-400">Excl. GST</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            leftIcon={<ShoppingCart className="h-5 w-5" />}
            onClick={handleCladdingAddToCart}
            disabled={!cAllSelected}
          >
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="lg"
            leftIcon={<Zap className="h-5 w-5" />}
            onClick={() => { handleCladdingAddToCart(); if (cAllSelected) router.push('/cart'); }}
            disabled={!cAllSelected}
          >
            Buy Now
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════ CONFIGURABLE: VARIANT-BASED (sumps, rainheads, etc.) ═══════════
  if (isVariantBased) {
    const attrNames = Object.keys(variantAttributeOptions);

    // Helper: is this a dimension attribute that needs mm conversion?
    const isDimensionAttr = (name: string) => DIMENSION_ATTRS.includes(name);
    // Convert stored code to mm display (e.g., "10" → "1000")
    const codeToMm = (code: string) => String(Math.round(parseFloat(code) * 100));
    // Convert mm input to stored code (e.g., "1000" → "10")
    const mmToCode = (mm: string) => String(parseFloat(mm) / 100);

    // Sort attributes: Material first, then Colour (hidden), then dimensions in order
    const sortedAttrNames = [...attrNames].sort((a, b) => {
      const orderA = ATTR_ORDER.indexOf(a);
      const orderB = ATTR_ORDER.indexOf(b);
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });

    // Determine the "material" key — could be 'Material' or 'Finish Category' in variant attributes
    const materialAttrKey = variantAttributeOptions['Material']?.values.size >= 1
      ? 'Material'
      : variantAttributeOptions['Finish Category']?.values.size >= 1
        ? 'Finish Category'
        : '';
    const selectedMaterial = materialAttrKey ? (selectedAttributes[materialAttrKey] || '') : '';
    const hasMaterialVariation = !!materialAttrKey;

    // Filter material colours — use variant data if Colour attribute exists, otherwise show all from MATERIAL_COLOURS
    const hasColourInVariants = !!variantAttributeOptions['Colour'];
    const materialColours = useMemo(() => {
      if (!selectedMaterial || !materialAttrKey) return [];
      const displayColours = MATERIAL_COLOURS[selectedMaterial] || [];

      if (!hasColourInVariants) {
        // Variants don't have Colour attribute (e.g. cladding) — show all colours for this material
        return displayColours;
      }

      // Get actual colour values from variants that have this material/finish
      const actualColours = new Set<string>();
      for (const v of product.variants || []) {
        const hasMat = v.attributes.some((a) => a.attributeName === materialAttrKey && a.value === selectedMaterial);
        if (hasMat) {
          const col = v.attributes.find((a) => a.attributeName === 'Colour');
          if (col) actualColours.add(col.value);
        }
      }
      const filtered = displayColours.filter((c) => actualColours.has(c.name));
      // Add any actual variant colours missing from MATERIAL_COLOURS (with default hex)
      for (const colName of Array.from(actualColours)) {
        if (!filtered.some((c) => c.name === colName)) {
          const allKnown = Object.values(MATERIAL_COLOURS).flat();
          const known = allKnown.find((c) => c.name.toLowerCase() === colName.toLowerCase());
          filtered.push({ name: colName, hex: known?.hex || '#808080' });
        }
      }
      // Fallback: if variants have Colour attribute but none matched, show all colours for this material
      if (filtered.length === 0 && displayColours.length > 0) {
        return displayColours;
      }
      return filtered;
    }, [selectedMaterial, materialAttrKey, product.variants, hasColourInVariants]);

    // For products without Material/Finish Category variation, build colour list from variants
    const standaloneColours = useMemo(() => {
      if (hasMaterialVariation || !variantAttributeOptions['Colour']) return [];
      const colourValues = Array.from(variantAttributeOptions['Colour'].values);
      const allKnownColours = Object.values(MATERIAL_COLOURS).flat();
      return colourValues.map((name) => {
        const known = allKnownColours.find((c) => c.name.toLowerCase() === name.toLowerCase());
        return { name, hex: known?.hex || '#808080' };
      }).sort((a, b) => a.name.localeCompare(b.name));
    }, [hasMaterialVariation, variantAttributeOptions]);

    // Auto-select attributes that have only one TOTAL value (across all variants, not filtered)
    useEffect(() => {
      if (!isVariantBased) return;
      const newAttrs = { ...selectedAttributes };
      let changed = false;
      for (const attrName of attrNames) {
        const totalValues = variantAttributeOptions[attrName]?.values;
        if (totalValues && totalValues.size === 1) {
          const onlyVal = Array.from(totalValues)[0];
          if (selectedAttributes[attrName] !== onlyVal) {
            newAttrs[attrName] = onlyVal;
            changed = true;
          }
        }
      }
      if (changed) setSelectedAttributes(newAttrs);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVariantBased]);

    // When material/finish changes, reset colour and dimensions so user must pick again
    // BUT preserve any single-value attributes (like Rib=25mm for Interlocking)
    const handleMaterialSelect = (material: string) => {
      const newAttrs: Record<string, string> = { [materialAttrKey]: material };
      // Re-apply auto-selected single-value attributes
      for (const an of attrNames) {
        if (an === materialAttrKey) continue;
        const totalVals = variantAttributeOptions[an]?.values;
        if (totalVals && totalVals.size === 1) {
          newAttrs[an] = Array.from(totalVals)[0];
        }
      }
      setSelectedAttributes(newAttrs);
      // Auto-select colour if this material only has one colour option
      const mColours = MATERIAL_COLOURS[material] || [];
      if (mColours.length === 1) {
        setSelectedColour(mColours[0].name);
        // Only add to selectedAttributes if Colour is an actual variant attribute
        if (hasColourInVariants) {
          setSelectedAttributes({ ...newAttrs, Colour: mColours[0].name });
        }
      } else {
        setSelectedColour('');
      }
    };

    // Override handleAddToCart to include selectedColour
    const handleVariantAddToCart = () => {
      const hasColour = !!(selectedAttributes['Colour'] || selectedColour);
      // Require colour if variants have Colour attribute OR if material has multiple colours available
      const colourRequired = variantAttributeOptions['Colour'] || (materialColours.length > 1);
      if (!hasColour && colourRequired) {
        toast.error('Please select a colour');
        return;
      }
      if (!matchedVariant) {
        if (!hasColour && colourRequired) {
          toast.error('Please select a colour');
        } else {
          toast.error('Please select all required options');
        }
        return;
      }

      const attrEntries = matchedVariant.attributes
        .filter((a) => a.attributeName !== 'Colour')
        .map((a) => ({ attributeName: a.attributeName, value: a.value }));
      const colourVal = selectedColour || selectedAttributes['Colour'] || '';
      if (colourVal) {
        attrEntries.push({ attributeName: 'Colour', value: colourVal });
      }

      const isRoofSheet = !!(product.category?.slug === 'roof-sheets' || product.category?.name?.toLowerCase().includes('roof sheet'));
      const hasLengthAttr = 'Length' in variantAttributeOptions;
      const isPerMetre = !!(isRoofSheet || product.pricingModel === 'per_metre');
      const unitPriceVal = matchedVariant.priceOverride!;
      // Append colour code to SKU for products where colour isn't a variant attribute
      const cartSku = colourVal && !hasColourInVariants
        ? `${matchedVariant.sku}-${getColourCode(colourVal)}`
        : matchedVariant.sku;

      if (isPerMetre && hasLengthAttr) {
        const userLen = parseFloat(selectedAttributes['_userLength'] || '') || 0;
        if (userLen < 0.4 || userLen > 13) {
          toast.error('Length must be between 0.4m and 13m');
          return;
        }

        // Use nearest available variant length
        const matchedLenAttr = matchedVariant.attributes.find((a) => a.attributeName === 'Length');
        const matchedLenCode = matchedLenAttr?.value || '';
        const variantLenMetres = matchedLenCode ? (() => {
          const raw = parseFloat(matchedLenCode);
          const mm = raw > 100 ? raw : raw * 100;
          return mm / 1000;
        })() : userLen;

        const lineTotal = unitPriceVal * variantLenMetres * quantity;

        addItem({
          _id: '',
          product: {
            _id: product._id, name: product.name, slug: product.slug,
            sku: cartSku,
            images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
          },
          selectedAttributes: attrEntries.filter(a => !a.attributeName.startsWith('_') && a.attributeName !== 'Length'),
          pricingModel: 'per_metre',
          unitPrice: unitPriceVal,
          length: variantLenMetres,
          quantity,
          lineTotal,
        });
      } else if (isPerMetre && !hasLengthAttr && length && length >= 0.4 && length <= 13) {
        // Per-metre roof sheets without Length variant attribute — use separate length input
        const lineTotal = unitPriceVal * length * quantity;

        addItem({
          _id: '',
          product: {
            _id: product._id, name: product.name, slug: product.slug,
            sku: cartSku,
            images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
          },
          selectedAttributes: attrEntries.filter(a => !a.attributeName.startsWith('_') && a.attributeName !== 'Length'),
          pricingModel: 'per_metre',
          unitPrice: unitPriceVal,
          length,
          quantity,
          lineTotal,
        });
      } else if (isPerMetre && !hasLengthAttr && (!length || length < 0.4 || length > 13)) {
        toast.error('Length must be between 0.4m and 13m');
        return;
      } else {
        // Check if this is a cladding product with a user-entered length
        const isCladding = !!(
          product.category?.slug?.includes('cladding') ||
          product.category?.name?.toLowerCase().includes('cladding')
        );
        const hasCoverWidth = !!variantAttributeOptions['Cover Width'];
        if (isCladding && hasCoverWidth) {
          if (!length || length < 0.1 || length > 8) {
            toast.error('Length must be between 0.1m and 8m');
            return;
          }
          const lineTotal = unitPriceVal * length * quantity;
          addItem({
            _id: '',
            product: {
              _id: product._id, name: product.name, slug: product.slug,
              sku: cartSku,
              images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
            },
            selectedAttributes: attrEntries.filter(a => !a.attributeName.startsWith('_')),
            pricingModel: 'per_metre',
            unitPrice: unitPriceVal,
            length,
            quantity,
            lineTotal,
          });
        } else {
          // Per-piece products (rainheads, sumps, downpipes, polycarbonate, etc.)
          const lineTotal = unitPriceVal * quantity;

          // For products with large Length values (polycarbonate), show user's custom length in metres
          const userLen = parseFloat(selectedAttributes['_userLength'] || '') || 0;
          const cartAttrs = attrEntries
            .filter(a => !a.attributeName.startsWith('_'))
            .map(a => {
              if (a.attributeName === 'Length' && userLen > 0) {
                return { attributeName: 'Length', value: `${userLen}m` };
              }
              return a;
            });

          addItem({
            _id: '',
            product: {
              _id: product._id, name: product.name, slug: product.slug,
              sku: cartSku,
              images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
            },
            selectedAttributes: cartAttrs,
            pricingModel: 'per_piece',
            unitPrice: unitPriceVal,
            length: userLen > 0 ? userLen : undefined,
            quantity,
            lineTotal,
          });
        }
      }
      toast.success('Added to cart');
      // Open the side drawer
      useCartStore.getState().setCartOpen(true);
    };

    // Show ALL cart items in the sidebar
    const productCartItems = items;
    const productCartTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const hasCartItems = productCartItems.length > 0;
    const { isOpen: drawerOpen, setCartOpen } = useCartStore();

    return (
      <>
      {/* Fixed side drawer — below header+nav */}
      {hasCartItems && (
        <div className={cn(
          'fixed right-0 w-80 bg-white border-l border-steel-200 shadow-lg z-40 flex flex-col transition-transform duration-300 ease-in-out',
          'top-[190px] bottom-0',
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          {/* Arrow toggle — attached to left edge of drawer */}
          <button
            onClick={() => setCartOpen(!drawerOpen)}
            className="absolute -left-8 top-4 w-8 h-12 bg-brand-600 text-white rounded-l-lg shadow-md hover:bg-brand-700 transition-colors flex items-center justify-center"
          >
            <svg className={cn('h-5 w-5 transition-transform', drawerOpen ? 'rotate-0' : 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Cart badge on arrow when closed */}
          {!drawerOpen && (
            <span className="absolute -left-8 top-[60px] w-8 text-center text-[10px] font-bold text-brand-600 bg-brand-50 border border-brand-200 rounded-l-lg py-1">
              {productCartItems.length}
            </span>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-b border-steel-100 bg-brand-50">
            <h3 className="text-sm font-bold text-steel-900 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-brand-600" />
              Cart ({productCartItems.length} {productCartItems.length === 1 ? 'item' : 'items'})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {productCartItems.map((item) => (
              <div key={item._id} className="rounded-lg border border-steel-100 bg-white p-2.5">
                <div className="flex gap-2.5">
                  {/* Image */}
                  <div className="h-16 w-16 flex-shrink-0 rounded-md bg-steel-50 border border-steel-100 flex items-center justify-center overflow-hidden">
                    {item.product.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-steel-300" />
                    )}
                  </div>
                  {/* Everything beside image */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-steel-900 truncate">{item.product.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.selectedAttributes.filter((a) => !a.attributeName.startsWith('Segment ') && a.attributeName !== 'Length').map((attr, i) => (
                        <span key={i} className="text-[10px] bg-steel-50 text-steel-600 px-1.5 py-0.5 rounded border border-steel-100">
                          {attr.attributeName}: {attr.value}
                        </span>
                      ))}
                      {item.length && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                          Length: {item.length}m
                        </span>
                      )}
                    </div>
                    {/* Quantity + Price */}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="flex items-center rounded border border-steel-200">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-1.5 py-0.5 text-steel-400 hover:text-steel-600 disabled:opacity-30"
                        >
                          <Minus className="h-2.5 w-2.5" />
                        </button>
                        <span className="w-6 text-center text-[11px] font-medium border-x border-steel-200">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-1.5 py-0.5 text-steel-400 hover:text-steel-600"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-steel-900">{formatCurrency(item.lineTotal)}</span>
                        <button onClick={() => removeItem(item._id)} className="p-1 text-steel-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-steel-200 px-4 py-3 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-steel-700">Total (excl. GST):</span>
              <span className="text-lg font-bold text-steel-900">{formatCurrency(productCartTotal)}</span>
            </div>
            <button
              onClick={() => { setCartOpen(false); router.push('/cart'); }}
              className="w-full py-2.5 rounded-lg bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              Place Order
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* 1. MATERIAL / FINISH CATEGORY selector */}
        {hasMaterialVariation && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-steel-700">
              Material
              {selectedMaterial && (
                <span className="ml-2 font-normal text-steel-500">— {selectedMaterial}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from(variantAttributeOptions[materialAttrKey].values).map((mat) => (
                <button
                  key={mat}
                  onClick={() => handleMaterialSelect(mat)}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                    selectedMaterial === mat
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                  )}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2a. COLOUR selector — standalone for products without Material/Finish Category variation */}
        {!hasMaterialVariation && standaloneColours.length > 1 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-steel-700">
              Colour
              {selectedAttributes['Colour'] && (
                <span className="ml-2 font-normal text-steel-500">— {selectedAttributes['Colour']}</span>
              )}
              <span className="ml-2 font-normal text-steel-400 text-xs">({standaloneColours.length} colours)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {standaloneColours.map((colour) => (
                <button
                  key={colour.name}
                  onClick={() => setSelectedAttributes((prev) => ({ ...prev, Colour: colour.name }))}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all',
                    selectedAttributes['Colour'] === colour.name
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                  )}
                  title={colour.name}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-steel-300 flex-shrink-0"
                    style={{ backgroundColor: colour.hex }}
                  />
                  {colour.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2b. COLOUR selector — shows sub-colours based on selected material */}
        {selectedMaterial && materialColours.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-steel-700">
              Colour              {selectedColour && (
                <span className="ml-2 font-normal text-steel-500">— {selectedColour}</span>
              )}
              <span className="ml-2 font-normal text-steel-400 text-xs">({materialColours.length} colours)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {materialColours.map((colour) => (
                <button
                  key={colour.name}
                  onClick={() => {
                    setSelectedColour(colour.name);
                    // Don't add Colour to selectedAttributes — it's tracked via selectedColour state
                    // and matched case-insensitively in matchedVariant. Adding it here breaks
                    // getAvailableValues dimension filtering for products where colour is separate.
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all',
                    selectedColour === colour.name
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                  )}
                  title={colour.name}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-steel-300 flex-shrink-0"
                    style={{ backgroundColor: colour.hex }}
                  />
                  {colour.name}
                </button>
              ))}
            </div>
          </div>
        )}


        {/* 3. DIMENSION selectors (Width, Length, Depth) */}
        {sortedAttrNames.map((attrName) => {
          // Skip Material (rendered above) and Colour (rendered above as swatches)
          if (attrName === 'Material') return null;
          if (attrName === 'Colour') return null;
          if (attrName === 'Finish Category') return null;

          const availableValues = getAvailableValues(attrName);
          const selectedVal = selectedAttributes[attrName] || '';
          const totalValues = variantAttributeOptions[attrName]?.values;
          const isDim = isDimensionAttr(attrName);

          // Show single-value attributes as pre-selected (non-interactive)
          if (totalValues && totalValues.size === 1) {
            const onlyVal = Array.from(totalValues)[0];
            const displayVal = isDim ? `${codeToMm(onlyVal)}mm` : onlyVal;
            return (
              <div key={attrName}>
                <label className="mb-2 block text-sm font-semibold text-steel-700">
                  {attrName}
                  <span className="ml-2 font-normal text-steel-500">— {displayVal}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2.5 rounded-lg text-sm font-medium border-2 border-brand-600 bg-brand-50 text-brand-700 shadow-sm">
                    {displayVal}
                  </span>
                </div>
              </div>
            );
          }

          // Length attribute — free input in metres for sheet products (roof sheets, polycarbonate, etc.)
          // Detect by: explicit per_metre pricing, roof-sheet category, or Length values > 1000 (i.e. stored in mm representing metres)
          const lengthValsNumeric = attrName === 'Length' ? availableValues.map((v) => parseFloat(v)).filter(Boolean) : [];
          const hasLargeLength = lengthValsNumeric.length > 0 && Math.min(...lengthValsNumeric) > 1000;
          const isLengthInMetres = attrName === 'Length' && (
            product.pricingModel === 'per_metre' ||
            product.category?.slug === 'roof-sheets' ||
            product.category?.name?.toLowerCase().includes('roof sheet') ||
            hasLargeLength
          );
          if (isLengthInMetres) {
            // Convert stored values to metres for quick buttons
            const metreValues = availableValues.map((v) => {
              const raw = parseFloat(v);
              const mm = raw > 100 ? raw : raw * 100;
              return { code: v, metres: (mm / 1000).toFixed(1) };
            }).sort((a, b) => parseFloat(a.metres) - parseFloat(b.metres));

            // User's typed value (stored as custom key)
            const userTyped = selectedAttributes['_userLength'] || '';

            // Find the nearest HIGHER or equal available length (round up)
            const findClosest = (mInput: string) => {
              if (availableValues.length === 0) return '';
              const mmVal = parseFloat(mInput) * 1000;
              // Sort values in mm ascending
              const sorted = availableValues
                .map((v) => ({ code: v, mm: parseFloat(v) > 100 ? parseFloat(v) : parseFloat(v) * 100 }))
                .sort((a, b) => a.mm - b.mm);
              // Find first value >= user input
              const higher = sorted.find((v) => v.mm >= mmVal - 1);
              if (higher) return higher.code;
              // If none higher, use the largest available
              return sorted[sorted.length - 1].code;
            };

            return (
              <div key={attrName}>
                <label className="mb-2 block text-sm font-semibold text-steel-700">
                  Length (metres)                  {userTyped && (
                    <span className="ml-2 font-normal text-steel-500">— {userTyped}m</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.4}
                  max={13}
                  value={userTyped}
                  placeholder="Enter any length (0.4m – 13m)"
                  onChange={(e) => {
                    const mInput = e.target.value;
                    if (!mInput) {
                      setSelectedAttributes((prev) => ({ ...prev, '_userLength': '', [attrName]: '' }));
                      return;
                    }
                    const parsed = parseFloat(mInput);
                    if (parsed > 13) return; // Block input beyond 13m
                    const closest = findClosest(mInput);
                    const lengthCode = closest || String(parsed * 1000);
                    setSelectedAttributes((prev) => ({ ...prev, '_userLength': mInput, [attrName]: lengthCode }));
                  }}
                  className="w-full rounded-lg border-2 border-steel-200 px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {metreValues.map(({ code, metres }) => (
                    <button
                      key={code}
                      onClick={() => {
                        setSelectedAttributes((prev) => ({ ...prev, [attrName]: code, '_userLength': metres }));
                      }}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium transition-all',
                        selectedVal === code
                          ? 'bg-brand-600 text-white'
                          : 'text-steel-500 hover:text-steel-700 hover:bg-steel-100'
                      )}
                    >
                      {metres}m
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          // Other dimension with mm display + quick buttons
          if (isDim) {
            const mmValues = availableValues.map((v) => ({ code: v, mm: codeToMm(v) }));
            const mmNums = mmValues.map((v) => parseInt(v.mm)).sort((a, b) => a - b);
            const displayMm = selectedVal ? codeToMm(selectedVal) : '';
            const isInvalid = displayMm && !mmValues.some((v) => v.mm === displayMm);
            const isDownpipeLength = !!(product.category?.slug?.includes('downpipe') && attrName === 'Length');
            const isDambuster = !!(product.category?.slug?.includes('dambuster') || product.category?.name?.toLowerCase().includes('dambuster'));
            const dimLabel = isDambuster && attrName === 'Length' ? 'Size' : attrName;

            // For dambuster products, extract size numbers from variant SKUs
            // e.g., "R3-350Z" → "3-350", "CSO200L" → "200", "XSO300" → "300", "CR400" → "400"
            const dambusterSizeMap = useMemo(() => {
              if (!isDambuster || attrName !== 'Length' || !product.variants) return {};
              const map: Record<string, string> = {};
              for (const v of product.variants) {
                const lenAttr = v.attributes.find((a) => a.attributeName === 'Length');
                if (!lenAttr) continue;
                if (map[lenAttr.value]) continue; // already mapped
                const sku = v.sku.toUpperCase();
                // Extract only the numeric portion (with dashes between numbers, e.g. "3-350")
                const match = sku.match(/(\d+(?:-\d+)*)/);
                if (match) map[lenAttr.value] = match[1];
              }
              return map;
            }, [isDambuster, attrName, product.variants]);

            const getDambusterDisplay = (code: string, mm: string) => {
              if (!isDambuster || attrName !== 'Length') return `${mm}mm`;
              return dambusterSizeMap[code] || `${mm}mm`;
            };

            // Is this a sump/rainhead product? Show letter labels A/B/C
            const isSump = !!(
              product.category?.slug?.includes('sump') ||
              product.category?.name?.toLowerCase().includes('sump') ||
              product.category?.slug?.includes('rainhead') ||
              product.category?.name?.toLowerCase().includes('rainhead') ||
              product.category?.slug?.includes('rainheads') ||
              product.category?.name?.toLowerCase().includes('rainheads')
            );
            const letterLabel = isSump && DIMENSION_LETTERS[attrName] ? ` (${DIMENSION_LETTERS[attrName]})` : '';

            const selectedDisplay = selectedVal ? getDambusterDisplay(selectedVal, displayMm) : '';

            // Round UP to next standard size (ceiling) — e.g. 250 → 300
            const findNextHigher = (mmInput: string) => {
              if (!mmInput) return '';
              const val = parseInt(mmInput);
              if (isNaN(val)) return '';
              const sorted = [...mmValues].sort((a, b) => parseInt(a.mm) - parseInt(b.mm));
              // Find first standard value >= input
              const higher = sorted.find((v) => parseInt(v.mm) >= val);
              if (higher) return higher.code;
              // If input exceeds all standards, use max
              return sorted[sorted.length - 1].code;
            };

            return (
              <div key={attrName}>
                <label className="mb-2 block text-sm font-semibold text-steel-700">
                  {dimLabel}{letterLabel}
                  {selectedDisplay && !isInvalid && (
                    <span className="ml-2 font-normal text-steel-500">— {selectedDisplay}</span>
                  )}
                </label>
                {/* Hide manual input for downpipe Length and dambuster Size — buttons only */}
                {!isDownpipeLength && !isDambuster && (
                  <>
                    <input
                      type="number"
                      min={mmNums[0]}
                      step={1}
                      value={dimRawInputs[attrName] ?? displayMm}
                      placeholder={`Enter ${dimLabel.toLowerCase()} (${mmNums[0]}mm – ${mmNums[mmNums.length - 1]}mm)`}
                      onChange={(e) => {
                        const mmInput = e.target.value;
                        // Always store the raw typed value so user can type freely
                        setDimRawInputs((prev) => ({ ...prev, [attrName]: mmInput }));
                        if (!mmInput) { handleAttributeChange(attrName, ''); return; }
                        // Round UP to next standard size for pricing
                        const nextCode = findNextHigher(mmInput);
                        const code = nextCode || mmToCode(mmInput);
                        handleAttributeChange(attrName, code);
                      }}
                      className={cn(
                        'w-full rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500',
                        'border-steel-200 text-steel-600 focus:border-brand-500'
                      )}
                    />
                  </>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mmValues.sort((a, b) => parseInt(a.mm) - parseInt(b.mm)).map(({ code, mm }) => (
                    <button
                      key={code}
                      onClick={() => {
                        handleAttributeChange(attrName, code);
                        // Clear raw input so button selection is shown cleanly
                        setDimRawInputs((prev) => ({ ...prev, [attrName]: mm }));
                      }}
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium transition-all',
                        selectedVal === code
                          ? 'bg-brand-600 text-white'
                          : 'text-steel-500 hover:text-steel-700 hover:bg-steel-100'
                      )}
                    >
                      {getDambusterDisplay(code, mm)}
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          // Other non-dimension, non-material/colour attributes — button selector
          return (
            <div key={attrName}>
              <label className="mb-2 block text-sm font-semibold text-steel-700">
                {attrName}                {selectedVal && (
                  <span className="ml-2 font-normal text-steel-500">— {selectedVal}</span>
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => handleAttributeChange(attrName, val)}
                    className={cn(
                      'px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                      selectedVal === val
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-steel-200 text-steel-600 hover:border-steel-300 hover:bg-steel-50'
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Length input for cladding panels (variant-based, has Cover Width but no Length variant) */}
        {(() => {
          const isCladding = !!(
            product.category?.slug?.includes('cladding') ||
            product.category?.name?.toLowerCase().includes('cladding')
          );
          const hasCoverWidth = !!variantAttributeOptions['Cover Width'];
          const hasLengthVariant = !!variantAttributeOptions['Length'];
          if (!isCladding || !hasCoverWidth || hasLengthVariant) return null;
          return (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-steel-700">
                Length (metres) <span className="text-red-500">*</span>
                <span className="ml-2 text-xs font-normal text-steel-400">Max 8m</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                max={8}
                value={length || ''}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  const val = !isNaN(raw) ? Math.min(raw, 8) : undefined;
                  setLength(val);
                }}
                placeholder="Enter length (0.1 – 8m)"
                className="w-full rounded-lg border border-steel-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          );
        })()}

        {/* Length input for roof sheets and per-metre products */}
        {(() => {
          const isRoofSheet = !!(product.category?.slug === 'roof-sheets' || product.category?.name?.toLowerCase().includes('roof sheet'));
          const isPerMetre = product.pricingModel === 'per_metre';
          if (!isRoofSheet && !isPerMetre) return null;
          return (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-steel-700">
                Length (metres)              </label>
              <input
                type="number"
                step="0.1"
                min={0.4}
                max={13}
                value={length || ''}
                onChange={(e) => {
                  const raw = parseFloat(e.target.value);
                  const val = !isNaN(raw) ? Math.min(raw, 13) : undefined;
                  setLength(val);
                  setSelectedAttributes((prev) => ({ ...prev, '_userLength': val ? String(val) : '' }));
                }}
                placeholder="Min 0.4m — Max 13m"
                className="w-full max-w-xs rounded-lg border border-steel-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-steel-400">Range: 0.4m — 13m</p>
            </div>
          );
        })()}

        {/* Quantity */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-steel-700">Quantity</label>
          <div className="flex items-center rounded-lg border border-steel-300 w-fit">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-steel-600 hover:bg-steel-50">-</button>
            <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 border-x border-steel-300 text-center py-2 text-sm" />
            <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-steel-600 hover:bg-steel-50">+</button>
          </div>
        </div>

        {/* Price display */}
        {(() => {
          const isRoofSheet = !!(product.category?.slug === 'roof-sheets' || product.category?.name?.toLowerCase().includes('roof sheet'));
          const isCladdingProduct = !!(
            product.category?.slug?.includes('cladding') ||
            product.category?.name?.toLowerCase().includes('cladding')
          );
          const hasCoverWidthVariant = !!variantAttributeOptions['Cover Width'];
          const isCladdingPerMetre = isCladdingProduct && hasCoverWidthVariant;
          const isPerMetre = !!(isRoofSheet || product.pricingModel === 'per_metre');
          const pricePerUnit = matchedVariant?.priceOverride || 0;
          const userLen = parseFloat(selectedAttributes['_userLength'] || '') || 0;

          // Determine matched variant's length in metres
          const matchedLenAttr = matchedVariant?.attributes.find((a: any) => a.attributeName === 'Length');
          const matchedLenCode = matchedLenAttr?.value || '';
          const matchedLenMetres = matchedLenCode ? (() => {
            const raw = parseFloat(matchedLenCode);
            const mm = raw > 100 ? raw : raw * 100;
            return (mm / 1000);
          })() : 0;

          // For cladding: price = unit × length × qty
          const claddingLen = length || 0;
          const linePrice = isCladdingPerMetre
            ? pricePerUnit * claddingLen
            : isPerMetre
              ? pricePerUnit * (matchedLenMetres || userLen || (length || 0))
              : pricePerUnit;
          const totalPrice = linePrice * quantity;

          const colVal = selectedColour || selectedAttributes['Colour'] || '';
          const displaySku = matchedVariant
            ? (colVal && !hasColourInVariants ? `${matchedVariant.sku}-${getColourCode(colVal)}` : matchedVariant.sku)
            : '';

          // For cladding, all required: matchedVariant + length > 0
          const claddingReady = isCladdingPerMetre ? (!!matchedVariant && claddingLen > 0) : true;

          return (
            <div className="rounded-xl bg-steel-50 p-5 border border-steel-100">
              {matchedVariant ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">SKU: {displaySku}</span>
                  </div>

                  {isCladdingPerMetre ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-steel-600">Unit price:</span>
                        <span className="text-sm font-medium text-steel-700">{formatCurrency(pricePerUnit)}/m</span>
                      </div>
                      {claddingLen > 0 && (
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-steel-600">{formatCurrency(pricePerUnit)} × {claddingLen}m:</span>
                          <span className="text-sm font-medium text-steel-700">{formatCurrency(linePrice)}</span>
                        </div>
                      )}
                      {claddingLen > 0 && quantity > 1 && (
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-steel-600">{formatCurrency(linePrice)} × {quantity} sheets:</span>
                          <span className="text-sm font-medium text-steel-700">{formatCurrency(totalPrice)}</span>
                        </div>
                      )}
                    </>
                  ) : isPerMetre ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-steel-600">Rate per metre:</span>
                        <span className="text-sm font-medium text-steel-700">{formatCurrency(pricePerUnit)}/m</span>
                      </div>
                      {(userLen || matchedLenMetres || length) ? (
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-steel-600">{formatCurrency(pricePerUnit)} × {userLen || matchedLenMetres || length}m:</span>
                          <span className="text-lg font-bold text-steel-900">{formatCurrency(linePrice)}</span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-steel-600">
                        {(product.category?.slug?.includes('dambuster') || product.category?.name?.toLowerCase().includes('dambuster'))
                          ? 'Unit price:'
                          : (userLen || matchedLenMetres) > 0 ? `Per ${userLen || matchedLenMetres}m sheet:` : 'Unit price:'}
                      </span>
                      <span className="text-lg font-bold text-steel-900">{formatCurrency(pricePerUnit)}</span>
                    </div>
                  )}

                  {!isCladdingPerMetre && quantity > 1 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-steel-600">Qty × {quantity}:</span>
                      <span className="font-medium text-steel-700">{formatCurrency(totalPrice)}</span>
                    </div>
                  )}

                  <div className="border-t border-steel-200 pt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-semibold text-steel-900">Total:</span>
                      <span className={cn('text-2xl font-bold', claddingReady ? 'text-steel-900' : 'text-steel-300')}>
                        {claddingReady ? formatCurrency(totalPrice) : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-steel-500 text-right mt-0.5">Excl. GST</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-steel-500 text-center py-2">
                  {selectedMaterial
                    ? 'Select all options to see the price'
                    : 'Select material and dimensions to see pricing'}
                </p>
              )}
            </div>
          );
        })()}

        {/* Actions */}
        {(() => {
          const isCladdingProduct = !!(
            product.category?.slug?.includes('cladding') ||
            product.category?.name?.toLowerCase().includes('cladding')
          );
          const hasCoverWidthVariant = !!variantAttributeOptions['Cover Width'];
          const isCladdingPerMetre = isCladdingProduct && hasCoverWidthVariant;
          const claddingReady = isCladdingPerMetre ? (!!matchedVariant && !!length && length > 0) : !!matchedVariant;
          return (
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                leftIcon={<ShoppingCart className="h-5 w-5" />}
                onClick={handleVariantAddToCart}
                disabled={!claddingReady}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<Zap className="h-5 w-5" />}
                onClick={() => { handleVariantAddToCart(); if (claddingReady) router.push('/cart'); }}
                disabled={!claddingReady}
              >
                Buy Now
              </Button>
            </div>
          );
        })()}

      </div>
      </>
    );
  }

  // ═══════════ CONFIGURABLE: PRICING-RULE-BASED (roofing sheets, etc.) ═══════════
  return (
    <div className="space-y-5">
      {/* Attribute selectors */}
      {product.configurableAttributes
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ca) => {
          const attr = ca.attribute;
          const filteredValues = getFilteredValues(ca);

          if (attr.type === 'color-swatch') {
            return (
              <div key={attr._id}>
                <label className="mb-2 block text-sm font-medium text-steel-700">
                  {attr.name}
                  {selectedAttributes[attr._id] && (
                    <span className="ml-2 font-normal text-steel-500">
                      — {filteredValues.find((v) => v.value === selectedAttributes[attr._id])?.label}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {filteredValues.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => handleAttributeChange(attr._id, v.value)}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                        selectedAttributes[attr._id] === v.value
                          ? 'border-brand-600 ring-2 ring-brand-200'
                          : 'border-steel-200 hover:border-steel-400'
                      )}
                      title={v.label}
                    >
                      <span className="h-7 w-7 rounded-full" style={{ backgroundColor: v.metadata?.hex || '#ccc' }} />
                    </button>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Select
              key={attr._id}
              label={`${attr.name}${ca.isRequired ? ' *' : ''}`}
              placeholder={`Select ${attr.name}`}
              options={filteredValues.map((v) => ({ value: v.value, label: v.label }))}
              value={selectedAttributes[attr._id] || ''}
              onChange={(e) => handleAttributeChange(attr._id, e.target.value)}
            />
          );
        })}

      {/* Length input for per_metre */}
      {needsLength && (
        <Input
          label="Length (metres) *"
          type="number"
          step="0.1"
          min={product.minLength || 0.1}
          max={product.maxLength || 20}
          placeholder={`Enter length${product.minLength ? ` (min ${product.minLength}m)` : ''}${product.maxLength ? ` (max ${product.maxLength}m)` : ''}`}
          value={length || ''}
          onChange={(e) => setLength(parseFloat(e.target.value) || undefined)}
          helperText={product.minLength || product.maxLength ? `Range: ${product.minLength || 0}m - ${product.maxLength || '∞'}m` : undefined}
        />
      )}

      {/* Quantity */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-steel-700">Quantity</label>
        <div className="flex items-center rounded-lg border border-steel-300 w-fit">
          <button onClick={() => setQuantity(Math.max(product.minimumOrderQty || 1, quantity - 1))} className="px-3 py-2 text-steel-600 hover:bg-steel-50">-</button>
          <input type="number" min={product.minimumOrderQty || 1} value={quantity} onChange={(e) => setQuantity(Math.max(product.minimumOrderQty || 1, parseInt(e.target.value) || 1))} className="w-16 border-x border-steel-300 text-center py-2 text-sm" />
          <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-steel-600 hover:bg-steel-50">+</button>
        </div>
        {product.minimumOrderQty && product.minimumOrderQty > 1 && (
          <p className="mt-1 text-xs text-steel-500">Min order: {product.minimumOrderQty}</p>
        )}
      </div>

      {/* Price display */}
      <div className="rounded-lg bg-steel-50 p-4 border border-steel-100">
        {isQuoteOnly ? (
          <div className="text-center">
            <p className="text-sm text-steel-600 mb-2">This product requires a quote</p>
            <Button variant="primary" size="lg" className="w-full">Request Quote</Button>
          </div>
        ) : isCalculating ? (
          <div className="flex items-center justify-center gap-2 py-2 text-steel-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Calculating price...</span>
          </div>
        ) : priceError ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{priceError}</span>
          </div>
        ) : priceData ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-steel-600">Rate{product.pricingModel === 'per_metre' ? ' per metre' : ''}:</span>
              <span className="font-medium">{formatCurrency(priceData.calculatedRate)}</span>
            </div>
            {priceData.length && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-steel-600">Length:</span>
                <span className="font-medium">{priceData.length}m</span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-steel-600">Unit price:</span>
              <span className="font-medium">{formatCurrency(priceData.unitPrice)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-steel-600">Quantity:</span>
              <span className="font-medium">x {priceData.quantity}</span>
            </div>
            {(priceData.quantityDiscount ?? 0) > 0 && (
              <div className="flex items-baseline justify-between text-green-600">
                <span className="text-sm">Volume discount:</span>
                <span className="font-medium">-{formatCurrency(priceData.quantityDiscount!)}/ea</span>
              </div>
            )}
            {(priceData.tradeDiscount ?? 0) > 0 && (
              <div className="flex items-baseline justify-between text-green-600">
                <span className="text-sm">Trade discount:</span>
                <span className="font-medium">-{formatCurrency(priceData.tradeDiscount!)}/ea</span>
              </div>
            )}
            <div className="border-t border-steel-200 pt-2 mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-base font-semibold text-steel-900">Total:</span>
                <span className="text-2xl font-bold text-steel-900">{formatCurrency(priceData.lineTotal)}</span>
              </div>
              <p className="text-xs text-steel-500 text-right mt-0.5">Excl. GST</p>
            </div>
          </div>
        ) : !isConfigComplete ? (
          <p className="text-sm text-steel-500 text-center py-2">Select all options to see the price</p>
        ) : null}
      </div>

      {/* Actions */}
      {!isQuoteOnly && (
        <div className="flex gap-3">
          <Button size="lg" className="flex-1" leftIcon={<ShoppingCart className="h-5 w-5" />} onClick={handleAddToCart} disabled={!priceData || isCalculating}>
            Add to Cart
          </Button>
          <Button variant="outline" size="lg" leftIcon={<Zap className="h-5 w-5" />} disabled={!priceData || isCalculating} onClick={() => { handleAddToCart(); if (isAuthenticated) router.push('/cart'); }}>
            Buy Now
          </Button>
        </div>
      )}
    </div>
  );
}
