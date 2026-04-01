import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import Category from '../models/Category';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const cat = await Category.findOne({ slug: 'quad' }).lean();
  console.log('Quad:', cat?.name, '| parent:', cat?.parent, '| level:', cat?.level);

  if (cat?.parent) {
    const parent = await Category.findById(cat.parent).lean();
    console.log('Parent:', parent?.name, '| parent:', parent?.parent, '| level:', parent?.level);

    if (parent?.parent) {
      const grandparent = await Category.findById(parent.parent).lean();
      console.log('Grandparent:', grandparent?.name, '| level:', grandparent?.level);
    }
  }
  await mongoose.disconnect();
}

test().catch(e => { console.error(e); process.exit(1); });
