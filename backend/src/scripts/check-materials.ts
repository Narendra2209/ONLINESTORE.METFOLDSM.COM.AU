import mongoose from 'mongoose';
import { env } from '../config/env';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  const db = mongoose.connection.db!;

  const job = await db.collection('importjobs').findOne({}, { sort: { createdAt: -1 } });
  if (job && job.importErrors) {
    console.log('Total errors:', job.importErrors.length, '(showing first 10)');
    for (const err of job.importErrors.slice(0, 10)) {
      console.log(`\nRow ${err.row}: ${err.message}`);
      if (err.data) {
        console.log('  SKU:', err.data.sku, '| Name:', err.data.product_name);
      }
    }
  }

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
