import Banner from '../models/Banner';
import Blog from '../models/Blog';
import Page from '../models/Page';
import Review from '../models/Review';
import Wishlist from '../models/Wishlist';
import Settings from '../models/Settings';
import { generateSlug } from '../utils/helpers';
import { ApiError } from '../utils/ApiError';

export const cmsService = {
  // Banners
  async getBanners(position?: string) {
    const filter: any = { isActive: true };
    if (position) filter.position = position;
    const now = new Date();
    filter.$or = [
      { startDate: { $exists: false }, endDate: { $exists: false } },
      { startDate: { $lte: now }, endDate: { $gte: now } },
      { startDate: { $lte: now }, endDate: { $exists: false } },
      { startDate: { $exists: false }, endDate: { $gte: now } },
    ];
    return Banner.find(filter).sort({ sortOrder: 1 });
  },

  async getAllBanners() {
    return Banner.find().sort({ position: 1, sortOrder: 1 });
  },

  async createBanner(data: any) {
    return Banner.create(data);
  },

  async updateBanner(id: string, data: any) {
    return Banner.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteBanner(id: string) {
    return Banner.findByIdAndDelete(id);
  },

  // Blog
  async getPublishedPosts(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { status: 'published' };
    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'firstName lastName')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);
    return { posts, total, page, limit };
  },

  async getPostBySlug(slug: string) {
    const post = await Blog.findOne({ slug, status: 'published' }).populate('author', 'firstName lastName');
    if (post) {
      post.viewCount++;
      await post.save();
    }
    return post;
  },

  async getAllPosts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Blog.find()
        .populate('author', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(),
    ]);
    return { posts, total, page, limit };
  },

  async createPost(data: any, authorId: string) {
    const slug = generateSlug(data.title);
    const existing = await Blog.findOne({ slug });
    if (existing) throw ApiError.conflict('A post with this title already exists');

    return Blog.create({
      ...data,
      slug,
      author: authorId,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    });
  },

  async updatePost(id: string, data: any) {
    const post = await Blog.findById(id);
    if (!post) throw ApiError.notFound('Post not found');

    if (data.title && data.title !== post.title) {
      data.slug = generateSlug(data.title);
    }
    if (data.status === 'published' && post.status !== 'published') {
      data.publishedAt = new Date();
    }

    Object.assign(post, data);
    return post.save();
  },

  async deletePost(id: string) {
    return Blog.findByIdAndDelete(id);
  },

  // Pages
  async getPageBySlug(slug: string) {
    return Page.findOne({ slug, isPublished: true });
  },

  async getAllPages() {
    return Page.find().sort({ title: 1 });
  },

  async createPage(data: any) {
    const slug = generateSlug(data.title);
    return Page.create({ ...data, slug });
  },

  async updatePage(id: string, data: any) {
    if (data.title) data.slug = generateSlug(data.title);
    return Page.findByIdAndUpdate(id, data, { new: true });
  },

  async deletePage(id: string) {
    return Page.findByIdAndDelete(id);
  },

  // Reviews
  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const filter = { product: productId, status: 'approved' };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    return { reviews, total, page, limit };
  },

  async createReview(data: any, userId: string) {
    const existing = await Review.findOne({ product: data.productId, user: userId });
    if (existing) throw ApiError.conflict('You have already reviewed this product');

    return Review.create({
      product: data.productId,
      user: userId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    });
  },

  async moderateReview(id: string, status: 'approved' | 'rejected') {
    return Review.findByIdAndUpdate(id, { status }, { new: true });
  },

  async getPendingReviews(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { status: 'pending' };
    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'firstName lastName')
        .populate('product', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(filter),
    ]);
    return { reviews, total, page, limit };
  },

  // Wishlist
  async getWishlist(userId: string) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products',
      select: 'name slug sku price images shortDescription status type pricingModel',
    });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
  },

  async addToWishlist(userId: string, productId: string) {
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [productId] });
    } else if (!wishlist.products.some((p) => p.toString() === productId)) {
      wishlist.products.push(productId as any);
      await wishlist.save();
    }
    return wishlist;
  },

  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId) as any;
      await wishlist.save();
    }
    return wishlist;
  },

  // Settings
  async getSettings(group?: string) {
    const filter = group ? { group } : {};
    const settings = await Settings.find(filter);
    const result: Record<string, any> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    return result;
  },

  async updateSetting(key: string, value: any, group = 'general') {
    return Settings.findOneAndUpdate(
      { key },
      { key, value, group },
      { upsert: true, new: true }
    );
  },
};
