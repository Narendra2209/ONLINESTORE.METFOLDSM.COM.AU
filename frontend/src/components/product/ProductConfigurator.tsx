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
import { ShoppingCart, Zap, Loader2, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductConfiguratorProps {
  product: Product;
}

// Dimension attribute names that store codes (value × 100 = mm)
const DIMENSION_ATTRS = ['Length', 'Width', 'Depth'];

// Preferred display order for variant attributes
const ATTR_ORDER = ['Material', 'Colour', 'Thickness', 'Width', 'Length', 'Depth'];

// Colours available per material
const MATERIAL_COLOURS: Record<string, { name: string; hex: string }[]> = {
  'Colorbond': [
    { name: 'Basalt', hex: '#646560' },
    { name: 'Classic Cream', hex: '#E8D8A8' },
    { name: 'Cottage Green', hex: '#3A5243' },
    { name: 'Cove', hex: '#3D5C5E' },
    { name: 'Deep Ocean', hex: '#1B3A4B' },
    { name: 'Dover White', hex: '#E8E4D8' },
    { name: 'Dune', hex: '#B5A78C' },
    { name: 'Evening Haze', hex: '#C5BAA8' },
    { name: 'Gully', hex: '#5B6B52' },
    { name: 'Ironstone', hex: '#4A3C30' },
    { name: 'Jasper', hex: '#5C3A2E' },
    { name: 'Mangrove', hex: '#4B5340' },
    { name: 'Manor Red', hex: '#7B2D26' },
    { name: 'Monument', hex: '#35393B' },
    { name: 'Night Sky', hex: '#1E2326' },
    { name: 'Pale Eucalypt', hex: '#8DA07E' },
    { name: 'Paperbark', hex: '#C5B9A0' },
    { name: 'Shale Grey', hex: '#A8A49C' },
    { name: 'Southerly', hex: '#969E98' },
    { name: 'Surfmist', hex: '#DDD9CE' },
    { name: 'Terrain', hex: '#7A6E5E' },
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
  const { addItem } = useCartStore();
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

    // Get all user-selectable attributes (Material, Colour, Length, etc.)
    // Exclude non-selectable metadata like Finish Category
    const selectableAttrNames = Object.keys(variantAttributeOptions).filter(
      (name) => name !== 'Finish Category'
    );
    const allSelected = selectableAttrNames.every((name) => selectedAttributes[name]);
    if (!allSelected) return null;

    // Find variant where all selected attributes match
    // (variant may have extra attributes like Finish Category that we ignore)
    return product.variants.find((v) =>
      selectableAttrNames.every((name) => {
        const varAttr = v.attributes.find((a) => a.attributeName === name);
        return varAttr && varAttr.value === selectedAttributes[name];
      })
    ) || null;
  }, [isVariantBased, product.variants, selectedAttributes, variantAttributeOptions]);

  // Filter available values based on current selections (cascading)
  const getAvailableValues = (attrName: string): string[] => {
    if (!product.variants) return [];

    // Get all other selected attributes (not the current one)
    const otherSelections = Object.entries(selectedAttributes).filter(([k]) => k !== attrName);

    // Filter variants that match the other selections
    const matchingVariants = product.variants.filter((v) =>
      otherSelections.every(([name, value]) =>
        v.attributes.some((a) => a.attributeName === name && a.value === value)
      )
    );

    // Extract unique values for this attribute from matching variants
    const values = new Set<string>();
    for (const v of matchingVariants) {
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

    // Get selected material for colour filtering
    const selectedMaterial = selectedAttributes['Material'] || '';
    const hasMaterialVariation = variantAttributeOptions['Material'] && variantAttributeOptions['Material'].values.size > 1;

    // Filter material colours to ONLY those that exist in actual variant data
    const materialColours = useMemo(() => {
      if (!selectedMaterial) return [];
      const displayColours = MATERIAL_COLOURS[selectedMaterial] || [];
      // Get actual colour values from variants that have this material
      const actualColours = new Set<string>();
      for (const v of product.variants || []) {
        const hasMat = v.attributes.some((a) => a.attributeName === 'Material' && a.value === selectedMaterial);
        if (hasMat) {
          const col = v.attributes.find((a) => a.attributeName === 'Colour');
          if (col) actualColours.add(col.value);
        }
      }
      // Only show colours from the display list that actually exist in variants
      // If no exact match in MATERIAL_COLOURS, also include any actual colours not in the display list
      const filtered = displayColours.filter((c) => actualColours.has(c.name));
      // Add any actual variant colours missing from MATERIAL_COLOURS (with default hex)
      for (const colName of Array.from(actualColours)) {
        if (!filtered.some((c) => c.name === colName)) {
          const allKnown = Object.values(MATERIAL_COLOURS).flat();
          const known = allKnown.find((c) => c.name.toLowerCase() === colName.toLowerCase());
          filtered.push({ name: colName, hex: known?.hex || '#808080' });
        }
      }
      return filtered;
    }, [selectedMaterial, product.variants]);

    // For products without Material variation (screws, rivets), build colour list from variants
    const standaloneColours = useMemo(() => {
      if (hasMaterialVariation || !variantAttributeOptions['Colour']) return [];
      const colourValues = Array.from(variantAttributeOptions['Colour'].values);
      // Try to find hex codes from all material colour lists
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

    // When material changes, auto-set the Colour variant attribute and reset dimensions
    const handleMaterialSelect = (material: string) => {
      // Find colour values directly from variants with this material (avoids stale-state bug)
      const colourValuesForMaterial = new Set<string>();
      for (const v of product.variants || []) {
        const hasMat = v.attributes.some((a) => a.attributeName === 'Material' && a.value === material);
        if (hasMat) {
          const col = v.attributes.find((a) => a.attributeName === 'Colour');
          if (col) colourValuesForMaterial.add(col.value);
        }
      }
      const matchingColour = Array.from(colourValuesForMaterial)[0] || '';

      // Reset to only Material + Colour — clear dimensions so cascading filter starts fresh
      const newAttrs: Record<string, string> = { Material: material };
      if (matchingColour) newAttrs['Colour'] = matchingColour;

      setSelectedAttributes(newAttrs);
      setSelectedColour('');
    };

    // Override handleAddToCart to include selectedColour
    const handleVariantAddToCart = () => {
      if (!matchedVariant) return;

      const attrEntries = matchedVariant.attributes
        .filter((a) => a.attributeName !== 'Colour')
        .map((a) => ({ attributeName: a.attributeName, value: a.value }));
      if (selectedColour) {
        attrEntries.push({ attributeName: 'Colour', value: selectedColour });
      }

      const isRoofSheet = !!(product.category?.slug === 'roof-sheets' || product.category?.name?.toLowerCase().includes('roof sheet'));
      const effectiveLength = isRoofSheet ? (length || 0) : 1;
      const unitPriceVal = matchedVariant.priceOverride!;

      if (isRoofSheet && (!length || length < 0.4)) {
        toast.error('Please enter length (min 0.4m, max 13m)');
        return;
      }

      if (isRoofSheet && length) {
        attrEntries.push({ attributeName: 'Length', value: `${length}m` });
      }

      addItem({
        _id: '',
        product: {
          _id: product._id, name: product.name, slug: product.slug,
          sku: matchedVariant.sku,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt })),
        },
        selectedAttributes: attrEntries,
        pricingModel: isRoofSheet ? 'per_metre' : 'per_piece',
        unitPrice: unitPriceVal,
        length: isRoofSheet ? length : undefined,
        quantity,
        lineTotal: unitPriceVal * effectiveLength * quantity,
      });
      toast.success('Added to cart');
    };

    return (
      <div className="space-y-5">
        {/* 1. MATERIAL selector */}
        {variantAttributeOptions['Material'] && variantAttributeOptions['Material'].values.size > 1 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-steel-700">
              Material <span className="text-red-500">*</span>
              {selectedMaterial && (
                <span className="ml-2 font-normal text-steel-500">— {selectedMaterial}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {Array.from(variantAttributeOptions['Material'].values).map((mat) => (
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

        {/* 2a. COLOUR selector — standalone for products without Material variation */}
        {!hasMaterialVariation && standaloneColours.length > 1 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-steel-700">
              Colour <span className="text-red-500">*</span>
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
              Colour <span className="text-red-500">*</span>
              {selectedColour && (
                <span className="ml-2 font-normal text-steel-500">— {selectedColour}</span>
              )}
              <span className="ml-2 font-normal text-steel-400 text-xs">({materialColours.length} colours)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {materialColours.map((colour) => (
                <button
                  key={colour.name}
                  onClick={() => { setSelectedColour(colour.name); setSelectedAttributes((prev) => ({ ...prev, Colour: colour.name })); }}
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
          // Skip Length for roof sheets — handled by separate length input
          const _isRoof = !!(product.category?.slug === 'roof-sheets' || product.category?.name?.toLowerCase().includes('roof'));
          if (_isRoof && attrName === 'Length') return null;

          const availableValues = getAvailableValues(attrName);
          const selectedVal = selectedAttributes[attrName] || '';
          const totalValues = variantAttributeOptions[attrName]?.values;

          // Hide if single value across ALL variants
          if (totalValues && totalValues.size <= 1) return null;

          const isDim = isDimensionAttr(attrName);

          // Length attribute — free input in metres, show approx matched value
          if (attrName === 'Length') {
            // Convert stored values to metres for quick buttons
            const metreValues = availableValues.map((v) => {
              const raw = parseFloat(v);
              const mm = raw > 100 ? raw : raw * 100;
              return { code: v, metres: (mm / 1000).toFixed(1) };
            }).sort((a, b) => parseFloat(a.metres) - parseFloat(b.metres));

            // User's typed value (stored as custom key)
            const userTyped = selectedAttributes['_userLength'] || '';

            // Find the closest available value to what user typed
            const findClosest = (mInput: string) => {
              if (availableValues.length === 0) return '';
              const mmVal = parseFloat(mInput) * 1000;
              return availableValues.reduce((prev, curr) => {
                const prevMm = parseFloat(prev) > 100 ? parseFloat(prev) : parseFloat(prev) * 100;
                const currMm = parseFloat(curr) > 100 ? parseFloat(curr) : parseFloat(curr) * 100;
                return Math.abs(currMm - mmVal) < Math.abs(prevMm - mmVal) ? curr : prev;
              });
            };

            const closestCode = userTyped ? findClosest(userTyped) : selectedVal;
            const closestMetres = closestCode ? (() => {
              const raw = parseFloat(closestCode);
              const mm = raw > 100 ? raw : raw * 100;
              return (mm / 1000).toFixed(1);
            })() : '';

            return (
              <div key={attrName}>
                <label className="mb-2 block text-sm font-semibold text-steel-700">
                  Length (metres) <span className="text-red-500">*</span>
                  {userTyped && (
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
                    setSelectedAttributes((prev) => ({ ...prev, '_userLength': mInput }));
                    if (!mInput) { handleAttributeChange(attrName, ''); return; }
                    const closest = findClosest(mInput);
                    // Use closest if available, otherwise store the raw mm value
                    handleAttributeChange(attrName, closest || String(parseFloat(mInput) * 1000));
                  }}
                  className="w-full rounded-lg border-2 border-steel-200 px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                {userTyped && closestMetres && userTyped !== closestMetres && (
                  <p className="mt-1 text-xs text-amber-600">
                    ≈ Priced at nearest available: <span className="font-bold">{closestMetres}m</span>
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {metreValues.map(({ code, metres }) => (
                    <button
                      key={code}
                      onClick={() => {
                        handleAttributeChange(attrName, code);
                        setSelectedAttributes((prev) => ({ ...prev, '_userLength': metres }));
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                        selectedVal === code
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-steel-200 text-steel-500 hover:border-steel-300'
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

            return (
              <div key={attrName}>
                <label className="mb-2 block text-sm font-semibold text-steel-700">
                  {attrName} (mm) <span className="text-red-500">*</span>
                  {displayMm && !isInvalid && (
                    <span className="ml-2 font-normal text-steel-500">— {displayMm}mm</span>
                  )}
                </label>
                <input
                  type="number"
                  min={mmNums[0]}
                  max={mmNums[mmNums.length - 1]}
                  step={50}
                  value={displayMm}
                  placeholder={`Enter ${attrName.toLowerCase()} (${mmNums[0]}mm – ${mmNums[mmNums.length - 1]}mm)`}
                  onChange={(e) => {
                    const mmInput = e.target.value;
                    if (!mmInput) { handleAttributeChange(attrName, ''); return; }
                    handleAttributeChange(attrName, mmToCode(mmInput));
                  }}
                  className={cn(
                    'w-full rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-brand-500',
                    isInvalid
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : selectedVal && availableValues.includes(selectedVal)
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-steel-200 text-steel-600'
                  )}
                />
                {isInvalid && (
                  <p className="mt-1 text-xs text-red-500">
                    Not a standard size. Available: {mmValues.map((v) => `${v.mm}mm`).join(', ')}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mmValues.map(({ code, mm }) => (
                    <button
                      key={code}
                      onClick={() => handleAttributeChange(attrName, code)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
                        selectedVal === code
                          ? 'border-brand-600 bg-brand-50 text-brand-700'
                          : 'border-steel-200 text-steel-500 hover:border-steel-300'
                      )}
                    >
                      {mm}mm
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
                {attrName} <span className="text-red-500">*</span>
                {selectedVal && (
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

        {/* Length input for roof sheets and per-metre products */}
        {(() => {
          const isRoofSheet = !!(product.category?.slug === 'roof-sheets' || product.category?.name?.toLowerCase().includes('roof sheet'));
          const isPerMetre = product.pricingModel === 'per_metre';
          if (!isRoofSheet && !isPerMetre) return null;
          return (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-steel-700">
                Length (metres) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min={0.4}
                max={13}
                value={length || ''}
                onChange={(e) => setLength(parseFloat(e.target.value) || undefined)}
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
          const needsLen = !!(isRoofSheet || product.pricingModel === 'per_metre');
          const pricePerUnit = matchedVariant?.priceOverride || 0;
          const effectiveLength = needsLen ? (length || 0) : 1;
          const linePrice = pricePerUnit * effectiveLength;
          const totalPrice = linePrice * quantity;

          return (
        <div className="rounded-xl bg-steel-50 p-5 border border-steel-100">
          {matchedVariant ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span className="font-medium">SKU: {matchedVariant.sku}</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-steel-600">{needsLen ? 'Price per metre:' : 'Unit price:'}</span>
                <span className="text-lg font-bold text-steel-900">
                  {formatCurrency(pricePerUnit)}{needsLen ? '/m' : ''}
                </span>
              </div>

              {needsLen && length && length > 0 && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-steel-600">{formatCurrency(pricePerUnit)} × {length}m:</span>
                  <span className="font-medium text-steel-700">
                    {formatCurrency(linePrice)}
                  </span>
                </div>
              )}

              {quantity > 1 && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-steel-600">Qty × {quantity}:</span>
                  <span className="font-medium text-steel-700">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              )}

              <div className="border-t border-steel-200 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-semibold text-steel-900">Total:</span>
                  <span className="text-2xl font-bold text-steel-900">
                    {needsLen && (!length || length <= 0) ? '$0.00' : formatCurrency(totalPrice)}
                  </span>
                </div>
                <p className="text-xs text-steel-500 text-right mt-0.5">Excl. GST</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-steel-500 text-center py-2">
              {selectedMaterial
                ? 'Select all dimensions to see the price'
                : 'Select material and dimensions to see pricing'}
            </p>
          )}
        </div>
          );
        })()}

        {/* Actions */}
        <div className="flex gap-3">
          {(
            <>
              <Button size="lg" className="flex-1" leftIcon={<ShoppingCart className="h-5 w-5" />} onClick={handleVariantAddToCart} disabled={!matchedVariant}>
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" leftIcon={<Zap className="h-5 w-5" />} disabled={!matchedVariant} onClick={() => { handleVariantAddToCart(); if (isAuthenticated) router.push('/cart'); }}>
                Buy Now
              </Button>
            </>
          )}
        </div>
      </div>
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
                  {ca.isRequired && <span className="text-red-500 ml-1">*</span>}
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
