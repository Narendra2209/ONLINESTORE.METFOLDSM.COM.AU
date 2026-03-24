import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Metfold E-Commerce API',
    version: '1.0.0',
    description: 'Complete API documentation for Metfold E-Commerce backend',
  },
  servers: [{ url: '/api/v1', description: 'API v1' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Health check' },
    { name: 'Auth', description: 'Authentication & user management' },
    { name: 'Categories', description: 'Product categories (public)' },
    { name: 'Products', description: 'Products (public)' },
    { name: 'Cart', description: 'Shopping cart' },
    { name: 'Orders', description: 'Customer orders' },
    { name: 'CMS', description: 'Banners, Blog, Pages, Reviews, Wishlist' },
    { name: 'Admin - Categories', description: 'Category management' },
    { name: 'Admin - Products', description: 'Product management' },
    { name: 'Admin - Attributes', description: 'Attribute management' },
    { name: 'Admin - Orders', description: 'Order management' },
    { name: 'Admin - Imports', description: 'Excel import' },
    { name: 'Admin - CMS', description: 'CMS management' },
    { name: 'Admin - Reports', description: 'Reports & analytics' },
    { name: 'Admin - Users', description: 'Admin user management' },
    { name: 'Admin - Roles', description: 'Role management' },
  ],
  paths: {
    // ── Health ──
    '/health': {
      get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
    },

    // ── Auth ──
    '/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Register new user',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['firstName', 'lastName', 'email', 'password'], properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, phone: { type: 'string' }, company: { type: 'string' }, abn: { type: 'string' }, userType: { type: 'string', enum: ['retail', 'trade'] } } } } } },
        responses: { 201: { description: 'User registered' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 200: { description: 'Login successful' } },
      },
    },
    '/auth/initiate-registration': {
      post: { tags: ['Auth'], summary: 'Initiate OTP registration', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['firstName', 'lastName', 'email', 'password'], properties: { firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, phone: { type: 'string' } } } } } }, responses: { 200: { description: 'OTP sent' } } },
    },
    '/auth/verify-otp': {
      post: { tags: ['Auth'], summary: 'Verify OTP', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'otp'], properties: { email: { type: 'string' }, otp: { type: 'string' } } } } } }, responses: { 200: { description: 'OTP verified' } } },
    },
    '/auth/resend-otp': {
      post: { tags: ['Auth'], summary: 'Resend OTP', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } } } } }, responses: { 200: { description: 'OTP resent' } } },
    },
    '/auth/google': {
      post: { tags: ['Auth'], summary: 'Google OAuth login', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['idToken'], properties: { idToken: { type: 'string' } } } } } }, responses: { 200: { description: 'Login successful' } } },
    },
    '/auth/refresh-token': {
      post: { tags: ['Auth'], summary: 'Refresh access token', responses: { 200: { description: 'Token refreshed' } } },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Logged out' } } },
    },
    '/auth/forgot-password': {
      post: { tags: ['Auth'], summary: 'Request password reset', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string' } } } } } }, responses: { 200: { description: 'Reset email sent' } } },
    },
    '/auth/reset-password': {
      post: { tags: ['Auth'], summary: 'Reset password', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['token', 'password'], properties: { token: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { 200: { description: 'Password reset' } } },
    },
    '/auth/change-password': {
      post: { tags: ['Auth'], summary: 'Change password', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } } }, responses: { 200: { description: 'Password changed' } } },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Get current user profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'User profile' } } },
    },
    '/auth/addresses': {
      get: { tags: ['Auth'], summary: 'Get user addresses', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Addresses list' } } },
      post: { tags: ['Auth'], summary: 'Create address', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { label: { type: 'string' }, street: { type: 'string' }, city: { type: 'string' }, state: { type: 'string' }, postcode: { type: 'string' }, country: { type: 'string' }, isDefault: { type: 'boolean' } } } } } }, responses: { 201: { description: 'Address created' } } },
    },
    '/auth/addresses/{id}': {
      put: { tags: ['Auth'], summary: 'Update address', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Address updated' } } },
      delete: { tags: ['Auth'], summary: 'Delete address', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Address deleted' } } },
    },

    // ── Categories (Public) ──
    '/categories': {
      get: { tags: ['Categories'], summary: 'List all categories', responses: { 200: { description: 'Categories list' } } },
    },
    '/categories/{slug}': {
      get: { tags: ['Categories'], summary: 'Get category by slug', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Category details' } } },
    },

    // ── Products (Public) ──
    '/products': {
      get: {
        tags: ['Products'], summary: 'List products',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Product list' } },
      },
    },
    '/products/attributes/filterable': {
      get: { tags: ['Products'], summary: 'Get filterable attributes', responses: { 200: { description: 'Filterable attributes' } } },
    },
    '/products/{slug}': {
      get: { tags: ['Products'], summary: 'Get product by slug', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Product details with variants' } } },
    },
    '/products/{id}/calculate-price': {
      post: { tags: ['Products'], summary: 'Calculate product price', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { selectedAttributes: { type: 'object' }, length: { type: 'number' }, quantity: { type: 'number' } } } } } }, responses: { 200: { description: 'Calculated price' } } },
    },

    // ── Cart ──
    '/cart': {
      get: { tags: ['Cart'], summary: 'Get cart', responses: { 200: { description: 'Cart contents' } } },
      delete: { tags: ['Cart'], summary: 'Clear cart', responses: { 200: { description: 'Cart cleared' } } },
    },
    '/cart/items': {
      post: { tags: ['Cart'], summary: 'Add item to cart', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Item added' } } },
    },
    '/cart/items/{itemId}': {
      put: { tags: ['Cart'], summary: 'Update item quantity', parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { quantity: { type: 'number' } } } } } }, responses: { 200: { description: 'Item updated' } } },
      delete: { tags: ['Cart'], summary: 'Remove item from cart', parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Item removed' } } },
    },

    // ── Orders ──
    '/orders': {
      post: { tags: ['Orders'], summary: 'Create order', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Order created' } } },
      get: { tags: ['Orders'], summary: 'Get my orders', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Orders list' } } },
    },
    '/orders/my-orders': {
      get: { tags: ['Orders'], summary: 'Get my orders', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Orders list' } } },
    },
    '/orders/{orderNumber}': {
      get: { tags: ['Orders'], summary: 'Get order by number', security: [{ bearerAuth: [] }], parameters: [{ name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Order details' } } },
    },

    // ── CMS (Public) ──
    '/banners': { get: { tags: ['CMS'], summary: 'Get banners', responses: { 200: { description: 'Banners' } } } },
    '/blog': { get: { tags: ['CMS'], summary: 'Get blog posts', responses: { 200: { description: 'Blog posts' } } } },
    '/blog/{slug}': { get: { tags: ['CMS'], summary: 'Get blog post', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Blog post' } } } },
    '/pages/{slug}': { get: { tags: ['CMS'], summary: 'Get CMS page', parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Page' } } } },
    '/products/{productId}/reviews': { get: { tags: ['CMS'], summary: 'Get product reviews', parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Reviews' } } } },
    '/reviews': { post: { tags: ['CMS'], summary: 'Create review', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Review created' } } } },
    '/wishlist': {
      get: { tags: ['CMS'], summary: 'Get wishlist', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Wishlist' } } },
      post: { tags: ['CMS'], summary: 'Add to wishlist', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { productId: { type: 'string' } } } } } }, responses: { 200: { description: 'Added' } } },
    },
    '/wishlist/{productId}': {
      delete: { tags: ['CMS'], summary: 'Remove from wishlist', security: [{ bearerAuth: [] }], parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Removed' } } },
    },

    // ── Admin Categories ──
    '/admin/categories': {
      get: { tags: ['Admin - Categories'], summary: 'List categories', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Categories' } } },
      post: { tags: ['Admin - Categories'], summary: 'Create category', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, slug: { type: 'string' }, description: { type: 'string' }, parent: { type: 'string' }, sortOrder: { type: 'number' }, isActive: { type: 'boolean' } } } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/categories/{id}': {
      put: { tags: ['Admin - Categories'], summary: 'Update category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - Categories'], summary: 'Delete category', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/categories/reorder': {
      patch: { tags: ['Admin - Categories'], summary: 'Reorder categories', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Reordered' } } },
    },

    // ── Admin Products ──
    '/admin/products': {
      get: { tags: ['Admin - Products'], summary: 'List products', security: [{ bearerAuth: [] }], parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }, { name: 'search', in: 'query', schema: { type: 'string' } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'type', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Products' } } },
      post: { tags: ['Admin - Products'], summary: 'Create product', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'sku', 'type'], properties: { name: { type: 'string' }, sku: { type: 'string' }, type: { type: 'string', enum: ['simple', 'configurable'] }, status: { type: 'string' }, category: { type: 'string' }, price: { type: 'number' }, description: { type: 'string' }, pricingModel: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/products/{id}': {
      get: { tags: ['Admin - Products'], summary: 'Get product by ID', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Product' } } },
      put: { tags: ['Admin - Products'], summary: 'Update product', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - Products'], summary: 'Delete product', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/products/{id}/status': {
      patch: { tags: ['Admin - Products'], summary: 'Update product status', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['active', 'draft', 'archived'] } } } } } }, responses: { 200: { description: 'Updated' } } },
    },
    '/admin/products/{id}/duplicate': {
      post: { tags: ['Admin - Products'], summary: 'Duplicate product', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 201: { description: 'Duplicated' } } },
    },
    '/admin/products/{id}/images': {
      post: { tags: ['Admin - Products'], summary: 'Upload images', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } }, responses: { 200: { description: 'Uploaded' } } },
    },
    '/admin/products/{id}/images/{imageId}': {
      delete: { tags: ['Admin - Products'], summary: 'Delete image', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'imageId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/products/{id}/pricing-rules': {
      post: { tags: ['Admin - Products'], summary: 'Create pricing rule', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'baseRate'], properties: { name: { type: 'string' }, baseRate: { type: 'number' }, isActive: { type: 'boolean' }, priority: { type: 'number' } } } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/products/pricing/simulate': {
      post: { tags: ['Admin - Products'], summary: 'Simulate pricing', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Simulation result' } } },
    },

    // ── Admin Attributes ──
    '/admin/attributes': {
      get: { tags: ['Admin - Attributes'], summary: 'List attributes', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Attributes' } } },
      post: { tags: ['Admin - Attributes'], summary: 'Create attribute', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'type'], properties: { name: { type: 'string' }, slug: { type: 'string' }, type: { type: 'string', enum: ['select', 'number', 'text', 'color-swatch'] }, unit: { type: 'string' }, isRequired: { type: 'boolean' }, isFilterable: { type: 'boolean' } } } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/attributes/{id}': {
      put: { tags: ['Admin - Attributes'], summary: 'Update attribute', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - Attributes'], summary: 'Delete attribute', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },

    // ── Admin Orders ──
    '/admin/orders': {
      get: { tags: ['Admin - Orders'], summary: 'List all orders', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Orders' } } },
    },
    '/admin/orders/{id}/status': {
      patch: { tags: ['Admin - Orders'], summary: 'Update order status', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated' } } },
    },
    '/admin/orders/dashboard/stats': {
      get: { tags: ['Admin - Orders'], summary: 'Dashboard stats', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Stats' } } },
    },

    // ── Admin Imports ──
    '/admin/imports/preview': {
      post: { tags: ['Admin - Imports'], summary: 'Preview Excel import', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Preview data' } } },
    },
    '/admin/imports/upload': {
      post: { tags: ['Admin - Imports'], summary: 'Upload & process Excel', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' }, type: { type: 'string', enum: ['products', 'prices', 'stock'] } } } } } }, responses: { 200: { description: 'Import result' } } },
    },
    '/admin/imports': {
      get: { tags: ['Admin - Imports'], summary: 'List import jobs', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Import jobs' } } },
    },
    '/admin/imports/{id}': {
      get: { tags: ['Admin - Imports'], summary: 'Get import job', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Import job details' } } },
      delete: { tags: ['Admin - Imports'], summary: 'Delete import job', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },

    // ── Admin CMS ──
    '/admin/cms/banners': {
      get: { tags: ['Admin - CMS'], summary: 'List banners', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Banners' } } },
      post: { tags: ['Admin - CMS'], summary: 'Create banner', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/cms/banners/{id}': {
      put: { tags: ['Admin - CMS'], summary: 'Update banner', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - CMS'], summary: 'Delete banner', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/cms/blog': {
      get: { tags: ['Admin - CMS'], summary: 'List blog posts', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Posts' } } },
      post: { tags: ['Admin - CMS'], summary: 'Create blog post', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/cms/blog/{id}': {
      put: { tags: ['Admin - CMS'], summary: 'Update blog post', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - CMS'], summary: 'Delete blog post', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/cms/pages': {
      get: { tags: ['Admin - CMS'], summary: 'List pages', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Pages' } } },
      post: { tags: ['Admin - CMS'], summary: 'Create page', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/cms/pages/{id}': {
      put: { tags: ['Admin - CMS'], summary: 'Update page', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - CMS'], summary: 'Delete page', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/admin/cms/reviews': {
      get: { tags: ['Admin - CMS'], summary: 'List pending reviews', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Reviews' } } },
    },
    '/admin/cms/reviews/{id}': {
      put: { tags: ['Admin - CMS'], summary: 'Moderate review', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
    },
    '/admin/cms/settings': {
      get: { tags: ['Admin - CMS'], summary: 'Get settings', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Settings' } } },
      put: { tags: ['Admin - CMS'], summary: 'Update settings', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
    },

    // ── Admin Reports ──
    '/admin/reports/dashboard': { get: { tags: ['Admin - Reports'], summary: 'Dashboard summary', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Dashboard data' } } } },
    '/admin/reports/revenue': { get: { tags: ['Admin - Reports'], summary: 'Revenue report', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Revenue data' } } } },
    '/admin/reports/top-products': { get: { tags: ['Admin - Reports'], summary: 'Top products', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Top products' } } } },
    '/admin/reports/orders-by-status': { get: { tags: ['Admin - Reports'], summary: 'Orders by status', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Orders breakdown' } } } },
    '/admin/reports/customer-acquisition': { get: { tags: ['Admin - Reports'], summary: 'Customer acquisition', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Acquisition data' } } } },
    '/admin/reports/inventory': { get: { tags: ['Admin - Reports'], summary: 'Inventory value', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Inventory data' } } } },

    // ── Admin Users ──
    '/admin/users': {
      get: { tags: ['Admin - Users'], summary: 'List admin users', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Users' } } },
      post: { tags: ['Admin - Users'], summary: 'Create admin user', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 201: { description: 'Created' } } },
    },
    '/admin/users/{id}': {
      put: { tags: ['Admin - Users'], summary: 'Update admin user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Admin - Users'], summary: 'Delete admin user', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },

    // ── Admin Roles ──
    '/admin/roles': {
      get: { tags: ['Admin - Roles'], summary: 'List roles', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Roles' } } },
    },
    '/admin/roles/{id}': {
      put: { tags: ['Admin - Roles'], summary: 'Update role', security: [{ bearerAuth: [] }], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Metfold API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  }));
}
