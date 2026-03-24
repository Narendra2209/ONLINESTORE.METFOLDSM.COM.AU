import Role from '../models/Role';

const allActions = ['create', 'read', 'update', 'delete'];

const rolesData = [
  {
    name: 'super_admin',
    displayName: 'Super Admin',
    description: 'Full system access',
    isSystem: true,
    permissions: [
      { resource: 'products', actions: allActions },
      { resource: 'categories', actions: allActions },
      { resource: 'attributes', actions: allActions },
      { resource: 'orders', actions: allActions },
      { resource: 'customers', actions: allActions },
      { resource: 'users', actions: allActions },
      { resource: 'roles', actions: allActions },
      { resource: 'pricing', actions: allActions },
      { resource: 'inventory', actions: allActions },
      { resource: 'imports', actions: allActions },
      { resource: 'reports', actions: ['read'] },
      { resource: 'cms', actions: allActions },
      { resource: 'settings', actions: allActions },
      { resource: 'audit_logs', actions: ['read'] },
    ],
  },
  {
    name: 'admin',
    displayName: 'Admin',
    description: 'Product, order, category, pricing, and user management',
    isSystem: true,
    permissions: [
      { resource: 'products', actions: allActions },
      { resource: 'categories', actions: allActions },
      { resource: 'attributes', actions: allActions },
      { resource: 'orders', actions: allActions },
      { resource: 'customers', actions: ['read', 'update'] },
      { resource: 'users', actions: allActions },
      { resource: 'pricing', actions: allActions },
      { resource: 'inventory', actions: allActions },
      { resource: 'imports', actions: allActions },
      { resource: 'reports', actions: ['read'] },
      { resource: 'cms', actions: allActions },
    ],
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Reports, products, orders, limited settings',
    isSystem: true,
    permissions: [
      { resource: 'products', actions: ['read', 'update'] },
      { resource: 'categories', actions: ['read'] },
      { resource: 'orders', actions: ['read', 'update'] },
      { resource: 'customers', actions: ['read'] },
      { resource: 'reports', actions: ['read'] },
      { resource: 'inventory', actions: ['read'] },
    ],
  },
  {
    name: 'sales_staff',
    displayName: 'Sales Staff',
    description: 'Orders, customer data, quotes',
    isSystem: true,
    permissions: [
      { resource: 'orders', actions: ['read', 'create', 'update'] },
      { resource: 'customers', actions: ['read', 'update'] },
      { resource: 'products', actions: ['read'] },
      { resource: 'pricing', actions: ['read'] },
    ],
  },
  {
    name: 'inventory_staff',
    displayName: 'Inventory Staff',
    description: 'Stock, SKU, warehouse quantities',
    isSystem: true,
    permissions: [
      { resource: 'inventory', actions: allActions },
      { resource: 'products', actions: ['read', 'update'] },
      { resource: 'imports', actions: ['create', 'read'] },
    ],
  },
  {
    name: 'content_staff',
    displayName: 'Content Staff',
    description: 'Banners, descriptions, SEO content',
    isSystem: true,
    permissions: [
      { resource: 'cms', actions: allActions },
      { resource: 'products', actions: ['read', 'update'] },
      { resource: 'categories', actions: ['read', 'update'] },
    ],
  },
  {
    name: 'customer',
    displayName: 'Customer',
    description: 'Default customer role',
    isSystem: true,
    permissions: [],
  },
];

export const seedRoles = async () => {
  for (const roleData of rolesData) {
    await Role.findOneAndUpdate(
      { name: roleData.name },
      roleData,
      { upsert: true, new: true }
    );
  }
  console.log(`Seeded ${rolesData.length} roles`);
};
