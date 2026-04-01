import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Product';
import Category from '../models/Category';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const flatback = await Category.findOne({ slug: 'flatback' });
  if (!flatback) { console.log('flatback category not found'); process.exit(1); }

  const p = await Product.findOne({ name: /consealed suspension/i });
  if (!p) { console.log('Product not found'); process.exit(1); }

  p.category = flatback._id as any;
  p.categories = [flatback._id as any];
  await p.save();
  console.log('[Flatback]', p.name);
  console.log('Done!');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
