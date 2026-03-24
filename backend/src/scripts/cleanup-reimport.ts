/**
 * Cleanup script: Deletes all products, variants, pricing rules, import jobs, and carts.
 *
 * Usage: npx ts-node -r tsconfig-paths/register src/scripts/cleanup-reimport.ts
 *
 * Or to delete only a specific category's products:
 *   npx ts-node -r tsconfig-paths/register src/scripts/cleanup-reimport.ts "Sumps & Rainheads"
 */
import mongoose from 'mongoose';
import { env } from '../config/env';
import Product from '../models/Product';
import ProductVariant from '../models/ProductVariant';
import Category from '../models/Category';
import ImportJob from '../models/ImportJob';
import PricingRule from '../models/PricingRule';
import Cart from '../models/Cart';

async function main() {
  const categoryFilter = process.argv[2]; // optional: category name to filter

  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  if (categoryFilter) {
    // Delete products in a specific category
    const cat = await Category.findOne({ name: { $regex: new RegExp(categoryFilter, 'i') } });
    if (!cat) {
      console.log(`Category "${categoryFilter}" not found`);
      process.exit(1);
    }

    const products = await Product.find({ categories: cat._id }).select('_id name sku');
    console.log(`Found ${products.length} products in "${cat.name}"`);

    const productIds = products.map((p) => p._id);

    // Delete variants first
    const variantResult = await ProductVariant.deleteMany({ product: { $in: productIds } });
    console.log(`Deleted ${variantResult.deletedCount} variants`);

    // Delete pricing rules for these products
    const pricingResult = await PricingRule.deleteMany({ product: { $in: productIds } });
    console.log(`Deleted ${pricingResult.deletedCount} pricing rules`);

    // Delete products
    const productResult = await Product.deleteMany({ _id: { $in: productIds } });
    console.log(`Deleted ${productResult.deletedCount} products`);
  } else {
    // Delete ALL products, variants, pricing rules, import jobs, and carts
    const variantCount = await ProductVariant.countDocuments();
    const productCount = await Product.countDocuments();
    const importJobCount = await ImportJob.countDocuments();
    const pricingRuleCount = await PricingRule.countDocuments();
    const cartCount = await Cart.countDocuments();

    console.log(`Found ${productCount} products, ${variantCount} variants, ${pricingRuleCount} pricing rules, ${importJobCount} import jobs, ${cartCount} carts`);
    console.log('Deleting all...');

    await ProductVariant.deleteMany({});
    await PricingRule.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});

    console.log('All products, variants, pricing rules, and carts deleted (import history preserved).');
  }

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
