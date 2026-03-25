import ExcelJS from 'exceljs';
import crypto from 'crypto';
import Product from '../models/Product';
import ProductVariant from '../models/ProductVariant';
import Category from '../models/Category';
import Attribute from '../models/Attribute';
import ImportJob from '../models/ImportJob';
import { generateSlug } from '../utils/helpers';
import { ApiError } from '../utils/ApiError';

// Only SKU is strictly required — category comes from sheet name, name can be derived
const REQUIRED_COLUMNS = ['sku'];

// Map common column name variations to standard names
const COLUMN_ALIASES: Record<string, string> = {
  'product_name': 'product_name',
  'productname': 'product_name',
  'product name': 'product_name',
  'products_name': 'product_name',
  'products_names': 'product_name',
  'products name': 'product_name',
  'products names': 'product_name',
  'productsname': 'product_name',
  'productsnames': 'product_name',
  'name': 'product_name',
  'title': 'product_name',
  'product_title': 'product_name',
  'item_class': 'product_name',
  'item class': 'product_name',
  'itemclass': 'product_name',
  'sku': 'sku',
  'sku_code': 'sku',
  'product_sku': 'sku',
  'item_code': 'sku',
  'item code': 'sku',
  'inventory_id': 'sku',
  'inventoryid': 'sku',
  'inventory id': 'sku',
  'inventory_code': 'sku',
  'product_id': 'sku',
  'product_code': 'sku',
  'code': 'sku',
  'id': 'sku',
  'category': 'category',
  'product_category': 'category',
  'main_category': 'category',
  'product_type': 'product_type',
  'producttype': 'product_type',
  'subcategory': 'subcategory',
  'sub_category': 'subcategory',
  'description': 'description',
  'product_description': 'description',
  'short_description': 'short_description',
  'shortdescription': 'short_description',
  'material': 'material',
  'base_price': 'base_price',
  'price': 'base_price',
  'unit_price': 'base_price',
  'baseprice': 'base_price',
  'sell_price': 'base_price',
  'sell': 'base_price',
  'selling_price': 'base_price',
  'retail_price': 'base_price',
  'retail': 'base_price',
  'cost': 'base_price',
  'cost_price': 'base_price',
  'rate': 'base_price',
  'amount': 'base_price',
  'unit_cost': 'base_price',
  'list_price': 'base_price',
  'mrp': 'base_price',
  'buying_price': 'base_price',
  'buying price': 'base_price',
  'pricing_type': 'pricing_type',
  'pricing_model': 'pricing_type',
  'pricingmodel': 'pricing_type',
  'tier': 'tier',
  'price_tier': 'tier',
  'stock': 'stock',
  'quantity': 'stock',
  'stock_quantity': 'stock',
  'qty': 'stock',
  'minimum_order_qty': 'minimum_order_qty',
  'min_order': 'minimum_order_qty',
  'min_qty': 'minimum_order_qty',
  'image_urls': 'image_urls',
  'images': 'image_urls',
  'image_url': 'image_urls',
  'tags': 'tags',
  'seo_title': 'seo_title',
  'meta_title': 'seo_title',
  'seo_description': 'seo_description',
  'meta_description': 'seo_description',
  'status': 'status',
  'compare_at_price': 'compare_at_price',
  'compare_price': 'compare_at_price',
  'original_price': 'compare_at_price',
  'finish_category': 'finish_category',
  'finish': 'finish_category',
  'colour': 'colour',
  'color': 'colour',
  'thickness': 'thickness',
  'length': 'length',
  'width': 'width',
  'gauge': 'gauge',
  'girth': 'girth',
  'girth_mm': 'girth',
  'folds': 'folds',
  'no_of_folds': 'folds',
  'number_of_folds': 'folds',
  'sump_type': 'sump_type',
  'sump type': 'sump_type',
  'sump_length': 'sump_length',
  'sump_width': 'sump_width',
  'sump_depth': 'sump_depth',
  'depth': 'sump_depth',
  'height': 'sump_depth',
  'rib_size': 'rib_size',
  'rib size': 'rib_size',
  'cover_width': 'cover_width',
  'cover width': 'cover_width',
  'cover': 'cover_width',
  'pack_size': 'pack_size',
  'pack size': 'pack_size',
  'packsize': 'pack_size',
  'packaging': 'pack_size',
  'quantity_per_pack': 'pack_size',
  'size': 'size',
  'screw_size': 'size',
  'screw size': 'size',
};

interface ImportRow {
  product_name: string;
  sku: string;
  category: string;
  subcategory?: string;
  product_type: string;
  type?: string;
  description?: string;
  short_description?: string;
  material?: string;
  finish_category?: string;
  colour?: string;
  thickness?: string;
  length?: string;
  width?: string;
  gauge?: string;
  girth?: string;
  folds?: string;
  sump_type?: string;
  sump_length?: string;
  sump_width?: string;
  sump_depth?: string;
  rib_size?: string;
  cover_width?: string;
  pack_size?: string;
  size?: string;
  base_price?: number;
  pricing_type?: string;
  tier?: string;
  stock?: number;
  minimum_order_qty?: number;
  image_urls?: string;
  tags?: string;
  seo_title?: string;
  seo_description?: string;
  status?: string;
}

// All fields that can become configurable attributes (dimensions + properties)
// These become configurable attributes, and rows become variants
const DIMENSION_FIELDS = [
  'sump_length', 'sump_width', 'sump_depth',
  'length', 'width', 'thickness', 'girth', 'folds',
  'gauge', 'rib_size', 'cover_width',
  'material', 'finish_category', 'colour', 'sump_type', 'pack_size', 'size',
];

// Readable names for dimension/attribute fields
const DIMENSION_LABELS: Record<string, string> = {
  sump_length: 'Length',
  sump_width: 'Width',
  sump_depth: 'Depth',
  length: 'Length',
  width: 'Width',
  thickness: 'Thickness',
  girth: 'Girth',
  folds: 'Folds',
  gauge: 'Gauge',
  rib_size: 'Rib Size',
  cover_width: 'Cover Width',
  material: 'Material',
  finish_category: 'Finish Category',
  colour: 'Colour',
  sump_type: 'Type',
  pack_size: 'Pack Size',
  size: 'Size',
};

/**
 * SKU prefix → human-readable product name mapping.
 * The SKU format is PREFIX + DIMENSIONS, e.g. GSU12X12X3
 */
const SKU_PREFIX_NAMES: Record<string, string> = {
  // Standard sumps
  'GSU': 'Galvanised Sump',
  'GCSU': 'Galvanised Custom Sump',
  'CSU': 'Colorbond Sump',
  'CCSU': 'Colorbond Custom Sump',
  'ZSU': 'Zinc Sump',
  'ZCSU': 'Zinc Custom Sump',
  // Colorbond sump variants
  'CBMSU': 'Sump',
  'CBCSU': 'Corner Sump',
  'CBMSSU': 'Step Sump',
  'CB1HSU': 'One High Sided Sump',
  'CB2HSU': 'Two High Sided Sump',
  'CB3HSU': 'Three High Sided Sump',
  'CB4HSU': 'Four High Sided Sump',
  // Galvanised sump variants
  'GMSU': 'Sump',
  'GCSU2': 'Corner Sump',
  'GMSSU': 'Step Sump',
  'G1HSU': 'One High Sided Sump',
  'G2HSU': 'Two High Sided Sump',
  'G3HSU': 'Three High Sided Sump',
  // Zinc sump variants
  'ZMSU': 'Sump',
  'ZCSU2': 'Corner Sump',
  'ZMSSU': 'Step Sump',
  'Z1HSU': 'One High Sided Sump',
  'Z2HSU': 'Two High Sided Sump',
  'Z3HSU': 'Three High Sided Sump',
  // Rainheads
  'GRH': 'Galvanised Rainhead',
  'CRH': 'Colorbond Rainhead',
  'ZRH': 'Zinc Rainhead',
  'CBMRH': 'Rainhead',
  'CBMTRH': 'Tapered Rainhead',
  'CBMSRH': 'Square Rainhead',
  'GMRH': 'Rainhead',
  'GMTRH': 'Tapered Rainhead',
  'GMSRH': 'Square Rainhead',
  'ZMRH': 'Rainhead',
  'ZMTRH': 'Tapered Rainhead',
  'ZMSRH': 'Square Rainhead',
  'GTRH': 'Galvanised Tapered Rainhead',
  'CTRH': 'Colorbond Tapered Rainhead',
  'ZTRH': 'Zinc Tapered Rainhead',
  'GSRH': 'Galvanised Square Rainhead',
  'CSRH': 'Colorbond Square Rainhead',
  'ZSRH': 'Zinc Square Rainhead',
  // Overflows
  'GOR': 'Galvanised Overflow',
  'COR': 'Colorbond Overflow',
  'ZOR': 'Zinc Overflow',
  'CBMOR': 'Overflow',
  'GMOR': 'Overflow',
  'ZMOR': 'Overflow',
};

