import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Product';
import Category from '../models/Category';

// Map: subcategory slug → name patterns to match in product name
const SUBCATEGORY_PATTERNS: Record<string, RegExp> = {
  'quad': /\bquad\b|cast angle|over strap.*quad|bracket.*quad/i,
  'squarline': /squareline|squarline/i,
  'og': /\(og\)|\bog\b gutter|cast.*og|og.*cast/i,
  'flatback': /flatback|flat back/i,
  'half-flatback': /half.?flat.?back/i,
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB');

  const gutterAcc = await Category.findOne({ slug: 'gutter-accessories' });
  if (!gutterAcc) { console.log('ERROR: gutter-accessories not found'); process.exit(1); }

  // Load all gutter subcategories
  const subcats = await Category.find({ parent: gutterAcc._id });
  console.log(`Found ${subcats.length} subcategories:`, subcats.map(s => s.slug));

  // Load all products in gutter-accessories (by category or categories field)
  const products = await Product.find({
    $or: [
      { category: gutterAcc._id },
      { categories: gutterAcc._id },
    ],
  });
  console.log(`\nTotal gutter accessory products: ${products.length}`);

  let assigned = 0;
  let unassigned = 0;

  for (const p of products) {
    let matched = false;

    for (const [slug, pattern] of Object.entries(SUBCATEGORY_PATTERNS)) {
      if (pattern.test(p.name)) {
        const subcat = subcats.find(s => s.slug === slug);
        if (!subcat) continue;

        p.category = subcat._id as any;
        p.categories = [subcat._id as any];
        await p.save();
        console.log(`  [${subcat.name}] ${p.name}`);
        matched = true;
        assigned++;
        break;
      }
    }

    if (!matched) {
      unassigned++;
      console.log(`  [UNASSIGNED - stays in Gutter Accessories] ${p.name}`);
    }
  }

  console.log(`\nAssigned: ${assigned}  |  Left in parent: ${unassigned}`);
  console.log('Done!');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
