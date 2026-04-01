import Category, { ICategory } from '../models/Category';
import Product from '../models/Product';
import ProductVariant from '../models/ProductVariant';
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

    // Build ancestor breadcrumb chain (walk up parent links)
    const ancestors: { name: string; slug: string }[] = [];
    let current = category;
    while (current.parent) {
      const parent = await Category.findById(current.parent).lean();
      if (!parent) break;
      ancestors.unshift({ name: parent.name, slug: parent.slug });
      current = parent as any;
    }

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
      ancestors,
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
    // Collect all category IDs to delete (this category + all descendants)
    const idsToDelete: string[] = [id];
    const collectChildren = async (parentId: string) => {
      const children = await Category.find({ parent: parentId }, '_id');
      for (const child of children) {
        idsToDelete.push(child._id.toString());
        await collectChildren(child._id.toString());
      }
    };
    await collectChildren(id);

    // Delete all products and their variants under these categories
    const products = await Product.find({ category: { $in: idsToDelete } }, '_id');
    if (products.length > 0) {
      const productIds = products.map((p) => p._id);
      await ProductVariant.deleteMany({ product: { $in: productIds } });
      await Product.deleteMany({ _id: { $in: productIds } });
    }

    // Delete all categories (children + parent)
    await Category.deleteMany({ _id: { $in: idsToDelete } });

    return { deletedCategories: idsToDelete.length, deletedProducts: products.length };
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
