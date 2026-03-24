import User from '../models/User';
import Role from '../models/Role';

export const seedAdmin = async () => {
  const superAdminRole = await Role.findOne({ name: 'super_admin' });
  if (!superAdminRole) {
    console.error('Super admin role not found. Seed roles first.');
    return;
  }

  const existingAdmin = await User.findOne({ email: 'admin@metfold.com.au' });
  if (existingAdmin) {
    console.log('Admin user already exists');
    return;
  }

  await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@metfold.com.au',
    password: 'Admin@12345',
    userType: 'retail',
    role: superAdminRole._id,
    isActive: true,
    isVerified: true,
    isApproved: true,
  });

  console.log('Seeded super admin user (admin@metfold.com.au / Admin@12345)');
};