/**
 * Extract the material/finish type from a SKU prefix.
 * CB = Colorbond, CBM = Matt Colorbond, CBU = Ultra, G = Galvanised, Z = Zinc
 */
const SKU_MATERIAL_PREFIXES: [string, string][] = [
  ['CBM', 'Matt Colorbond'],
  ['CBU', 'Ultra'],
  ['CB', 'Colorbond'],
  ['GM', 'Matt Galvanised'],
  ['GU', 'Ultra Galvanised'],
  ['G', 'Galvanised'],
  ['ZM', 'Matt Zinc'],
  ['ZU', 'Ultra Zinc'],
  ['Z', 'Zinc'],
];

function extractMaterialFromSku(sku: string): string | null {
  const upper = sku.toUpperCase().trim();
  for (const [prefix, material] of SKU_MATERIAL_PREFIXES) {
    if (upper.startsWith(prefix)) return material;
  }
  return null;
}

/**
 * Parse a SKU code to extract the product name prefix and dimensions.
 * E.g., "GSU12X12X3"      → { prefix: "GSU", name: "Galvanised Sump", dims: { Width: "12", Depth: "12", Height: "3" } }
 *        "CBM1HSU10X10X1"  → { prefix: "CBM1HSU", name: null, dims: { Width: "10", Depth: "10", Height: "1" } }
 *        "ZTRH8X4X7"       → { prefix: "ZTRH", name: "Zinc Tapered Rainhead", dims: { Width: "8", Depth: "4", Height: "7" } }
 */
function parseSkuDimensions(sku: string): {
  prefix: string;
  name: string | null;
  dims: { Width?: string; Depth?: string; Height?: string } | null;
} {
  const upper = sku.toUpperCase().trim();

  // Step 1: Try to extract dimensions from the END of any SKU (NxNxN or NxN pattern)
  const dimEndMatch = upper.match(/^(.+?)(\d+)[xX×](\d+)(?:[xX×](\d+))?$/);
  let dims: { Width?: string; Depth?: string; Height?: string } | null = null;
  let prefix = upper;

  if (dimEndMatch) {
    prefix = dimEndMatch[1];
    dims = {
      Width: dimEndMatch[2],
      Depth: dimEndMatch[3],
      ...(dimEndMatch[4] ? { Height: dimEndMatch[4] } : {}),
    };
  }

  // Step 2: Try to match prefix to a known product name
  const sortedPrefixes = Object.keys(SKU_PREFIX_NAMES).sort((a, b) => b.length - a.length);
  for (const knownPrefix of sortedPrefixes) {
    if (upper.startsWith(knownPrefix)) {
      return { prefix: knownPrefix, name: SKU_PREFIX_NAMES[knownPrefix], dims };
    }
  }

  // Step 3: No known prefix match — still return dims if found
  if (dims) {
    return { prefix, name: null, dims };
  }

  return { prefix: '', name: null, dims: null };
}

// Helper: parse worksheet headers and actual data rows (skips empty rows)
function parseWorksheet(worksheet: ExcelJS.Worksheet) {
  const sheetName = worksheet.name.trim();

  // Parse headers from row 1
  const rawHeaders: string[] = [];
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    rawHeaders[colNumber - 1] = String(cell.value || '').toLowerCase().trim().replace(/\s+/g, '_');
  });

  if (rawHeaders.filter(Boolean).length === 0) return null;

  const headers = rawHeaders.map((h) => COLUMN_ALIASES[h] || h);

  // Collect only rows with actual data (fixes ExcelJS rowCount bug)
  const dataRows: { rowIdx: number; data: Record<string, any> }[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const rowData: Record<string, any> = {};
    let hasData = false;

    headers.forEach((header, i) => {
      const cell = row.getCell(i + 1);
      // ExcelJS returns formula cells as { formula, result } objects — extract the result
      let val = cell.value;
      if (val && typeof val === 'object' && 'result' in (val as any)) {
        val = (val as any).result;
      }
      if (val !== null && val !== undefined && val !== '') hasData = true;
      rowData[header] = val;
    });

    if (hasData) {
      dataRows.push({ rowIdx: rowNumber, data: rowData });
    }
  });

  return { sheetName, rawHeaders, headers, dataRows };
}

/**
 * Material prefixes to strip from product names when grouping.
 * Order matters: longer prefixes first so "COLORBOND ULTRA" is matched before "COLORBOND".
 */
const MATERIAL_NAME_PREFIXES = [
  'COLORBOND ULTRA',
  'COLORBOND MATT',
  'MATT COLORBOND',
  'ULTRA COLORBOND',
  'COLORBOND',
  'GALVANISED',
  'GALVANIZED',
  'GALV',
  'ZINCALUME',
  'ZINC',
];

/**
 * Known Colorbond colour names for fallback matching.
 * Maps uppercase name → title-cased display name.
 */
const KNOWN_COLOURS: Record<string, string> = {
  'BASALT': 'Basalt',
  'BLUEGUM': 'Bluegum',
  'CLASSIC CREAM': 'Classic Cream',
  'COTTAGE GREEN': 'Cottage Green',
  'DEEP OCEAN': 'Deep Ocean',
  'DOVER WHITE': 'Dover White',
  'DUNE': 'Dune',
  'EVENING HAZE': 'Evening Haze',
  'GULLY': 'Gully',
  'IRONSTONE': 'Ironstone',
  'JASPER': 'Jasper',
  'MANOR RED': 'Manor Red',
  'MONUMENT': 'Monument',
  'NIGHT SKY': 'Night Sky',
  'PALE EUCALYPT': 'Pale Eucalypt',
  'PALE EUCALPT': 'Pale Eucalypt',
  'PAPERBARK': 'Paperbark',
  'SHALE GREY': 'Shale Grey',
  'SOUTHERLY': 'Southerly',
  'SURFMIST': 'Surfmist',
  'WALLABY': 'Wallaby',
  'WINDSPRAY': 'Windspray',
  'WOODLAND GREY': 'Woodland Grey',
  'ZINC': 'Zinc',
  'GALVANISED': 'Galvanised',
  'GALVANIZED': 'Galvanised',
};

// Sorted longest-first so "CLASSIC CREAM" matches before "CREAM"
const KNOWN_COLOUR_NAMES = Object.keys(KNOWN_COLOURS).sort((a, b) => b.length - a.length);

/**
 * Try to find a known Colorbond colour name anywhere in a string.
 * Returns the title-cased colour name or null.
 */
function findKnownColour(text: string): string | null {
  const upper = text.toUpperCase();
  for (const name of KNOWN_COLOUR_NAMES) {
    // Match as a word boundary (not inside another word)
    const idx = upper.indexOf(name);
    if (idx >= 0) {
      const before = idx === 0 || /[\s,\-_.]/.test(upper[idx - 1]);
      const after = idx + name.length >= upper.length || /[\s,\-_.]/.test(upper[idx + name.length]);
      if (before && after) return KNOWN_COLOURS[name];
    }
  }
  return null;
}

/**
 * Normalize a raw pack size string to a consistent format.
 * "100bags" → "100 Bags", "1000 BOX" → "1000 Box", "250 pack" → "250 Pack"
 */
function normalizePackSize(raw: string): string {
  return raw.replace(/(\d+)\s*(bags?|box|pcs?|pieces?|pack)\b/i, (_, num, unit) => {
    let u = unit.toLowerCase();
    if (u === 'bag') u = 'bags';
    if (u === 'pc' || u === 'piece') u = 'pcs';
    return `${num} ${u.charAt(0).toUpperCase() + u.slice(1)}`;
  });
}

/**
 * Extract pack size from anywhere in a string.
 * "100bags" → "100 Bags", "Basalt 1000 BOX" → "1000 Box"
 */
