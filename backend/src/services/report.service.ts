import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import mongoose from 'mongoose';

export const reportService = {
  async getRevenueByPeriod(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    const dateFormat = groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-W%V' : '%Y-%m';

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelled'] },
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    return Order.aggregate(pipeline);
  },

  async getTopProducts(startDate: Date, endDate: Date, limit = 10) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['cancelled'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 as const } },
      { $limit: limit },
    ];

    return Order.aggregate(pipeline);
  },

  async getOrdersByStatus() {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$total' },
        },
      },
      { $sort: { count: -1 as const } },
    ];

    return Order.aggregate(pipeline);
  },

  async getCustomerAcquisition(startDate: Date, endDate: Date) {
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            userType: '$userType',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 as const } },
    ];

    return User.aggregate(pipeline);
  },

  async getInventoryValue() {
    const pipeline = [
      {
        $match: {
          status: { $ne: 'archived' },
          trackInventory: true,
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', { $ifNull: ['$price', 0] }] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0],
            },
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $lte: ['$stock', 0] }, 1, 0],
            },
          },
        },
      },
    ];

    const result = await Product.aggregate(pipeline);
    return result[0] || { totalProducts: 0, totalStock: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 };
  },

  async getDashboardSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [monthlyRevenue, todayOrders, totalCustomers, pendingOrders] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ userType: { $in: ['retail', 'trade'] } }),
      Order.countDocuments({ status: 'pending' }),
    ]);

    return {
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      monthlyOrders: monthlyRevenue[0]?.count || 0,
      todayOrders,
      totalCustomers,
      pendingOrders,
    };
  },
};
