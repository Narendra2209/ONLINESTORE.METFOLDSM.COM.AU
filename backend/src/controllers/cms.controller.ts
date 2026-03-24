import { Request, Response } from 'express';
import { cmsService } from '../services/cms.service';
import { ApiResponse } from '../utils/ApiResponse';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middlewares/auth';

// Banners (Public)
export const getBanners = catchAsync(async (req: Request, res: Response) => {
  const banners = await cmsService.getBanners(req.query.position as string);
  ApiResponse.success({ res, data: banners });
});

// Banners (Admin)
export const getAllBanners = catchAsync(async (_req: Request, res: Response) => {
  const banners = await cmsService.getAllBanners();
  ApiResponse.success({ res, data: banners });
});

export const createBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await cmsService.createBanner(req.body);
  ApiResponse.created({ res, data: banner });
});

export const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await cmsService.updateBanner(req.params.id, req.body);
  if (!banner) throw ApiError.notFound('Banner not found');
  ApiResponse.success({ res, data: banner });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  await cmsService.deleteBanner(req.params.id);
  ApiResponse.noContent(res);
});

// Blog (Public)
export const getPublishedPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await cmsService.getPublishedPosts(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 10
  );
  ApiResponse.paginated(res, result.posts, result.total, result.page, result.limit);
});

export const getPostBySlug = catchAsync(async (req: Request, res: Response) => {
  const post = await cmsService.getPostBySlug(req.params.slug);
  if (!post) throw ApiError.notFound('Post not found');
  ApiResponse.success({ res, data: post });
});

// Blog (Admin)
export const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await cmsService.getAllPosts(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20
  );
  ApiResponse.paginated(res, result.posts, result.total, result.page, result.limit);
});

export const createPost = catchAsync(async (req: AuthRequest, res: Response) => {
  const post = await cmsService.createPost(req.body, req.user._id);
  ApiResponse.created({ res, data: post });
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const post = await cmsService.updatePost(req.params.id, req.body);
  ApiResponse.success({ res, data: post });
});

export const deletePost = catchAsync(async (req: Request, res: Response) => {
  await cmsService.deletePost(req.params.id);
  ApiResponse.noContent(res);
});

// Pages (Public)
export const getPageBySlug = catchAsync(async (req: Request, res: Response) => {
  const page = await cmsService.getPageBySlug(req.params.slug);
  if (!page) throw ApiError.notFound('Page not found');
  ApiResponse.success({ res, data: page });
});

// Pages (Admin)
export const getAllPages = catchAsync(async (_req: Request, res: Response) => {
  const pages = await cmsService.getAllPages();
  ApiResponse.success({ res, data: pages });
});

export const createPage = catchAsync(async (req: Request, res: Response) => {
  const page = await cmsService.createPage(req.body);
  ApiResponse.created({ res, data: page });
});

export const updatePage = catchAsync(async (req: Request, res: Response) => {
  const page = await cmsService.updatePage(req.params.id, req.body);
  if (!page) throw ApiError.notFound('Page not found');
  ApiResponse.success({ res, data: page });
});

export const deletePage = catchAsync(async (req: Request, res: Response) => {
  await cmsService.deletePage(req.params.id);
  ApiResponse.noContent(res);
});

// Reviews (Public)
export const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await cmsService.getProductReviews(
    req.params.productId,
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 10
  );
  ApiResponse.paginated(res, result.reviews, result.total, result.page, result.limit);
});

export const createReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const review = await cmsService.createReview(req.body, req.user._id);
  ApiResponse.created({ res, data: review });
});

// Reviews (Admin)
export const getPendingReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await cmsService.getPendingReviews(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20
  );
  ApiResponse.paginated(res, result.reviews, result.total, result.page, result.limit);
});

export const moderateReview = catchAsync(async (req: Request, res: Response) => {
  const review = await cmsService.moderateReview(req.params.id, req.body.status);
  if (!review) throw ApiError.notFound('Review not found');
  ApiResponse.success({ res, data: review });
});

// Wishlist
export const getWishlist = catchAsync(async (req: AuthRequest, res: Response) => {
  const wishlist = await cmsService.getWishlist(req.user._id);
  ApiResponse.success({ res, data: wishlist });
});

export const addToWishlist = catchAsync(async (req: AuthRequest, res: Response) => {
  const wishlist = await cmsService.addToWishlist(req.user._id, req.body.productId);
  ApiResponse.success({ res, data: wishlist });
});

export const removeFromWishlist = catchAsync(async (req: AuthRequest, res: Response) => {
  const wishlist = await cmsService.removeFromWishlist(req.user._id, req.params.productId);
  ApiResponse.success({ res, data: wishlist });
});

// Settings (Admin)
export const getSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await cmsService.getSettings(req.query.group as string);
  ApiResponse.success({ res, data: settings });
});

export const updateSettings = catchAsync(async (req: Request, res: Response) => {
  const entries = req.body.settings as Array<{ key: string; value: any; group?: string }>;
  for (const entry of entries) {
    await cmsService.updateSetting(entry.key, entry.value, entry.group);
  }
  ApiResponse.success({ res, message: 'Settings updated' });
});
