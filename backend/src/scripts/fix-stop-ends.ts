import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Product';
import Category from '../models/Category';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  console.log('Connected');

  const gutterAcc = await Category.findOne({ slug: 'gutter-accessories' });
  const fasciaAcc = await Category.findOne({ slug: 'fascia-accessories' });

  if (!gutterAcc || !fasciaAcc) { console.log('Category not found'); process.exit(1); }
  console.log('Gutter:', gutterAcc._id, '  Fascia:', fasciaAcc._id);

  // Move all stop ends + flat back half round back to Gutter Accessories
  const regex = /stop end|stop ends/i;
  const products = await Product.find({ name: regex, category: fasciaAcc._id });
  console.log(`Found ${products.length} products to move back to Gutter Accessories`);

  for (const p of products) {
    p.category = gutterAcc._id as any;
    p.categories = [gutterAcc._id as any];
    await p.save();
    console.log('  Moved:', p.name);
  }

  console.log('Done!');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
