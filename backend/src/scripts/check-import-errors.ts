import mongoose from 'mongoose';
import { env } from '../config/env';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db!;

  // --- Most recent ImportJob ---
  const job = await db.collection('importjobs').findOne({}, { sort: { createdAt: -1 } });
  if (!job) {
    console.log('No import jobs found.');
    await mongoose.disconnect();
    return;
  }

  console.log('=== IMPORT JOB ===');
  console.log('ID:', job._id);
  console.log('File:', job.fileName);
  console.log('Type:', job.type);
  console.log('Status:', job.status);
  console.log('Total rows:', job.totalRows);
  console.log('Processed:', job.processedRows);
  console.log('Success:', job.successCount);
  console.log('Errors:', job.errorCount);
  console.log('Created at:', job.createdAt);
  console.log('');

  // --- First 20 error messages ---
  const errors: Array<{ row: number; field: string; message: string; data: Record<string, any> }> =
    job.importErrors || [];
  console.log(`=== ERRORS (${errors.length} total, showing first 20) ===`);
  for (const err of errors.slice(0, 20)) {
    console.log(`  Row ${err.row} [${err.field || '-'}]: ${err.message}`);
    if (err.data) {
      console.log(`    SKU: ${err.data.sku ?? 'N/A'} | Name: ${err.data.product_name ?? 'N/A'}`);
    }
  }
  console.log('');

  // --- Distinct error message patterns (group by message, show counts) ---
  const patternCounts = new Map<string, number>();
  for (const err of errors) {
    // Normalize: strip row-specific data like IDs and numbers to find patterns
    const pattern = err.message;
    patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
  }

  const sortedPatterns = [...patternCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`=== DISTINCT ERROR PATTERNS (${sortedPatterns.length} unique) ===`);
  for (const [message, count] of sortedPatterns) {
    console.log(`  [${count}x] ${message}`);
  }
  console.log('');

  // --- Products created ---
  const products = await db
    .collection('products')
    .find({}, { projection: { name: 1, sku: 1, type: 1 } })
    .sort({ createdAt: -1 })
    .limit(30)
    .toArray();
  console.log(`=== PRODUCTS (${products.length} shown, limit 30) ===`);
  for (const p of products) {
    console.log(`  ${p.sku} | ${p.type} | ${p.name}`);
  }
  console.log('');

  // --- Variants created ---
  const variants = await db
    .collection('productvariants')
    .find({}, { projection: { sku: 1, attributes: 1, priceOverride: 1 } })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  console.log(`=== VARIANTS (${variants.length} shown, limit 20) ===`);
  for (const v of variants) {
    const attrs = (v.attributes || [])
      .map((a: any) => `${a.attributeName}=${a.value}`)
      .join(', ');
    console.log(`  ${v.sku} | price: ${v.priceOverride ?? 'null'} | ${attrs}`);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
