import Product, { IProduct } from '../models/Product';
import ProductVariant from '../models/ProductVariant';
import PricingRule from '../models/PricingRule';
import Category from '../models/Category';
import { ApiError } from '../utils/ApiError';
import { generateSlug, parsePaginationQuery } from '../utils/helpers';
import { pricingService } from './pricing.service';

interface ProductQuery {
  category?: string;
  categories?: string;
  search?: string;
  status?: string;
  type?: string;
  isFeatured?: string;
  availableTo?: string;
  minPrice?: string;
  maxPrice?: string;
  tags?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
}

export const productService = {
  async list(query: ProductQuery, isAdmin = false): Promise<any> {
    const { page, limit, skip } = parsePaginationQuery(query);
    const filter: any = {};

    if (!isAdmin) {
      filter.status = 'active';
      filter.isVisible = true;
    } else if (query.status) {
      filter.status = query.status;
    }

    if (query.category) {
      // Find category by slug and include all child categories
      const cat = await Category.findOne({ slug: query.category });
      if (cat) {
        // Find all child categories of this parent
        const childCats = await Category.find({ parent: cat._id }).select('_id');
        const categoryIds = [cat._id, ...childCats.map(c => c._id)];
        filter.categories = { $in: categoryIds };
      }
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      // Search by SKU (exact or partial), name, or text index
      filter.$or = [
        { sku: { $regex: searchTerm, $options: 'i' } },
        { name: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (query.type) filter.type = query.type;
    if (query.isFeatured === 'true') filter.isFeatured = true;
    if (query.availableTo) filter.availableTo = { $in: [query.availableTo, 'all'] };
    if (query.tags) filter.tags = { $in: query.tags.split(',') };

    // Sort
    let sort: any = { createdAt: -1 };
    if (query.sortBy === 'name') sort = { name: 1 };
    else if (query.sortBy === 'price_asc') sort = { price: 1 };
    else if (query.sortBy === 'price_desc') sort = { price: -1 };
    else if (query.sortBy === 'newest') sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Attach price ranges for configurable products
    const productsWithPrices = await Promise.all(
      products.map(async (p) => {
        if (p.type === 'configurable') {
          const priceRange = await pricingService.getPriceRange(p._id.toString());
          return { ...p, priceRange };
        }
        return p;
      })
    );

    return { products: productsWithPrices, total, page, limit };
  },

  async getBySlug(slug: string) {
    const product = await Product.findOne({ slug, status: 'active', isVisible: true })
      .populate('category', 'name slug')
      .populate('configurableAttributes.attribute')
      .populate('relatedProducts', 'name slug images price type');

    if (!product) throw ApiError.notFound('Product not found');

    // Get price range
    let priceRange = null;
    if (product.type === 'configurable') {
      priceRange = await pricingService.getPriceRange(product._id.toString());
    }

    // Get pricing rules (for frontend to understand structure)
    const pricingRules = await PricingRule.find({
      product: product._id,
      isActive: true,
    })
      .populate('modifiers.condition.attribute', 'name slug')
      .sort({ priority: -1 });

    // Get variants for configurable products
    const variants = product.type === 'configurable'
      ? await ProductVariant.find({ product: product._id, isActive: true }).sort({ sku: 1 })
      : [];

    return {
      ...product.toObject(),
      priceRange,
      pricingRules: pricingRules.length > 0 ? pricingRules[0] : null,
      variants,
    };
  },

  async getByIdAdmin(id: string) {
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('configurableAttributes.attribute');

    if (!product) throw ApiError.notFound('Product not found');

    const pricingRules = await PricingRule.find({ product: id })
      .populate('modifiers.condition.attribute', 'name slug')
      .sort({ priority: -1 });

    const variants = await ProductVariant.find({ product: id }).sort({ sku: 1 });

    return {
      ...product.toObject(),
      pricingRules,
      variants,
    };
  },

  async create(data: Partial<IProduct>) {
    const slug = data.slug || generateSlug(data.name!);

    const existing = await Product.findOne({ $or: [{ slug }, { sku: data.sku }] });
    if (existing) {
      throw ApiError.conflict(
        existing.slug === slug ? 'Product with this name already exists' : 'SKU already exists'
      );
    }

    // Build categories array (ancestors)
    let categories: any[] = [];
    if (data.category) {
      categories = [data.category];
      let parentCat = await Category.findById(data.category);
      while (parentCat?.parent) {
        categories.push(parentCat.parent);
        parentCat = await Category.findById(parentCat.parent);
      }
    }

    // Auto-set type to configurable if attributes are provided
    if (data.configurableAttributes && (data.configurableAttributes as any[]).length > 0) {
      data.type = 'configurable';
      if (!data.pricingModel) data.pricingModel = 'per_piece' as any;
    }

    return Product.create({ ...data, slug, categories });
  },

  async update(id: string, data: Partial<IProduct>) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');

    if (data.name && data.name !== product.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Auto-set type to configurable if attributes are provided
    if (data.configurableAttributes && (data.configurableAttributes as any[]).length > 0) {
      data.type = 'configurable';
      if (!data.pricingModel && !product.pricingModel) data.pricingModel = 'per_piece' as any;
    }

    // Rebuild categories if category changed
    if (data.category && data.category.toString() !== product.category?.toString()) {
      const categories = [data.category];
      let parentCat = await Category.findById(data.category);
      while (parentCat?.parent) {
        categories.push(parentCat.parent);
        parentCat = await Category.findById(parentCat.parent);
      }
      data.categories = categories;
    }

    return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('category', 'name slug')
      .populate('configurableAttributes.attribute');
  },

  async updateStatus(id: string, status: 'draft' | 'active' | 'archived') {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    product.status = status;
    return product.save();
  },

  async delete(id: string) {
    const product = await Product.findById(id);
    if (!product) throw ApiError.notFound('Product not found');

    // Soft delete by archiving
    product.status = 'archived';
    product.isVisible = false;
    return product.save();
  },

  async duplicate(id: string) {
    const original = await Product.findById(id).lean();
    if (!original) throw ApiError.notFound('Product not found');

    const { _id, slug, sku, createdAt, updatedAt, ...rest } = original as any;
    const newSlug = `${slug}-copy-${Date.now()}`;
    const newSku = `${sku}-COPY`;

    const newProduct = await Product.create({
      ...rest,
      name: `${rest.name} (Copy)`,
      slug: newSlug,
      sku: newSku,
      status: 'draft',
    });

    // Copy pricing rules
    const rules = await PricingRule.find({ product: id }).lean();
    for (const rule of rules) {
      const { _id: ruleId, ...ruleData } = rule as any;
      await PricingRule.create({ ...ruleData, product: newProduct._id });
    }

    return newProduct;
  },
};
