import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Product';
import Category from '../models/Category';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const halfFlatback = await Category.findOne({ slug: 'half-flatback' });
  if (!halfFlatback) { console.log('half-flatback category not found'); process.exit(1); }

  const products = await Product.find({ name: /half round.*bracket/i });
  for (const p of products) {
    p.category = halfFlatback._id as any;
    p.categories = [halfFlatback._id as any];
    await p.save();
    console.log('[Half Flatback]', p.name);
  }
  console.log('Done!');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
