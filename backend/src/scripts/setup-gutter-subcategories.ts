import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Category from '../models/Category';
import Product from '../models/Product';

// Products whose names match these patterns belong in Fascia Accessories
const FASCIA_ACCESSORY_PATTERNS = [
  'Internal Mitre', 'External Mitre', 'Stop End', 'Stopend',
  'Fascia Mitre', 'Fascia Stop', 'Joiners', 'Fascia Joiner',
];

const GUTTER_SUBCATEGORIES = ['Quad', 'Flatback', 'Squarline', 'OG', 'Half Flatback'];

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB');

  // --- 1. Find parent "Gutter Accessories" ---
  const gutterAccCat = await Category.findOne({ slug: 'gutter-accessories' });
  if (!gutterAccCat) {
    console.log('ERROR: gutter-accessories category not found');
    process.exit(1);
  }
  console.log('Found Gutter Accessories:', gutterAccCat._id);

  // --- 2. Create subcategories under Gutter Accessories ---
  for (let k = 0; k < GUTTER_SUBCATEGORIES.length; k++) {
    const name = GUTTER_SUBCATEGORIES[k];
    const slug = generateSlug(name);

    const doc = await Category.findOneAndUpdate(
      { slug },
      { name, slug, level: 2, sortOrder: k, isActive: true, parent: gutterAccCat._id },
      { upsert: true, new: true }
    );
    console.log(`  Subcategory upserted: ${doc.name} (${doc._id})`);
  }

  // --- 3. Find Fascia Accessories category ---
  const fasciaAccCat = await Category.findOne({ slug: 'fascia-accessories' });
  if (!fasciaAccCat) {
    console.log('ERROR: fascia-accessories category not found');
    process.exit(1);
  }
  console.log('Found Fascia Accessories:', fasciaAccCat._id);

  // --- 4. Move matching products to Fascia Accessories ---
  const regex = new RegExp(
    FASCIA_ACCESSORY_PATTERNS.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'i'
  );

  const products = await Product.find({
    name: regex,
    category: gutterAccCat._id,
  });

  console.log(`\nFound ${products.length} products to move to Fascia Accessories:`);

  for (const p of products) {
    p.category = fasciaAccCat._id as any;
    p.categories = [fasciaAccCat._id as any];
    await p.save();
    console.log(`  Moved: ${p.name}`);
  }

  console.log('\nDone!');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