function extractPackSize(text: string): string | null {
  const match = text.match(/(\d+)\s*(bags?|box|pcs?|pieces?|pack)\b/i);
  return match ? normalizePackSize(match[0]) : null;
}

/**
 * Parse a fastener/hardware description to extract colour, size, and pack size.
 *
 * Handles multiple formats:
 *   "4-3 Open Rivet (aluminium/steel), Dome head, BlueGum,100bags"
 *   "4-3 Open Rivet (aluminium/steel), Dome head, BlueGum 1000 BOX"
 *   "Polycarbonate Screws - 50mm - multipurpose - 250 pack"
 *   "65mm Type 17 Screws Colorbond Basalt 50 pack"
 *   "16mm TEK Screw Surfmist"
 */
function parseFastenerDescription(desc: string): {
  colour: string;
  packSize: string;
  size: string;
  lengthMm: string;
  baseDescription: string;
} | null {
  let colour = '';
  let packSize = '';
  let size = '';
  let lengthMm = '';
  let baseDescription = '';

  // ── Strategy 1: Comma-separated (rivets) ──
  const commaParts = desc.split(',').map((p) => p.trim());
  if (commaParts.length >= 2) {
    const lastPart = commaParts[commaParts.length - 1];

    // Pattern 1a: last part is pure pack size like "100bags", "100 bags"
    const purePackMatch = lastPart.match(/^(\d+)\s*(bags?|box|pcs?|pieces?|pack)\s*$/i);
    if (purePackMatch) {
      packSize = lastPart;
      colour = commaParts.length >= 3 ? commaParts[commaParts.length - 2].trim() : '';
      baseDescription = commaParts.slice(0, commaParts.length >= 3 ? -2 : -1).join(', ').trim();
    } else {
      // Pattern 1b: last part has colour + pack size like "BlueGum 1000 BOX"
      const mixedMatch = lastPart.match(/^(.+?)\s+(\d+\s*(bags?|box|pcs?|pieces?|pack))\s*$/i);
      if (mixedMatch) {
        colour = mixedMatch[1].trim();
        packSize = mixedMatch[2].trim();
        baseDescription = commaParts.slice(0, -1).join(', ').trim();
      }
    }
  }

  // ── Strategy 2: Dash-separated (polycarbonate screws, generic hardware) ──
  // "Polycarbonate Screws - 50mm - multipurpose - 250 pack"
  if (!packSize && !colour) {
    const dashParts = desc.split(/\s+-\s+/).map((p) => p.trim());
    if (dashParts.length >= 2) {
      for (let i = dashParts.length - 1; i >= 1; i--) {
        const part = dashParts[i];
        if (!packSize && /^\d+\s*(bags?|box|pcs?|pieces?|pack)\s*$/i.test(part)) {
          packSize = part;
          continue;
        }
        if (!size && /^\d+\s*mm$/i.test(part)) {
          size = part.replace(/\s+/g, '').toLowerCase();
          continue;
        }
      }
      if (packSize || size) {
        baseDescription = dashParts.filter((p) => {
          if (packSize && /^\d+\s*(bags?|box|pcs?|pieces?|pack)\s*$/i.test(p)) return false;
          if (size && /^\d+\s*mm$/i.test(p)) return false;
          return true;
        }).join(' - ');
      }
    }
  }

  // ── Strategy 3: Fallback — scan for known Colorbond colour names + pack size + length ──
  // Handles any format: "65mm Type 17 Screws Colorbond Basalt 50 pack"
  // Also: "100X50 1800MM RECTANGULAR DOWNPIPE COLORBOND BASALT"
  if (!colour) {
    const found = findKnownColour(desc);
    if (found) colour = found;
  }
  if (!packSize) {
    const found = extractPackSize(desc);
    if (found) packSize = found;
  }
  // Extract length in mm from description (e.g., "1800MM", "2400MM")
  // Only match standalone NNNNmm patterns (>= 100mm to avoid matching small sizes like "50mm" screws)
  if (!lengthMm) {
    const lengthMatch = desc.match(/\b(\d{3,5})\s*mm\b/i);
    if (lengthMatch) {
      lengthMm = lengthMatch[1]; // raw mm value, e.g. "1800"
    }
  }

  if (!colour && !packSize && !size && !lengthMm) return null;

  // Normalize pack size
  if (packSize) packSize = normalizePackSize(packSize);

  // Title-case colour if not already from known list
  if (colour && !Object.values(KNOWN_COLOURS).includes(colour)) {
    colour = colour.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return { colour, packSize, size, lengthMm, baseDescription };
}

/**
 * Extract a base product name by stripping dimension patterns AND material prefixes.
 * E.g., "ZINC TAPERED RAINHEAD <= 900X900X900" → "TAPERED RAINHEAD"
 *        "COLORBOND BARGE ROLL 0.42MM"          → "BARGE ROLL"
 *        "GALV TAPERED RAINHEAD <= 400X300X300"  → "TAPERED RAINHEAD"
 */
function extractBaseName(name: string): string {
  let base = name;

  // Remove patterns like "<= 900X900X900" or "<= 900x700"
  base = base.replace(/\s*<=?\s*[\d]+[xX×][\d]+([xX×][\d]+)?\s*$/g, '');

  // Remove trailing dimension like "900X900X900" or "900 x 700 x 500"
  base = base.replace(/\s+[\d]+\s*[xX×]\s*[\d]+(\s*[xX×]\s*[\d]+)?\s*$/g, '');

  // Remove trailing pure numbers (like " 3600" for length)
  base = base.replace(/\s+[\d]+(\.\d+)?\s*$/g, '');

  // Remove trailing measurement like "0.42MM"
  base = base.replace(/\s+[\d]+\.?[\d]*\s*(mm|m|cm|kg)\s*$/gi, '');

  // Remove trailing dashes/whitespace
  base = base.replace(/[\s\-–]+$/g, '');

  base = base.trim() || name.trim();

  // Strip material prefixes so "ZINC TAPERED RAINHEAD" and "COLORBOND TAPERED RAINHEAD"
  // merge into one "TAPERED RAINHEAD" product with material as a selectable attribute
  const upper = base.toUpperCase();
  for (const prefix of MATERIAL_NAME_PREFIXES) {
    if (upper.startsWith(prefix + ' ')) {
      base = base.substring(prefix.length).trim();
      break;
    }
  }

  return base;
}

/**
 * Extract material name from a product name (the prefix that extractBaseName strips).
 */
// Map name prefixes to canonical material names (matching SKU-based names)
const NAME_PREFIX_TO_MATERIAL: Record<string, string> = {
  'COLORBOND ULTRA': 'Ultra',
  'ULTRA COLORBOND': 'Ultra',
  'COLORBOND MATT': 'Matt Colorbond',
  'MATT COLORBOND': 'Matt Colorbond',
  'COLORBOND': 'Colorbond',
  'GALVANISED': 'Galvanised',
  'GALVANIZED': 'Galvanised',
  'GALV': 'Galvanised',
  'ZINCALUME': 'Zinc',
  'ZINC': 'Zinc',
};

/**
 * Known material keywords used in roof sheet product names.
 * Order matters — longer prefixes first.
 */
const ROOFSHEET_MATERIAL_KEYWORDS = [
  { keyword: 'COLORBOND', material: 'Colorbond' },
  { keyword: 'MATT', material: 'Matt Colorbond' },
  { keyword: 'ULTRA', material: 'Ultra' },
  { keyword: 'GALVANISED', material: 'Galvanised' },
  { keyword: 'GALVANIZED', material: 'Galvanised' },
  { keyword: 'GLAVANIZED', material: 'Galvanised' },  // typo in data
  { keyword: 'ZINCALUME', material: 'Zincalume' },
  { keyword: 'ZINC', material: 'Zincalume' },
];

/**
 * Parse a roof sheet product name in the format:
 *   "{thickness} M-{profile} {material} {colour}"
 *   e.g. ".42 M-5RIB COLORBOND BASALT" → { thickness: '0.42', profile: '5RIB', material: 'Colorbond', colour: 'Basalt' }
 *   e.g. ".48 METROSPAN ZINCALUME"      → { thickness: '0.48', profile: 'METROSPAN', material: 'Zincalume', colour: '' }
 */
function parseRoofSheetName(name: string): {
  thickness: string; profile: string; material: string; colour: string;
} | null {
  const trimmed = name.trim();

  // Match: .{thickness} M-{profile} {rest}  OR  .{thickness} {profile} {rest}
  const match = trimmed.match(/^\.(\d+)\s+(?:M-)?(.+)/i);
  if (!match) return null;

  const thickness = '0.' + match[1]; // ".42" → "0.42"
  let rest = match[2].trim();

  // Find where the material keyword starts in the rest
  const upperRest = rest.toUpperCase();
  let materialStart = -1;
  let matchedMaterial = '';

  for (const { keyword, material } of ROOFSHEET_MATERIAL_KEYWORDS) {
    const idx = upperRest.indexOf(keyword);
    if (idx >= 0 && (materialStart === -1 || idx < materialStart)) {
      // Make sure it's a word boundary (preceded by space or start)
      if (idx === 0 || upperRest[idx - 1] === ' ') {
        materialStart = idx;
        matchedMaterial = material;

        // Extract colour: everything after the material keyword
        const afterKeyword = rest.substring(idx + keyword.length).trim();
        const profile = rest.substring(0, idx).trim();

        if (profile) {
          return {
            thickness,
            profile,
            material: matchedMaterial,
            colour: afterKeyword || '',
          };
        }
      }
    }
  }

  return null;
}

function extractMaterialFromName(name: string): string | null {
  const upper = name.toUpperCase().trim();
  for (const prefix of MATERIAL_NAME_PREFIXES) {
    if (upper.startsWith(prefix + ' ')) {
      return NAME_PREFIX_TO_MATERIAL[prefix] || prefix.charAt(0) + prefix.slice(1).toLowerCase();
    }
  }
  return null;
}

/**
 * Get or create an Attribute for a dimension field.
 * Caches in-memory for the import run.
 */
const attributeCache: Record<string, any> = {};

async function getOrCreateAttribute(field: string): Promise<any> {
  const slug = generateSlug(DIMENSION_LABELS[field] || field);

  if (attributeCache[slug]) return attributeCache[slug];

  let attr = await Attribute.findOne({ slug });
  if (!attr) {
    attr = await Attribute.create({
      name: DIMENSION_LABELS[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug,
      type: field === 'colour' ? 'color-swatch' : 'select',
      unit: (field === 'thickness' || field === 'girth') ? 'mm' : '',
      isRequired: true,
      isFilterable: true,
      isVisibleOnProduct: true,
      sortOrder: 0,
      values: [],
    });
  }

  attributeCache[slug] = attr;
  return attr;
}

/**
 * Ensure an attribute has a specific value in its values array.
 * Returns the value string used.
 */
async function ensureAttributeValue(attr: any, rawValue: string): Promise<string> {
  const valStr = String(rawValue).trim();
  const exists = attr.values.some((v: any) => v.value === valStr);

  if (!exists) {
    attr.values.push({
      value: valStr,
      label: valStr,
      sortOrder: attr.values.length,
    });
    await attr.save();
    // Update cache
    attributeCache[attr.slug] = attr;
  }

  return valStr;
}

export const importService = {
  // Preview Excel file — returns sheet info and sample rows (no DB writes)
  async previewExcel(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    if (workbook.worksheets.length === 0) {
      throw ApiError.badRequest('Excel file has no worksheets');
    }

    const sheets: Array<{
      name: string;
      headers: string[];
      rawHeaders: string[];
      totalRows: number;
      sampleRows: Record<string, any>[];
    }> = [];

    for (const worksheet of workbook.worksheets) {
      const parsed = parseWorksheet(worksheet);
      if (!parsed || parsed.dataRows.length === 0) continue;

      sheets.push({
        name: parsed.sheetName,
        headers: parsed.headers.filter(Boolean),
        rawHeaders: parsed.rawHeaders.filter(Boolean),
        totalRows: parsed.dataRows.length,
        sampleRows: parsed.dataRows.slice(0, 10).map((r) => r.data),
      });
    }

    const totalRows = sheets.reduce((sum, s) => sum + s.totalRows, 0);
    return { sheets, totalRows };
  },

  async processExcel(
    buffer: Buffer,
    fileName: string,
    importType: 'products' | 'prices' | 'stock',
    userId: string
  ) {
    // Clear attribute cache for this import run
    Object.keys(attributeCache).forEach((k) => delete attributeCache[k]);

    // Create import job
    const job = await ImportJob.create({
      fileName,
      type: importType,
      status: 'processing',
      uploadedBy: userId,
    });

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);

      if (workbook.worksheets.length === 0) {
        throw ApiError.badRequest('Excel file has no worksheets');
      }

      let totalDataRows = 0;

      for (const worksheet of workbook.worksheets) {
        const parsed = parseWorksheet(worksheet);
        if (!parsed || parsed.dataRows.length === 0) continue;

        const { sheetName, rawHeaders, headers, dataRows } = parsed;
        totalDataRows += dataRows.length;

        // For product import, check required columns
        if (importType === 'products') {
          const flexibleRequired = REQUIRED_COLUMNS.filter((col) => col !== 'category');
          const missingColumns = flexibleRequired.filter((col) => !headers.includes(col));
          if (missingColumns.length > 0) {
            job.importErrors.push({
              row: 0,
              field: 'headers',
              message: `Sheet "${sheetName}": Missing columns: ${missingColumns.join(', ')}. Found: ${rawHeaders.filter(Boolean).join(', ')}`,
              data: { sheet: sheetName, foundHeaders: rawHeaders },
            });
            job.errorCount += dataRows.length;
            job.processedRows += dataRows.length;
            continue;
          }
        }

        // Log header mapping for debugging
        console.log(`Sheet "${sheetName}" raw headers:`, rawHeaders.filter(Boolean).join(', '));
        console.log(`Sheet "${sheetName}" mapped headers:`, headers.filter(Boolean).join(', '));

        if (importType === 'products') {
          // ── GROUPED IMPORT: detect dimension columns, group rows into products ──
          await this.importProductSheet(dataRows, headers, sheetName, job);
        } else {
          // Price/stock imports stay row-by-row
          for (const { rowIdx, data: rowData } of dataRows) {
            try {
              if (importType === 'prices') {
                await this.importPriceRow(rowData, rowIdx);
              } else {
                await this.importStockRow(rowData, rowIdx);
              }
              job.successCount++;
            } catch (err: any) {
              job.errorCount++;
              if (job.importErrors.length < 100) {
                job.importErrors.push({
                  row: rowIdx,
                  field: '',
                  message: `Sheet "${sheetName}", Row ${rowIdx}: ${err.message || 'Unknown error'}`,
                  data: rowData,
                });
              }
            }
            job.processedRows++;
          }
        }

        // Save progress after each sheet
        job.totalRows = totalDataRows;
        await job.save();
      }

      job.totalRows = totalDataRows;
      job.status = job.errorCount === totalDataRows && totalDataRows > 0 ? 'failed' : 'completed';
      job.completedAt = new Date();
      await job.save();

      return job;
    } catch (err: any) {
      job.status = 'failed';
      job.importErrors.push({
        row: 0,
        field: 'file',
        message: err.message || 'Failed to process file',
        data: {},
      });
      await job.save();
      return job;
    }
  },

  /**
   * Import a sheet of product rows with smart grouping.
   *
   * 1. Normalize each row (set category from sheet name, fix type/sump_type, build name)
   * 2. Detect which dimension columns have varying values across rows
   * 3. Group rows by base product name (strip dimensions from name)
   * 4. Groups with 1 row → simple product
   * 5. Groups with >1 rows → configurable product + variants
   */
  async importProductSheet(
    dataRows: { rowIdx: number; data: Record<string, any> }[],
    headers: string[],
    sheetName: string,
    job: any
  ) {
    // Step 1: Normalize all rows — parse SKU for name + dimensions
    const normalizedRows: { rowIdx: number; row: ImportRow; skuDims: Record<string, string> | null; skuProductName: string | null; isRoofSheet?: boolean }[] = [];

    for (const { rowIdx, data: rowData } of dataRows) {
      const row = { ...rowData } as ImportRow;

      // Set category from sheet name if not specified
      if (!row.category) row.category = sheetName;

      // Handle "type" column ambiguity
      if (row.type && !row.sump_type) {
        const typeVal = String(row.type).toLowerCase();
        if (!['simple', 'configurable'].includes(typeVal)) {
          row.sump_type = String(row.type);
        }
      }

      // Parse SKU for product name and dimensions
      const skuStr = String(row.sku || '').trim();
      const skuParsed = parseSkuDimensions(skuStr);

      // Build product name: prefer description, then SKU-derived name, then sheet name
      if (!row.product_name) {
        if (row.description) {
          row.product_name = row.description;
        } else if (skuParsed.name) {
          row.product_name = skuParsed.name;
        } else {
          row.product_name = row.short_description || `${sheetName} - ${skuStr}`;
        }
      }
      row.product_name = String(row.product_name).trim();

      // Detect roof sheet data from product_name, description, or SKU
      // Try parsing product_name first (e.g. ".42 M-5RIB COLORBOND BASALT")
      let roofSheet = parseRoofSheetName(row.product_name);
      if (roofSheet) {
        row.product_name = roofSheet.profile; // e.g. "5RIB", "CLIP LOCK 700"
      }
      // If product_name didn't match, try the description (e.g. ".42 M-METRIB 850 COLORBOND BASALT")
      if (!roofSheet && row.description) {
        roofSheet = parseRoofSheetName(String(row.description));
      }
      // Extract thickness, material, colour from whichever matched
      if (roofSheet) {
        if (!row.thickness) (row as any).thickness = roofSheet.thickness;
        if (!row.material) (row as any).material = roofSheet.material;
        if (!row.colour && roofSheet.colour) (row as any).colour = roofSheet.colour;
      }
      // Also try extracting thickness from SKU prefix (e.g. ".42COR-BA" → "0.42")
      if (!(row as any).thickness) {
        const skuThicknessMatch = skuStr.match(/^\.(\d+)/);
        if (skuThicknessMatch) {
          (row as any).thickness = '0.' + skuThicknessMatch[1];
          roofSheet = roofSheet || {} as any; // mark as roof sheet
        }
      }

      // Normalize material values from Excel column (e.g. "COLORBOND" → "Colorbond")
      if ((row as any).material && !roofSheet?.material) {
        const rawMat = String((row as any).material).trim().toUpperCase();
        const matMap: Record<string, string> = {
          'COLORBOND': 'Colorbond', 'MATT': 'Matt Colorbond', 'MATT COLORBOND': 'Matt Colorbond',
          'ULTRA': 'Ultra', 'GALVANISED': 'Galvanised', 'GALVANIZED': 'Galvanised',
          'GLAVANIZED': 'Galvanised', 'GALV': 'Galvanised', 'ZINCALUME': 'Zincalume', 'ZINC': 'Zincalume',
        };
        if (matMap[rawMat]) (row as any).material = matMap[rawMat];
      }

      // If we got colour from description but material from Excel column, ensure material
      // is extracted from description when Excel material is too generic
      if (roofSheet?.colour && !row.colour) {
        (row as any).colour = roofSheet.colour;
      }

      // If SKU has dimensions, inject them into the row as dimension fields
      // (only if those fields aren't already populated from Excel columns)
      let skuDims: Record<string, string> | null = null;
      if (skuParsed.dims) {
        skuDims = {};
        if (skuParsed.dims.Width && !row.sump_width && !row.width) {
          (row as any).sump_width = skuParsed.dims.Width;
          skuDims['Width'] = skuParsed.dims.Width;
        }
        if (skuParsed.dims.Depth && !row.sump_length) {
          (row as any).sump_length = skuParsed.dims.Depth;
          skuDims['Depth'] = skuParsed.dims.Depth;
        }
        if (skuParsed.dims.Height && !row.sump_depth) {
          (row as any).sump_depth = skuParsed.dims.Height;
          skuDims['Height'] = skuParsed.dims.Height;
        }
      }

      // If the COLOR column has a generic finish name (COLORBOND, MATT, GALV)
      // instead of a specific colour, move it to finish_category so real colour can be extracted
      const isRoofSheetRow = !!(roofSheet || (row as any).thickness);
      if (row.colour) {
        const FINISH_NAMES = ['COLORBOND', 'MATT', 'MATT COLORBOND', 'GALV', 'GALVANISED', 'GALVANIZED', 'ZINCALUME', 'ZINC'];
        const colourUpper = String(row.colour).trim().toUpperCase();
        if (FINISH_NAMES.includes(colourUpper)) {
          // This is a finish category, not a specific colour
          if (!row.finish_category) (row as any).finish_category = String(row.colour).trim();
          row.colour = undefined as any; // clear so real colour can be extracted
        }
      }

      // Try parsing description for fastener/hardware data
      // (extract colour, size, and pack size from descriptions)
      if (!isRoofSheetRow && row.description) {
        const fastener = parseFastenerDescription(String(row.description));
        if (fastener) {
          if (fastener.colour && !row.colour) (row as any).colour = fastener.colour;
          if (fastener.packSize && !row.pack_size) (row as any).pack_size = fastener.packSize;
          if (fastener.size && !row.size) (row as any).size = fastener.size;
          if (fastener.lengthMm && !row.length) {
            // Frontend displays length as code * 100 = mm, so divide by 100
            (row as any).length = String(parseFloat(fastener.lengthMm) / 100);
          }
        }
      }

      // Fallback: extract colour from SKU suffix code (e.g., S65F-BG → Bluegum, .42MINIC-BA → Basalt)
      if (!row.colour) {
        const skuUpper = String(row.sku || '').trim().toUpperCase();
        const skuSuffixMatch = skuUpper.match(/[-]([A-Z]{2,3})$/);
        if (skuSuffixMatch) {
          const SKU_COLOUR_CODES: Record<string, string> = {
            'BA': 'Basalt', 'BS': 'Basalt', 'BG': 'Bluegum', 'CC': 'Classic Cream',
            'CG': 'Cottage Green', 'DO': 'Deep Ocean', 'DW': 'Dover White', 'DU': 'Dune',
            'EH': 'Evening Haze', 'GU': 'Gully', 'IR': 'Ironstone', 'IS': 'Ironstone',
            'JA': 'Jasper', 'MR': 'Manor Red', 'MO': 'Monument', 'NS': 'Night Sky',
            'PE': 'Pale Eucalypt', 'PB': 'Paperbark', 'SG': 'Shale Grey', 'SH': 'Shale Grey',
            'SO': 'Southerly', 'SM': 'Surfmist', 'SU': 'Surfmist', 'WB': 'Wallaby',
            'WL': 'Wallaby', 'WS': 'Windspray', 'WG': 'Woodland Grey',
            'ZIN': 'Zinc', 'GAL': 'Galvanised', 'RCO': 'Raw Colorbond',
            'MBA': 'Basalt', 'MBG': 'Bluegum', 'MBU': 'Bluegum', 'MDU': 'Dune', 'MMO': 'Monument', 'MSG': 'Shale Grey',
            'MSU': 'Surfmist', 'EZ': 'Evening Haze', 'BU': 'Bluegum', 'WA': 'Wallaby',
            'CO': 'Cove', 'CV': 'Cove', 'TE': 'Terrain', 'MN': 'Mangrove',
            'UBA': 'Basalt', 'UDO': 'Deep Ocean', 'UDU': 'Dune', 'UMO': 'Monument',
            'USG': 'Shale Grey', 'USU': 'Surfmist', 'UWB': 'Wallaby', 'UWS': 'Windspray',
            'UWG': 'Woodland Grey', 'UCO': 'Cove',
          };
          const code = skuSuffixMatch[1];
          if (SKU_COLOUR_CODES[code]) {
            (row as any).colour = SKU_COLOUR_CODES[code];
          }
        }
      }

      // Debug: log extraction results for non-roofsheet rows
      if (!isRoofSheetRow) {
        console.log(`[Import Debug] Row ${rowIdx}: name="${row.product_name}", sku="${row.sku}", colour="${row.colour || 'NONE'}", pack_size="${(row as any).pack_size || 'NONE'}", finish_cat="${(row as any).finish_category || 'NONE'}", desc="${(row.description || '').substring(0, 60)}..."`);
      }

      normalizedRows.push({ rowIdx, row, skuDims, skuProductName: skuParsed.name, isRoofSheet: isRoofSheetRow });
    }

    // Step 2: Detect which dimension columns are present AND have data
    // Check both Excel headers AND fields populated from name parsing (roof sheets)
    let presentDimensions = DIMENSION_FIELDS.filter((field) =>
      (headers.includes(field) || normalizedRows.some((r) => (r.row as any)[field]))
      && normalizedRows.some((r) => (r.row as any)[field])
    );

    // ALWAYS add SKU-parsed dimensions (sump_width/sump_length/sump_depth) if they exist
    // even when other dimension fields (like colour) are already present from Excel headers
    const hasSkuDims = normalizedRows.some((r) => r.skuDims && Object.keys(r.skuDims).length > 0);
    let useSkuDimensionGrouping = false;

    if (hasSkuDims) {
      const skuDimFields: string[] = [];
      if (normalizedRows.some((r) => (r.row as any).sump_width) && !presentDimensions.includes('sump_width')) skuDimFields.push('sump_width');
      if (normalizedRows.some((r) => (r.row as any).sump_length) && !presentDimensions.includes('sump_length')) skuDimFields.push('sump_length');
      if (normalizedRows.some((r) => (r.row as any).sump_depth) && !presentDimensions.includes('sump_depth')) skuDimFields.push('sump_depth');
      if (skuDimFields.length > 0) {
        presentDimensions = [...presentDimensions, ...skuDimFields];
        useSkuDimensionGrouping = true;
      }
    }

    // Step 3: Group rows by base product name
    const groups = new Map<string, { rowIdx: number; row: ImportRow }[]>();

    for (const entry of normalizedRows) {
      let groupKey: string;

      if (presentDimensions.length > 0) {
        // Group by base name (strip dimensions + material prefix)
        // For roof sheets, product_name is already the clean profile (e.g. "5RIB")
        // For sumps/rainheads, strip material prefix and dimensions
        const baseName = entry.isRoofSheet
          ? entry.row.product_name
          : extractBaseName(entry.row.product_name);
        groupKey = baseName;
      } else {
        // No dimensions — each row is its own product (use SKU as key)
        groupKey = `__sku__${String(entry.row.sku).trim().toUpperCase()}`;
      }

      // Separate clips/accessories from their parent products (e.g., downpipe clips)
      // so "100x50 DOWNPIPES" clip rows become a separate "100x50 CLIP" product
      const skuUpper = String(entry.row.sku || '').toUpperCase();
      const descUpper = String(entry.row.description || '').toUpperCase();
      if (skuUpper.includes('CLIP') && !groupKey.toUpperCase().includes('CLIP')) {
        const sizeMatch = groupKey.match(/^(\d+[xX×]\d+|\d+\s*mm)/i);
        const sizePrefix = sizeMatch ? sizeMatch[1] + ' ' : '';
        groupKey = sizePrefix + 'DOWNPIPE CLIP';
        (entry.row as any)._isClipAccessory = true;
      } else if ((skuUpper.includes('OFFSET') || descUpper.includes('OFFSET')) && !groupKey.toUpperCase().includes('OFFSET')) {
        const sizeMatch = groupKey.match(/^(\d+[xX×]\d+|\d+\s*mm)/i);
        const sizePrefix = sizeMatch ? sizeMatch[1] + ' ' : '';
        groupKey = sizePrefix + 'DOWNPIPE OFFSET';
        (entry.row as any)._isOffsetAccessory = true;
      }

      if (!groups.has(groupKey)) groups.set(groupKey, []);
      groups.get(groupKey)!.push({ rowIdx: entry.rowIdx, row: entry.row });
    }

    console.log(`Sheet "${sheetName}": ${normalizedRows.length} rows → ${groups.size} product groups (dimensions: ${presentDimensions.join(', ') || 'none'}${useSkuDimensionGrouping ? ' [from SKU]' : ''})`);

    // Step 4 & 5: Process each group
    for (const [groupKey, groupRows] of groups) {
      try {
        if (groupRows.length === 1 && presentDimensions.length === 0) {
          // Single row with no dimensions → simple product
          for (const { rowIdx, row } of groupRows) {
            try {
              const productId = await this.importSimpleProduct(row, rowIdx, sheetName);
              job.createdProductIds.push(productId);
              job.successCount++;
            } catch (err: any) {
              job.errorCount++;
              if (job.importErrors.length < 100) {
                job.importErrors.push({
                  row: rowIdx, field: '',
                  message: `Sheet "${sheetName}", Row ${rowIdx}: ${err.message}`,
                  data: row,
                });
              }
            }
            job.processedRows++;
          }
        } else if (groupRows.length >= 1 && presentDimensions.length > 0) {
          // Rows with dimensions → configurable product + variants
          // Check if this group is a roof sheet group (name already clean, no extractBaseName needed)
          const isRoofSheetGroup = normalizedRows.some(
            (nr) => nr.isRoofSheet && nr.row.product_name === groupKey
          );
          await this.importConfigurableProduct(groupRows, presentDimensions, sheetName, job, isRoofSheetGroup);
        } else {
          // Fallback: simple products
          for (const { rowIdx, row } of groupRows) {
            try {
              const productId = await this.importSimpleProduct(row, rowIdx, sheetName);
              job.createdProductIds.push(productId);
              job.successCount++;
            } catch (err: any) {
              job.errorCount++;
              if (job.importErrors.length < 100) {
                job.importErrors.push({
                  row: rowIdx, field: '',
                  message: `Sheet "${sheetName}", Row ${rowIdx}: ${err.message}`,
                  data: row,
                });
              }
            }
            job.processedRows++;
          }
        }

        // Save progress periodically
        if (job.processedRows % 100 === 0) {
          await job.save();
        }
      } catch (err: any) {
        // Group-level error
        for (const { rowIdx } of groupRows) {
          job.errorCount++;
          job.processedRows++;
        }
        if (job.importErrors.length < 100) {
          job.importErrors.push({
            row: groupRows[0].rowIdx, field: '',
            message: `Sheet "${sheetName}", Group "${groupKey}": ${err.message}`,
            data: { groupSize: groupRows.length },
          });
        }
      }
    }
  },

  /**
   * Import a single simple product (no variants).
   */
  async importSimpleProduct(row: ImportRow, rowNumber: number, sheetName: string) {
    const skuRaw = row.sku;
    if (!skuRaw) throw new Error(`Row ${rowNumber}: SKU is required`);
    const sku = String(skuRaw).trim().toUpperCase();

    // Find or create category
    const categoryId = await this.findOrCreateCategory(row.category, row.subcategory);

    const slug = generateSlug(`${row.product_name}-${sku}`);

    // Fields that always update on re-import (price, stock, status)
    const productUpdateData: any = {
      name: row.product_name,
      slug,
      type: 'simple',
      status: row.status || 'active',
    };

    // Fields only set on first creation (description, tags — won't overwrite manual edits or images)
    const productInsertData: any = {
      sku,
      shortDescription: row.short_description || '',
      description: row.description || '',
      tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
    };

    if (categoryId) {
      productUpdateData.category = categoryId;
      productUpdateData.categories = [categoryId];
    }

    if (row.base_price) productUpdateData.price = Math.round(parseFloat(String(row.base_price)) * 100) / 100;
    if (row.stock !== undefined) productUpdateData.stock = parseInt(String(row.stock), 10);
    if (row.minimum_order_qty) productUpdateData.minimumOrderQty = parseInt(String(row.minimum_order_qty), 10);
    if (row.pricing_type) productUpdateData.pricingModel = row.pricing_type;

    if (row.tier) {
      productUpdateData.specifications = { Tier: String(row.tier) };
    }

    if (row.seo_title || row.seo_description) {
      productInsertData.seo = { metaTitle: row.seo_title || '', metaDescription: row.seo_description || '' };
    }

    // Build specifications from dimension/attribute columns
    const specs: Record<string, string> = {};
    for (const field of DIMENSION_FIELDS) {
      const val = (row as any)[field];
      if (val) specs[DIMENSION_LABELS[field] || field] = String(val);
    }

    if (Object.keys(specs).length > 0) {
      productUpdateData.specifications = { ...(productUpdateData.specifications || {}), ...specs };
    }

    if ((row as any).compare_at_price) {
      productUpdateData.compareAtPrice = parseFloat(String((row as any).compare_at_price));
    }

    const product = await Product.findOneAndUpdate(
      { sku },
      {
        $set: productUpdateData,
        $setOnInsert: productInsertData,
      },
      { upsert: true, new: true, runValidators: false }
    );
    return product._id;
  },

  /**
   * Import a group of rows as ONE configurable product with variants.
   *
   * - Base product name derived from the group (strip dimensions)
   * - Dimension columns become Attribute records
   * - Each row becomes a ProductVariant with its dimensions + price
   */
  async importConfigurableProduct(
    groupRows: { rowIdx: number; row: ImportRow }[],
    dimensionFields: string[],
    sheetName: string,
    job: any,
    isRoofSheet: boolean = false
  ) {
    const firstRow = groupRows[0].row;

    // For roof sheets, product_name is already the clean profile (e.g. "5RIB", "CLIP LOCK 700")
    // For sumps/rainheads, strip material prefix and dimensions
    const baseName = isRoofSheet ? firstRow.product_name : extractBaseName(firstRow.product_name);
    const productName = baseName;

    // Use first SKU as the parent product SKU (with -CFG suffix)
    const firstSku = String(firstRow.sku).trim().toUpperCase();
    const parentSku = `${firstSku}-PARENT`;

    // Find or create category
    const categoryId = await this.findOrCreateCategory(firstRow.category, firstRow.subcategory);

    // Detect which dimension fields actually vary across this group
    const varyingDimensions = dimensionFields.filter((field) => {
      const uniqueValues = new Set(
        groupRows.map((r) => String((r.row as any)[field] || '').trim()).filter(Boolean)
      );
      return uniqueValues.size > 1;
    });

    // If no dimensions actually vary, fall back to simple products
    if (varyingDimensions.length === 0) {
      for (const { rowIdx, row } of groupRows) {
        try {
          const productId = await this.importSimpleProduct(row, rowIdx, sheetName);
          job.createdProductIds.push(productId);
          job.successCount++;
        } catch (err: any) {
          job.errorCount++;
          if (job.importErrors.length < 100) {
            job.importErrors.push({
              row: rowIdx, field: '',
              message: `Sheet "${sheetName}", Row ${rowIdx}: ${err.message}`,
              data: row,
            });
          }
        }
        job.processedRows++;
      }
      return;
    }

    // Get or create Attribute records for each varying dimension
    const dimensionAttributes: { field: string; attr: any }[] = [];
    for (const field of varyingDimensions) {
      const attr = await getOrCreateAttribute(field);
      dimensionAttributes.push({ field, attr });
    }

    // Collect all unique values per dimension from group rows
    for (const { field, attr } of dimensionAttributes) {
      const uniqueVals = [...new Set(
        groupRows.map((r) => String((r.row as any)[field] || '').trim()).filter(Boolean)
      )];
      // Sort numerically if possible
      uniqueVals.sort((a, b) => {
        const na = parseFloat(a), nb = parseFloat(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      });
      for (const val of uniqueVals) {
        await ensureAttributeValue(attr, val);
      }
    }

    // Build configurable product
    const slug = generateSlug(productName);
    const configurableAttributes = dimensionAttributes.map(({ attr }, i) => ({
      attribute: attr._id,
      isRequired: true,
      sortOrder: i,
      allowedValues: [] as string[], // all values allowed
    }));

    // Calculate price range
    const prices = groupRows
      .map((r) => r.row.base_price ? parseFloat(String(r.row.base_price)) : null)
      .filter((p): p is number => p !== null && !isNaN(p));

    // Fields that should ALWAYS update on re-import (prices, status)
    const productUpdateData: any = {
      name: productName,
      slug,
      type: 'configurable',
      status: firstRow.status || 'active',
      pricingModel: 'per_piece',
    };

    // Fields that should ONLY be set on first creation (won't overwrite manual edits)
    const productInsertData: any = {
      sku: parentSku,
      shortDescription: firstRow.short_description || '',
      description: firstRow.description || `${productName} — available in multiple options`,
      tags: firstRow.tags ? firstRow.tags.split(',').map((t: string) => t.trim()) : [sheetName.toLowerCase()],
    };

    if (categoryId) {
      productUpdateData.category = categoryId;
      productUpdateData.categories = [categoryId];
    }

    // Clips/offsets: assign to their own category pages (NOT the parent downpipes page)
    const isClipProduct = groupRows.some((r) => (r.row as any)._isClipAccessory);
    const isOffsetProduct = groupRows.some((r) => (r.row as any)._isOffsetAccessory);
    if (isClipProduct || isOffsetProduct) {
      const slugsToAdd = ['downpipe-accessories', 'accessories'];
      if (isClipProduct) slugsToAdd.push('downpipe-clips');
      if (isOffsetProduct) slugsToAdd.push('downpipe-offsets');
      const accessoryCats = await Category.find({ slug: { $in: slugsToAdd } });
      // Replace categories (don't keep parent downpipes category)
      const primaryCat = accessoryCats.find((c: any) =>
        c.slug === (isClipProduct ? 'downpipe-clips' : 'downpipe-offsets')
      );
      if (primaryCat) {
        productUpdateData.category = primaryCat._id;
        productUpdateData.categories = accessoryCats.map((c: any) => c._id);
      }
    }

    // Set the lowest price as the base price for display (always update)
    if (prices.length > 0) {
      productUpdateData.price = Math.round(Math.min(...prices) * 100) / 100;
    }

    // Specs that are common across the group (always update)
    const specs: Record<string, string> = {};
    if (firstRow.tier) specs['Tier'] = String(firstRow.tier);
    const varyingFieldNames = new Set(varyingDimensions);
    if (firstRow.material && !varyingFieldNames.has('material')) specs['Material'] = String(firstRow.material);
    if (firstRow.finish_category && !varyingFieldNames.has('finish_category')) specs['Finish Category'] = String(firstRow.finish_category);
    if (firstRow.sump_type && !varyingFieldNames.has('sump_type')) specs['Type'] = String(firstRow.sump_type);
    if (firstRow.colour && !varyingFieldNames.has('colour')) specs['Colour'] = String(firstRow.colour);
    if (Object.keys(specs).length > 0) productUpdateData.specifications = specs;

    // Upsert by slug (not SKU) so multiple material groups merge into one product.
    // $set: fields that always update (price, status, categories)
    // $setOnInsert: fields that only set on first creation (description, tags, images preserved)
    const product = await Product.findOneAndUpdate(
      { slug },
      {
        $set: productUpdateData,
        $setOnInsert: productInsertData,
      },
      { upsert: true, new: true, runValidators: false }
    );

    // Track created product for this import job
    if (!job.createdProductIds.some((id: any) => id.toString() === product._id.toString())) {
      job.createdProductIds.push(product._id);
    }

    // Always update configurableAttributes to include all dimension attributes from this batch
    // Merge with existing ones so attributes from multiple groups accumulate
    const existingAttrIds = new Set(
      (product.configurableAttributes || []).map((ca: any) => ca.attribute.toString())
    );
    let attrsChanged = false;
    const mergedAttrs = [...(product.configurableAttributes || [])];
    for (const ca of configurableAttributes) {
      if (!existingAttrIds.has(ca.attribute.toString())) {
        mergedAttrs.push(ca);
        attrsChanged = true;
      }
    }
    if (attrsChanged || !product.configurableAttributes || product.configurableAttributes.length === 0) {
      await Product.findByIdAndUpdate(product._id, { $set: { configurableAttributes: mergedAttrs } });
    }

    // Detect materials in this batch (from row data, SKU prefix, or product name)
    const materialsInGroup = new Set<string>();
    for (const { row } of groupRows) {
      const mat = (row as any).material
        || extractMaterialFromSku(String(row.sku))
        || extractMaterialFromName(String(row.product_name || ''));
      if (mat) materialsInGroup.add(mat);
    }

    // Also check existing variants' materials (from previous import batches)
    const existingVariants = await ProductVariant.find({ product: product._id }).select('attributes sku').lean();
    for (const v of existingVariants) {
      const matAttr = v.attributes?.find((a: any) => a.attributeName === 'Material');
      if (matAttr) materialsInGroup.add(matAttr.value);
    }
    if (existingVariants.length > 0 && materialsInGroup.size <= 1) {
      for (const v of existingVariants) {
        const mat = extractMaterialFromSku((v as any).sku || '');
        if (mat) materialsInGroup.add(mat);
      }
    }

    const hasMaterialVariation = materialsInGroup.size > 1;

    // If materials vary, create a "Material" configurable attribute
    let materialAttr: any = null;
    if (hasMaterialVariation) {
      materialAttr = await getOrCreateAttribute('material');
      for (const mat of materialsInGroup) {
        await ensureAttributeValue(materialAttr, mat);
      }
      const currentAttrs = product.configurableAttributes || [];
      const alreadyHasMaterial = currentAttrs.some(
        (ca: any) => ca.attribute.toString() === materialAttr._id.toString()
      );
      if (!alreadyHasMaterial) {
        currentAttrs.push({
          attribute: materialAttr._id,
          isRequired: true,
          sortOrder: currentAttrs.length,
          allowedValues: [] as string[],
        });
        await Product.findByIdAndUpdate(product._id, { $set: { configurableAttributes: currentAttrs } });
      }

      // Backfill material attribute on existing variants that don't have it
      for (const v of existingVariants) {
        const hasMat = v.attributes?.some((a: any) => a.attributeName === 'Material');
        if (!hasMat) {
          const vSku = (v as any).sku || '';
          const mat = extractMaterialFromSku(vSku) || 'Unknown';
          const updatedAttrs = [...(v.attributes || []), {
            attribute: materialAttr._id,
            attributeName: materialAttr.name,
            value: mat,
          }];
          const sorted = updatedAttrs.map((a: any) => `${a.attribute}:${a.value}`).sort().join('|');
          const newHash = crypto.createHash('md5').update(sorted).digest('hex');
          await ProductVariant.findByIdAndUpdate((v as any)._id, {
            $set: { attributes: updatedAttrs, attributeHash: newHash }
          });
        }
      }
    }

    console.log(`  Created configurable product "${productName}" (${parentSku}) with ${groupRows.length} variants, dimensions: ${varyingDimensions.join(', ')}${hasMaterialVariation ? ', materials: ' + [...materialsInGroup].join(', ') : ''}`);

    // Create variants for each row
    for (const { rowIdx, row } of groupRows) {
      try {
        const variantSku = String(row.sku).trim().toUpperCase();

        // Build variant attributes (dimensions)
        const variantAttributes: { attribute: any; attributeName: string; value: string }[] = [];
        for (const { field, attr } of dimensionAttributes) {
          const val = String((row as any)[field] || '').trim();
          if (val) {
            variantAttributes.push({
              attribute: attr._id,
              attributeName: attr.name,
              value: val,
            });
          }
        }

        // Add material attribute if materials vary across the group (and not already added by dimensions)
        const alreadyHasMaterial = variantAttributes.some((a) => a.attributeName === 'Material');
        if (hasMaterialVariation && materialAttr && !alreadyHasMaterial) {
          const mat = (row as any).material || extractMaterialFromSku(variantSku) || extractMaterialFromName(String(row.product_name || '')) || 'Unknown';
          variantAttributes.push({
            attribute: materialAttr._id,
            attributeName: materialAttr.name,
            value: mat,
          });
        }

        // Generate attribute hash
        const sorted = variantAttributes
          .map((a) => `${a.attribute}:${a.value}`)
          .sort()
          .join('|');
        const attributeHash = crypto.createHash('md5').update(sorted).digest('hex');

        // Fields that always update on re-import (price, stock, attributes)
        const variantUpdateData: any = {
          product: product._id,
          attributes: variantAttributes,
          attributeHash,
          isActive: true,
        };

        if (row.base_price) {
          variantUpdateData.priceOverride = Math.round(parseFloat(String(row.base_price)) * 100) / 100;
        }
        if (row.stock !== undefined) {
          variantUpdateData.stock = parseInt(String(row.stock), 10);
        }

        // Fields only set on first creation (sku as identifier, images preserved)
        const variantInsertData: any = {
          sku: variantSku,
        };

        const variant = await ProductVariant.findOneAndUpdate(
          { sku: variantSku },
          {
            $set: variantUpdateData,
            $setOnInsert: variantInsertData,
          },
          { upsert: true, new: true, runValidators: false }
        );

        job.createdVariantIds.push(variant._id);
        job.successCount++;
      } catch (err: any) {
        job.errorCount++;
        if (job.importErrors.length < 100) {
          job.importErrors.push({
            row: rowIdx, field: '',
            message: `Sheet "${sheetName}", Row ${rowIdx} (variant): ${err.message}`,
            data: row,
          });
        }
      }
      job.processedRows++;
    }
  },

  /**
   * Find or create category (and optional subcategory).
   */
  async findOrCreateCategory(categoryName?: string, subcategoryName?: string) {
    if (!categoryName) return null;

    // Direct sheet-name-to-category mapping for known product types
    const SHEET_TO_CATEGORY: Record<string, string> = {
      'FASCIA': 'fascia-and-gutter-products',
      'FASCIA_BOARD': 'fascia-and-gutter-products',
      'FASCIA BOARD': 'fascia-and-gutter-products',
      'FASCIA_GUTTER': 'fascia-and-gutter-products',
      'GUTTER': 'fascia-and-gutter-products',
      'FASCIA & GUTTER': 'fascia-and-gutter-products',
    };
    const directSlug = SHEET_TO_CATEGORY[categoryName.toUpperCase().trim()];
    if (directSlug) {
      const directCat = await Category.findOne({ slug: directSlug });
      if (directCat) return directCat._id;
    }

    const slug = generateSlug(categoryName);
    // Try exact slug first
    let category = await Category.findOne({ slug });

    if (!category) {
      // Fallback: match slugs ignoring hyphens (handles "ROOFSHEETS" → "roof-sheets")
      // AND partial prefix match (handles "SCREWS_STOCKITEM" → "screws")
      const slugNoHyphens = slug.replace(/-/g, '');
      const allCategories = await Category.find({});

      // 1. Exact match without hyphens
      category = allCategories.find((c: any) => c.slug.replace(/-/g, '') === slugNoHyphens) || null;

      // 2. Prefix match: check if an existing category slug is the start of this slug
      //    e.g., "screws" matches "screws-stockitem", "roofing" matches "roofing-materials"
      if (!category) {
        // Sort by slug length descending so longer (more specific) matches win
        const sorted = [...allCategories].sort((a: any, b: any) => b.slug.length - a.slug.length);
        category = sorted.find((c: any) => {
          const cSlug = c.slug.replace(/-/g, '');
          return slugNoHyphens.startsWith(cSlug) && cSlug.length >= 3;
        }) || null;
      }

      // 3. Also try case-insensitive name match (e.g., "SCREWS_STOCKITEM" starts with "Screws")
      if (!category) {
        const nameUpper = categoryName.toUpperCase().replace(/[_\-]/g, ' ');
        const sorted = [...allCategories].sort((a: any, b: any) => b.name.length - a.name.length);
        category = sorted.find((c: any) => nameUpper.startsWith(c.name.toUpperCase())) || null;
      }
    }

    if (!category) {
      category = await Category.create({
        name: categoryName,
        slug,
        level: 0,
        isActive: true,
      });
    }
    let categoryId = category._id;

    if (subcategoryName) {
      const subSlug = generateSlug(subcategoryName);
      let subCat = await Category.findOne({ slug: subSlug });
      if (!subCat) {
        subCat = await Category.create({
          name: subcategoryName,
          slug: subSlug,
          parent: categoryId,
          level: 1,
          isActive: true,
        });
      }
      categoryId = subCat._id;
    }

    return categoryId;
  },

  async importPriceRow(row: Record<string, any>, rowNumber: number) {
    const sku = row.sku?.toString().toUpperCase();
    if (!sku) throw new Error(`Row ${rowNumber}: SKU is required`);

    const product = await Product.findOne({ sku });
    if (!product) throw new Error(`Row ${rowNumber}: Product with SKU ${sku} not found`);

    if (row.base_price !== undefined) {
      product.price = Math.round(parseFloat(String(row.base_price)) * 100) / 100;
    }
    if (row.compare_at_price !== undefined) {
      product.compareAtPrice = parseFloat(String(row.compare_at_price));
    }

    await product.save();
  },

  async importStockRow(row: Record<string, any>, rowNumber: number) {
    const sku = row.sku?.toString().toUpperCase();
    if (!sku) throw new Error(`Row ${rowNumber}: SKU is required`);

    const product = await Product.findOne({ sku });
    if (!product) throw new Error(`Row ${rowNumber}: Product with SKU ${sku} not found`);

    if (row.stock !== undefined) {
      product.stock = parseInt(String(row.stock), 10);
    }

    await product.save();
  },

  async getImportJobs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      ImportJob.find()
        .populate('uploadedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ImportJob.countDocuments(),
    ]);
    return { jobs, total, page, limit };
  },

  async getImportJob(id: string) {
    return ImportJob.findById(id).populate('uploadedBy', 'firstName lastName');
  },
};
