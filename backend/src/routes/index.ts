import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes, { adminCategoryRoutes } from './category.routes';
import productRoutes, { adminProductRoutes, adminAttributeRoutes } from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes, { adminOrderRoutes } from './order.routes';
import importRoutes from './import.routes';
import cmsRoutes, { adminCmsRoutes } from './cms.routes';
import reportRoutes from './report.routes';
import adminUserRoutes, { roleRoutes } from './admin-user.routes';
import claddingRoutes, { adminCladdingRoutes } from './cladding.routes';
import dambusterRoutes, { adminDambusterRoutes } from './dambuster.routes';
import contactRoutes from './contact.routes';
import adminCustomerRoutes from './customer.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List all registered routes
router.get('/routes', (_req, res) => {
  const app = _req.app;
  const routes: { method: string; path: string }[] = [];

  const extractRoutes = (stack: any[], prefix: string) => {
    for (const layer of stack) {
      if (layer.route) {
        // Direct route
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
        for (const method of methods) {
          routes.push({ method, path: prefix + layer.route.path });
        }
      } else if (layer.name === 'router' && layer.handle?.stack) {
        // Nested router
        const routerPath = layer.keys?.length
          ? prefix + layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/').replace(/\^/g, '').replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param')
          : prefix + (layer.regexp.source === '^\\/?$' ? '' : layer.regexp.source.replace(/\\\//g, '/').replace(/^\^/, '').replace(/\\\/\?\(\?=\\\/\|\$\)$/,'').replace(/\(\?:\(\[\^\\\/\]\+\?\)\)/g, ':param'));
        extractRoutes(layer.handle.stack, routerPath);
      }
    }
  };

  extractRoutes(app._router.stack, '');
  res.json({ total: routes.length, routes });
});

// Public routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/cladding', claddingRoutes);
router.use('/dambuster', dambusterRoutes);
router.use('/contact', contactRoutes);

// Admin routes
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/products', adminProductRoutes);
router.use('/admin/attributes', adminAttributeRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/imports', importRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/roles', roleRoutes);
router.use('/admin/cladding', adminCladdingRoutes);
router.use('/admin/dambuster', adminDambusterRoutes);
router.use('/admin/customers', adminCustomerRoutes);

// CMS routes
router.use('/', cmsRoutes);
router.use('/admin/cms', adminCmsRoutes);

// Reports
router.use('/admin/reports', reportRoutes);

export default router;
