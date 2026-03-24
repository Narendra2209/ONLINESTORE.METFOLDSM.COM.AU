import mongoose from 'mongoose';
import { env } from '../config/env';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db!;

  // Get the last import job to see the sample data and headers
  const job = await db.collection('importjobs').findOne({}, { sort: { createdAt: -1 } });
  if (job) {
    console.log('Import success:', job.successCount, 'errors:', job.errorCount);
    // Show first few errors to see what data looks like
    if (job.importErrors?.length > 0) {
      for (const err of job.importErrors.slice(0, 3)) {
        console.log('\nError row data:', JSON.stringify(err.data, null, 2));
      }
    }
  }

  // Check the exact price for our test SKU
  const variant = await db.collection('productvariants').findOne({ sku: 'CB1HSU10X10X10' });
  if (variant) {
    console.log('\n--- CB1HSU10X10X10 ---');
    console.log('priceOverride:', variant.priceOverride);
    console.log('rounded:', Math.round(variant.priceOverride * 100) / 100);
  }

  // Also check if there's a product with this name
  const product = await db.collection('products').findOne({ name: /ONE HIGH SIDED SUMP/i });
  if (product) {
    console.log('\nProduct:', product.name);
    console.log('Product price:', product.price);
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
