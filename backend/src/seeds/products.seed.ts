import Category from '../models/Category';
import Attribute from '../models/Attribute';
import Product from '../models/Product';
import PricingRule from '../models/PricingRule';

export const seedProducts = async () => {
  const roofSheetsCategory = await Category.findOne({ slug: 'roof-sheets' });
  const claddingCategory = await Category.findOne({ slug: 'cladding-panels' });
  const fasciaCategory = await Category.findOne({ slug: 'fascia-gutter-products' });
  const screwsCategory = await Category.findOne({ slug: 'screws' });
  const roofingCategory = await Category.findOne({ slug: 'roofing' });
  const claddingParent = await Category.findOne({ slug: 'cladding' });
  const fasciaParent = await Category.findOne({ slug: 'fascia-gutter' });
  const accessoriesCategory = await Category.findOne({ slug: 'accessories' });

  const finishAttr = await Attribute.findOne({ slug: 'finish-category' });
  const colourAttr = await Attribute.findOne({ slug: 'colour' });
  const thicknessAttr = await Attribute.findOne({ slug: 'thickness' });

  if (!roofSheetsCategory || !finishAttr || !colourAttr || !thicknessAttr) {
    console.log('Required seed dependencies not found. Seed categories and attributes first.');
    return;
  }

  // --- Product 1: 5-Ribsheet (Configurable, per_metre) ---
  const ribsheet = await Product.findOneAndUpdate(
    { sku: 'RS-5RIB' },
    {
      name: '5-Ribsheet',
      slug: '5-ribsheet',
      sku: 'RS-5RIB',
      type: 'configurable',
      status: 'active',
      category: roofSheetsCategory._id,
      categories: [roofSheetsCategory._id, roofingCategory?._id].filter(Boolean),
      tags: ['roofing', 'ribsheet', 'colorbond', 'popular'],
      shortDescription: 'Premium 5-Rib roofing sheet with excellent strength and weather resistance. Available in all Colorbond colours.',
      description: '<h3>5-Ribsheet Roofing Profile</h3><p>The 5-Ribsheet is one of the most popular roofing profiles in Australia. It provides excellent coverage, strength and is suitable for both residential and commercial applications.</p><h4>Features</h4><ul><li>5-rib profile for superior strength</li><li>Available in 0.42mm and 0.48mm BMT</li><li>Full Colorbond, Matt and Ultra colour range</li><li>Cut to length for minimal waste</li><li>Suitable for roofing and walling</li></ul>',
      images: [
        { url: '/images/products/5-ribsheet-monument.jpg', alt: '5-Ribsheet Monument', sortOrder: 0, isDefault: true, publicId: '' },
      ],
      configurableAttributes: [
        { attribute: finishAttr._id, isRequired: true, sortOrder: 1, allowedValues: ['colorbond', 'galvanised', 'matt_colorbond', 'ultra', 'zinc'] },
        { attribute: colourAttr._id, isRequired: true, sortOrder: 2, allowedValues: ['dover-white', 'surfmist', 'southerly', 'shale-grey', 'bluegum', 'windspray', 'basalt', 'classic-cream', 'paperbark', 'evening-haze', 'dune', 'gully', 'jasper', 'manor-red', 'wallaby', 'woodland-grey', 'pale-eucalypt', 'cottage-green', 'ironstone', 'deep-ocean', 'night-sky', 'monument', 'matt-monument', 'matt-basalt', 'ultra-monument', 'ultra-basalt', 'galvanised-steel', 'natural-zinc'] },
        { attribute: thicknessAttr._id, isRequired: true, sortOrder: 3, allowedValues: ['0.42', '0.48'] },
      ],
      pricingModel: 'per_metre',
      isVisible: true,
      isFeatured: true,
      availableTo: 'all',
      minimumOrderQty: 1,
      minLength: 0.5,
      maxLength: 12,
      specifications: {
        'Coverage Width': '762mm',
        'Overall Width': '815mm',
        'Rib Height': '29mm',
        'Material': 'Zincalume / Colorbond Steel',
        'Standard': 'AS 1397',
      },
    },
    { upsert: true, new: true }
  );

  // Pricing rule for 5-Ribsheet
  await PricingRule.findOneAndUpdate(
    { product: ribsheet._id, name: 'Standard Pricing' },
    {
      product: ribsheet._id,
      name: 'Standard Pricing',
      baseRate: 14.50,
      modifiers: [
        {
          type: 'thickness',
          label: '0.48mm thickness upgrade',
          condition: { attribute: thicknessAttr._id, value: '0.48' },
          adjustmentType: 'multiplier',
          adjustmentValue: 1.18,
        },
        {
          type: 'finish',
          label: 'Matt Colorbond finish',
          condition: { attribute: finishAttr._id, value: 'matt_colorbond' },
          adjustmentType: 'fixed_add',
          adjustmentValue: 2.50,
        },
        {
          type: 'finish',
          label: 'Ultra finish',
          condition: { attribute: finishAttr._id, value: 'ultra' },
          adjustmentType: 'fixed_add',
          adjustmentValue: 4.00,
        },
        {
          type: 'finish',
          label: 'Galvanised finish',
          condition: { attribute: finishAttr._id, value: 'galvanised' },
          adjustmentType: 'multiplier',
          adjustmentValue: 0.85,
        },
        {
          type: 'finish',
          label: 'Zinc finish',
          condition: { attribute: finishAttr._id, value: 'zinc' },
          adjustmentType: 'multiplier',
          adjustmentValue: 0.90,
        },
      ],
      quantityBreaks: [
        { minQty: 10, maxQty: 24, discountType: 'percentage', discountValue: 3 },
        { minQty: 25, maxQty: 49, discountType: 'percentage', discountValue: 5 },
        { minQty: 50, maxQty: null, discountType: 'percentage', discountValue: 8 },
      ],
      tradePriceModifier: {
        adjustmentType: 'percentage_discount',
        adjustmentValue: 10,
      },
      isActive: true,
      priority: 1,
    },
    { upsert: true, new: true }
  );

  // --- Product 2: Corrugated Roof Sheet (Configurable, per_metre) ---
  const corrugated = await Product.findOneAndUpdate(
    { sku: 'RS-CORR' },
    {
      name: 'Corrugated',
      slug: 'corrugated',
      sku: 'RS-CORR',
      type: 'configurable',
      status: 'active',
      category: roofSheetsCategory._id,
      categories: [roofSheetsCategory._id, roofingCategory?._id].filter(Boolean),
      tags: ['roofing', 'corrugated', 'colorbond', 'classic'],
      shortDescription: 'Classic corrugated roofing profile. Iconic Australian roofing style with proven performance.',
      description: '<h3>Corrugated Roofing Profile</h3><p>The classic corrugated profile has been a staple of Australian roofing for generations. Available in the full Colorbond colour range.</p>',
      images: [
        { url: '/images/products/corrugated-surfmist.jpg', alt: 'Corrugated Surfmist', sortOrder: 0, isDefault: true, publicId: '' },
      ],
      configurableAttributes: [
        { attribute: finishAttr._id, isRequired: true, sortOrder: 1, allowedValues: ['colorbond', 'galvanised', 'matt_colorbond', 'zinc'] },
        { attribute: colourAttr._id, isRequired: true, sortOrder: 2, allowedValues: ['dover-white', 'surfmist', 'southerly', 'shale-grey', 'bluegum', 'windspray', 'basalt', 'classic-cream', 'paperbark', 'evening-haze', 'dune', 'gully', 'jasper', 'manor-red', 'wallaby', 'woodland-grey', 'pale-eucalypt', 'cottage-green', 'ironstone', 'deep-ocean', 'night-sky', 'monument', 'galvanised-steel', 'natural-zinc'] },
        { attribute: thicknessAttr._id, isRequired: true, sortOrder: 3, allowedValues: ['0.42', '0.48'] },
      ],
      pricingModel: 'per_metre',
      isVisible: true,
      isFeatured: true,
      availableTo: 'all',
      minimumOrderQty: 1,
      minLength: 0.5,
      maxLength: 12,
    },
    { upsert: true, new: true }
  );

  await PricingRule.findOneAndUpdate(
    { product: corrugated._id, name: 'Standard Pricing' },
    {
      product: corrugated._id,
      name: 'Standard Pricing',
      baseRate: 13.80,
      modifiers: [
        {
          type: 'thickness',
          label: '0.48mm thickness upgrade',
          condition: { attribute: thicknessAttr._id, value: '0.48' },
          adjustmentType: 'multiplier',
          adjustmentValue: 1.18,
        },
        {
          type: 'finish',
          label: 'Galvanised finish',
          condition: { attribute: finishAttr._id, value: 'galvanised' },
          adjustmentType: 'multiplier',
          adjustmentValue: 0.82,
        },
      ],
      quantityBreaks: [
        { minQty: 10, maxQty: 49, discountType: 'percentage', discountValue: 3 },
        { minQty: 50, maxQty: null, discountType: 'percentage', discountValue: 7 },
      ],
      tradePriceModifier: {
        adjustmentType: 'percentage_discount',
        adjustmentValue: 10,
      },
      isActive: true,
      priority: 1,
    },
    { upsert: true, new: true }
  );

  // --- Product 3: Wallclad Panel (Configurable, per_metre) ---
  if (claddingCategory) {
    const wallclad = await Product.findOneAndUpdate(
      { sku: 'CL-WALL' },
      {
        name: 'Wallclad Panel',
        slug: 'wallclad-panel',
        sku: 'CL-WALL',
        type: 'configurable',
        status: 'active',
        category: claddingCategory._id,
        categories: [claddingCategory._id, claddingParent?._id].filter(Boolean),
        tags: ['cladding', 'wall', 'colorbond'],
        shortDescription: 'Versatile wall cladding panel for commercial and residential applications.',
        description: '<p>The Wallclad Panel is a flat-profile wall cladding sheet suitable for a wide range of exterior and interior applications.</p>',
        images: [
          { url: '/images/products/wallclad-panel.jpg', alt: 'Wallclad Panel', sortOrder: 0, isDefault: true, publicId: '' },
        ],
        configurableAttributes: [
          { attribute: finishAttr._id, isRequired: true, sortOrder: 1, allowedValues: ['colorbond', 'matt_colorbond'] },
          { attribute: colourAttr._id, isRequired: true, sortOrder: 2, allowedValues: ['dover-white', 'surfmist', 'shale-grey', 'basalt', 'paperbark', 'dune', 'woodland-grey', 'monument', 'matt-monument', 'matt-basalt'] },
          { attribute: thicknessAttr._id, isRequired: true, sortOrder: 3, allowedValues: ['0.42', '0.48'] },
        ],
        pricingModel: 'per_metre',
        isVisible: true,
        isFeatured: false,
        availableTo: 'all',
        minimumOrderQty: 1,
        minLength: 0.5,
        maxLength: 8,
      },
      { upsert: true, new: true }
    );

    await PricingRule.findOneAndUpdate(
      { product: wallclad._id, name: 'Standard Pricing' },
      {
        product: wallclad._id,
        name: 'Standard Pricing',
        baseRate: 15.20,
        modifiers: [
          {
            type: 'thickness',
            label: '0.48mm thickness upgrade',
            condition: { attribute: thicknessAttr._id, value: '0.48' },
            adjustmentType: 'multiplier',
            adjustmentValue: 1.15,
          },
        ],
        quantityBreaks: [],
        tradePriceModifier: { adjustmentType: 'percentage_discount', adjustmentValue: 8 },
        isActive: true,
        priority: 1,
      },
      { upsert: true, new: true }
    );
  }

  // --- Product 4: Quad Gutter (Configurable, per_metre) ---
  if (fasciaCategory) {
    const quadGutter = await Product.findOneAndUpdate(
      { sku: 'FG-QUAD' },
      {
        name: 'Quad Gutter',
        slug: 'quad-gutter',
        sku: 'FG-QUAD',
        type: 'configurable',
        status: 'active',
        category: fasciaCategory._id,
        categories: [fasciaCategory._id, fasciaParent?._id].filter(Boolean),
        tags: ['gutter', 'quad', 'rainwater'],
        shortDescription: 'Popular Quad Gutter profile for residential and light commercial applications.',
        description: '<p>The Quad Gutter is the most popular gutter profile in Australia. Suits residential roofing with a clean, modern look.</p>',
        images: [
          { url: '/images/products/quad-gutter.jpg', alt: 'Quad Gutter', sortOrder: 0, isDefault: true, publicId: '' },
        ],
        configurableAttributes: [
          { attribute: finishAttr._id, isRequired: true, sortOrder: 1, allowedValues: ['colorbond', 'galvanised', 'zinc'] },
          { attribute: colourAttr._id, isRequired: true, sortOrder: 2, allowedValues: ['dover-white', 'surfmist', 'shale-grey', 'basalt', 'paperbark', 'dune', 'woodland-grey', 'monument', 'windspray', 'galvanised-steel', 'natural-zinc'] },
        ],
        pricingModel: 'per_metre',
        isVisible: true,
        isFeatured: true,
        availableTo: 'all',
        minimumOrderQty: 1,
        minLength: 1,
        maxLength: 6,
      },
      { upsert: true, new: true }
    );

    await PricingRule.findOneAndUpdate(
      { product: quadGutter._id, name: 'Standard Pricing' },
      {
        product: quadGutter._id,
        name: 'Standard Pricing',
        baseRate: 12.50,
        modifiers: [
          {
            type: 'finish',
            label: 'Galvanised',
            condition: { attribute: finishAttr._id, value: 'galvanised' },
            adjustmentType: 'multiplier',
            adjustmentValue: 0.80,
          },
        ],
        quantityBreaks: [],
        tradePriceModifier: { adjustmentType: 'percentage_discount', adjustmentValue: 10 },
        isActive: true,
        priority: 1,
      },
      { upsert: true, new: true }
    );
  }

  // --- Product 5: Roofing Screws (Simple, fixed price) ---
  if (screwsCategory) {
    await Product.findOneAndUpdate(
      { sku: 'ACC-SCRW-HEX' },
      {
        name: 'Hex Head Roofing Screws (Box of 500)',
        slug: 'hex-head-roofing-screws-500',
        sku: 'ACC-SCRW-HEX',
        type: 'simple',
        status: 'active',
        category: screwsCategory._id,
        categories: [screwsCategory._id, accessoriesCategory?._id].filter(Boolean),
        tags: ['screws', 'fixings', 'roofing'],
        shortDescription: 'Type 17 hex head self-drilling screws for roofing and cladding. Box of 500.',
        description: '<p>High quality Type 17 hex head self-drilling roofing screws. Suitable for fixing metal roofing and cladding sheets to timber or steel purlins.</p>',
        images: [
          { url: '/images/products/roofing-screws.jpg', alt: 'Roofing Screws', sortOrder: 0, isDefault: true, publicId: '' },
        ],
        price: 65.00,
        compareAtPrice: 79.00,
        pricingModel: null,
        isVisible: true,
        isFeatured: false,
        availableTo: 'all',
        stock: 250,
        trackInventory: true,
      },
      { upsert: true, new: true }
    );
  }

  console.log('Seeded 5 sample products with pricing rules');
};
