import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Product from '../models/Product';
import Category from '../models/Category';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI || '');

  const flatback = await Category.findOne({ slug: 'flatback' });
  const og = await Category.findOne({ slug: 'og' });

  if (!flatback || !og) { console.log('Category missing'); process.exit(1); }

  // Fix: flat back cast angles should be Flatback, not Quad
  const flatbackProducts = await Product.find({ name: /flat.?back.*cast angle/i });
  for (const p of flatbackProducts) {
    p.category = flatback._id as any;
    p.categories = [flatback._id as any];
    await p.save();
    console.log('[Flatback]', p.name);
  }

  // Fix: OG EXTERNAL BRACKETS → OG
  const ogBrackets = await Product.find({ name: /og.*bracket|og.*external/i });
  for (const p of ogBrackets) {
    p.category = og._id as any;
    p.categories = [og._id as any];
    await p.save();
    console.log('[OG]', p.name);
  }

  console.log('Done!');
  await mongoose.disconnect();
}

fix().catch(e => { console.error(e); process.exit(1); });
