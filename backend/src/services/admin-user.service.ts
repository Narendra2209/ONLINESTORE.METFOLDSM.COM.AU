import User from '../models/User';
import Role from '../models/Role';
import { ApiError } from '../utils/ApiError';

const adminRoleNames = ['super_admin', 'admin', 'manager', 'sales_staff', 'inventory_staff', 'content_staff'];

export const adminUserService = {
  async listAdminUsers() {
    const adminRoles = await Role.find({ name: { $in: adminRoleNames } }).select('_id');
    const roleIds = adminRoles.map((r) => r._id);

    return User.find({ role: { $in: roleIds } })
      .populate('role', 'name displayName')
      .sort({ createdAt: -1 });
  },

  async createAdminUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
    isActive?: boolean;
  }) {
    const role = await Role.findById(data.role);
    if (!role) throw ApiError.notFound('Role not found');
    if (!adminRoleNames.includes(role.name)) {
      throw ApiError.badRequest('Selected role is not an admin role');
    }

    // If user already exists, just assign the role
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      existing.role = data.role as any;
      if (data.firstName) existing.firstName = data.firstName;
      if (data.lastName) existing.lastName = data.lastName;
      if (data.isActive !== undefined) existing.isActive = data.isActive;
      return existing.save();
    }

    // New user — password required
    if (!data.password) throw ApiError.badRequest('Password is required for new users');

    return User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
      isActive: data.isActive ?? true,
      isVerified: true,
      isApproved: true,
      userType: 'retail',
    });
  },

  async findUserByEmail(email: string) {
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') })
      .populate('role', 'name displayName');
    if (!user) throw ApiError.notFound('No user found with this email');
    return user;
  },

  async updateAdminUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
    }
  ) {
    const user = await User.findById(id).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.email && data.email !== user.email) {
      const existing = await User.findOne({ email: data.email });
      if (existing) throw ApiError.conflict('Email already in use');
      user.email = data.email;
    }
    if (data.password) user.password = data.password;
    if (data.role) user.role = data.role as any;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    return user.save();
  },

  async deleteAdminUser(id: string) {
    const user = await User.findById(id).populate('role', 'name');
    if (!user) throw ApiError.notFound('User not found');

    const roleName = (user.role as any)?.name;
    if (roleName === 'super_admin') {
      const superAdminRole = await Role.findOne({ name: 'super_admin' });
      const count = await User.countDocuments({ role: superAdminRole?._id });
      if (count <= 1) {
        throw ApiError.badRequest('Cannot delete the last super admin');
      }
    }

    return User.findByIdAndDelete(id);
  },

  // Role management
  async listRoles() {
    return Role.find().sort({ name: 1 });
  },

  async updateRole(id: string, data: { displayName?: string; permissions?: Array<{ resource: string; actions: string[] }> }) {
    const role = await Role.findById(id);
    if (!role) throw ApiError.notFound('Role not found');
    if (role.name === 'super_admin') {
      throw ApiError.badRequest('Cannot modify super admin role');
    }

    if (data.displayName) role.displayName = data.displayName;
    if (data.permissions) role.permissions = data.permissions as any;

    return role.save();
  },
};
