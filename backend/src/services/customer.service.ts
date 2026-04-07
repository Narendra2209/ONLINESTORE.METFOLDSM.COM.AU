import User from '../models/User';
import Role from '../models/Role';
import { ApiError } from '../utils/ApiError';

const customerRoleNames = ['customer'];

export const customerService = {
  async listCustomers(query: {
    page?: string;
    limit?: string;
    search?: string;
    userType?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const customerRoles = await Role.find({ name: { $in: customerRoleNames } }).select('_id');
    const roleIds = customerRoles.map((r) => r._id);

    const filter: any = { role: { $in: roleIds } };

    if (query.userType) {
      filter.userType = query.userType;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
      ];
    }

    const [customers, total] = await Promise.all([
      User.find(filter)
        .select('-refreshTokens -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return { customers, total, page, limit };
  },

  async updateCustomer(id: string, data: { isApproved?: boolean; isActive?: boolean }) {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound('Customer not found');

    if (data.isApproved !== undefined) user.isApproved = data.isApproved;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    return user.save();
  },
};
