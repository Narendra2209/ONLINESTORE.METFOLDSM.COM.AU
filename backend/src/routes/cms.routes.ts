import { Router } from 'express';
import * as cmsController from '../controllers/cms.controller';
import { authenticate } from '../middlewares/auth';
import { authorizePermission } from '../middlewares/authorize';

const router = Router();

// Public routes
router.get('/banners', cmsController.getBanners);
router.get('/blog', cmsController.getPublishedPosts);
router.get('/blog/:slug', cmsController.getPostBySlug);
router.get('/pages/:slug', cmsController.getPageBySlug);
router.get('/products/:productId/reviews', cmsController.getProductReviews);

// Authenticated routes
router.post('/reviews', authenticate, cmsController.createReview);
router.get('/wishlist', authenticate, cmsController.getWishlist);
router.post('/wishlist', authenticate, cmsController.addToWishlist);
router.delete('/wishlist/:productId', authenticate, cmsController.removeFromWishlist);

export default router;

// Admin routes
export const adminCmsRoutes = Router();

// Banners
adminCmsRoutes.get('/banners', authenticate, authorizePermission('settings', 'read'), cmsController.getAllBanners);
adminCmsRoutes.post('/banners', authenticate, authorizePermission('settings', 'create'), cmsController.createBanner);
adminCmsRoutes.put('/banners/:id', authenticate, authorizePermission('settings', 'update'), cmsController.updateBanner);
adminCmsRoutes.delete('/banners/:id', authenticate, authorizePermission('settings', 'delete'), cmsController.deleteBanner);

// Blog
adminCmsRoutes.get('/blog', authenticate, authorizePermission('settings', 'read'), cmsController.getAllPosts);
adminCmsRoutes.post('/blog', authenticate, authorizePermission('settings', 'create'), cmsController.createPost);
adminCmsRoutes.put('/blog/:id', authenticate, authorizePermission('settings', 'update'), cmsController.updatePost);
adminCmsRoutes.delete('/blog/:id', authenticate, authorizePermission('settings', 'delete'), cmsController.deletePost);

// Pages
adminCmsRoutes.get('/pages', authenticate, authorizePermission('settings', 'read'), cmsController.getAllPages);
adminCmsRoutes.post('/pages', authenticate, authorizePermission('settings', 'create'), cmsController.createPage);
adminCmsRoutes.put('/pages/:id', authenticate, authorizePermission('settings', 'update'), cmsController.updatePage);
adminCmsRoutes.delete('/pages/:id', authenticate, authorizePermission('settings', 'delete'), cmsController.deletePage);

// Reviews
adminCmsRoutes.get('/reviews', authenticate, authorizePermission('settings', 'read'), cmsController.getPendingReviews);
adminCmsRoutes.put('/reviews/:id', authenticate, authorizePermission('settings', 'update'), cmsController.moderateReview);

// Settings
adminCmsRoutes.get('/settings', authenticate, authorizePermission('settings', 'read'), cmsController.getSettings);
adminCmsRoutes.put('/settings', authenticate, authorizePermission('settings', 'update'), cmsController.updateSettings);
