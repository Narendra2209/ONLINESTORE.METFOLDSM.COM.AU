import mongoose from 'mongoose';
import { env } from '../config/env';
import { seedRoles } from './roles.seed';
import { seedAdmin } from './admin.seed';
import { seedCategories } from './categories.seed';
import { seedAttributes } from './attributes.seed';
import { seedProducts } from './products.seed';

const runSeeds = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await seedRoles();
    await seedAdmin();
    await seedCategories();
    await seedAttributes();
    await seedProducts();

    console.log('\nAll seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

runSeeds();
