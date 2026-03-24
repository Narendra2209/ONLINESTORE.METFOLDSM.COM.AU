import Category, { ICategory } from '../models/Category';
import Product from '../models/Product';
import { ApiError } from '../utils/ApiError';
import { generateSlug } from '../utils/helpers';

export const categoryService = {
  async getAll(includeInactive = false) {
    const filter: any = {};
    if (!includeInactive) filter.isActive = true;

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    return this.buildTree(categories);
  },

  async getAllFlat(includeInactive = false) {
    const filter: any = {};
    if (!includeInactive) filter.isActive = true;

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    const tree = this.buildTree(categories);

    // Flatten tree with correct ordering (parent then children)
    const flat: any[] = [];
    const flatten = (nodes: any[]) => {
      for (const node of nodes) {
        const { children, ...rest } = node;
        flat.push(rest);
        if (children?.length) {
          flatten(children);
        }
      }
    };
    flatten(tree);
    return flat;
  },

  async getBySlug(slug: string) {
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) throw ApiError.notFound('Category not found');

    // Get subcategories
    const children = await Category.find({ parent: category._id, isActive: true })
      .sort({ sortOrder: 1 });

    // Get product count
    const productCount = await Product.countDocuments({
      categories: category._id,
      status: 'active',
      isVisible: true,
    });

    return {
      ...category.toObject(),
      children,
      productCount,
    };
  },

  async create(data: Partial<ICategory>) {
    const slug = data.slug || generateSlug(data.name!);

    const existing = await Category.findOne({ slug });
    if (existing) throw ApiError.conflict('Category with this name already exists');

    let level = 0;
    if (data.parent) {
      const parent = await Category.findById(data.parent);
      if (!parent) throw ApiError.notFound('Parent category not found');
      level = parent.level + 1;
    }

    return Category.create({ ...data, slug, level });
  },

  async update(id: string, data: Partial<ICategory>) {
    const category = await Category.findById(id);
    if (!category) throw ApiError.notFound('Category not found');

    if (data.name && data.name !== category.name && !data.slug) {
      data.slug = generateSlug(data.name);
    }

    if (data.parent) {
      const parent = await Category.findById(data.parent);
      if (!parent) throw ApiError.notFound('Parent category not found');
      data.level = parent.level + 1;
    }

    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async delete(id: string) {
    // Check for subcategories
    const children = await Category.countDocuments({ parent: id });
    if (children > 0) {
      throw ApiError.badRequest('Cannot delete category with subcategories');
    }

    // Check for products
    const products = await Product.countDocuments({ category: id });
    if (products > 0) {
      throw ApiError.badRequest('Cannot delete category with products');
    }

    return Category.findByIdAndDelete(id);
  },

  async reorder(items: Array<{ id: string; sortOrder: number }>) {
    const ops = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { sortOrder: item.sortOrder },
      },
    }));
    await Category.bulkWrite(ops);
  },

  buildTree(categories: ICategory[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    // First pass: create map
    for (const cat of categories) {
      map.set(cat._id.toString(), { ...cat.toObject(), children: [] });
    }

    // Second pass: build tree
    for (const cat of categories) {
      const node = map.get(cat._id.toString());
      if (cat.parent) {
        const parent = map.get(cat.parent.toString());
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  },
};
