import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Product';
import Category from '../models/Category';

const ROOFING_ACCESSORY_PRODUCTS = [
  'Barge Roll', 'Cladding Battens', '5-Rib Eaves', 'Roof Razors',
  'Top Hat Battens', 'Ceiling Battens', 'Box Gutter Brackets',
  'Corri Eaves', 'Gutter Board', 'Roof Valve', 'Silicone',
  'Standing Seam Screws', 'Standing Seam Clips', 'Snaplock Clips',
];

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected to MongoDB');

  const roofingAccessoriesCat = await Category.findOne({ slug: 'roofing-accessories' });
  if (!roofingAccessoriesCat) {
    console.log('ERROR: roofing-accessories category not found');
    process.exit(1);
  }
  console.log('Target category:', roofingAccessoriesCat.name, roofingAccessoriesCat._id);

  // Find products by name pattern that should be in roofing-accessories
  const regex = new RegExp(ROOFING_ACCESSORY_PRODUCTS.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');
  const products = await Product.find({ name: regex });
  console.log(`Found ${products.length} products to reassign`);

  for (const p of products) {
    const oldCat = p.category;
    p.category = roofingAccessoriesCat._id;
    p.categories = [roofingAccessoriesCat._id];
    await p.save();
    console.log(`  Updated: ${p.name} (${oldCat} → ${roofingAccessoriesCat._id})`);
  }

  console.log('Done!');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
