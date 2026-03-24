import Order, { IOrder } from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import { cartService } from './cart.service';
import { ApiError } from '../utils/ApiError';
import { generateOrderNumber, roundPrice } from '../utils/helpers';
import { GST_RATE } from '../config/constants';

interface CreateOrderInput {
  userId: string | null;
  sessionId: string;
  customerEmail: string;
  customerName: string;
  userType: 'retail' | 'trade';
  shippingAddress: any;
  billingAddress: any;
  deliveryMethod: 'delivery' | 'pickup';
  notes?: string;
  couponCode?: string;
}

export const orderService = {
  async createFromCart(input: CreateOrderInput) {
    const cart = await Cart.findOne(
      input.userId ? { user: input.userId } : { sessionId: input.sessionId }
    ).populate('items.product', 'name sku');

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cart is empty');
    }

    // Build order items with snapshots
    const orderItems = cart.items.map((item) => ({
      product: item.product._id || item.product,
      productName: (item.product as any).name || 'Product',
      productSku: (item.product as any).sku || '',
      variant: item.variant,
      selectedAttributes: item.selectedAttributes.map((a) => ({
        attributeName: a.attributeName,
        value: a.value,
      })),
      pricingModel: item.pricingModel,
      unitPrice: item.unitPrice,
      length: item.length,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    }));

    const summary = cartService.getCartSummary(cart);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: input.userId,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      userType: input.userType,
      items: orderItems,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress,
      subtotal: summary.subtotal,
      taxAmount: summary.taxAmount,
      shippingCost: 0, // TODO: shipping calculation
      discount: 0,
      total: summary.total,
      status: 'pending',
      statusHistory: [
        { status: 'pending', note: 'Order placed', changedBy: input.userId, changedAt: new Date() },
      ],
      deliveryMethod: input.deliveryMethod,
      notes: input.notes || '',
      couponCode: input.couponCode || '',
    });

    // Clear cart
    cart.items = [] as any;
    await cart.save();

    return order;
  },

  async getByOrderNumber(orderNumber: string) {
    const order = await Order.findOne({ orderNumber });
    if (!order) throw ApiError.notFound('Order not found');
    return order;
  },

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ user: userId }),
    ]);
    return { orders, total, page, limit };
  },

  async getAllOrders(query: any) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { orderNumber: new RegExp(query.search, 'i') },
        { customerEmail: new RegExp(query.search, 'i') },
        { customerName: new RegExp(query.search, 'i') },
      ];
    }

    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, total, page, limit };
  },

  async updateStatus(orderId: string, status: string, note: string, changedBy: string) {
    const order = await Order.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');

    order.status = status;
    order.statusHistory.push({
      status,
      note,
      changedBy: changedBy as any,
      changedAt: new Date(),
    });

    if (status === 'confirmed' && order.payment.status === 'pending') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    return order.save();
  },

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    return {
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
    };
  },
};
