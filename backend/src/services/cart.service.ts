import Cart, { ICart } from '../models/Cart';
import Product from '../models/Product';
import { pricingService } from './pricing.service';
import { ApiError } from '../utils/ApiError';
import { roundPrice } from '../utils/helpers';
import { GST_RATE } from '../config/constants';

export const cartService = {
  async getCart(userId: string | null, sessionId: string): Promise<ICart> {
    let cart = userId
      ? await Cart.findOne({ user: userId }).populate('items.product', 'name slug sku images')
      : await Cart.findOne({ sessionId }).populate('items.product', 'name slug sku images');

    if (!cart) {
      cart = await Cart.create({ user: userId, sessionId, items: [] });
    }

    return cart;
  },

  async addItem(
    userId: string | null,
    sessionId: string,
    data: {
      productId: string;
      selectedAttributes: Record<string, string>;
      length?: number;
      quantity: number;
      userType?: 'retail' | 'trade';
    }
  ) {
    const product = await Product.findById(data.productId);
    if (!product) throw ApiError.notFound('Product not found');

    // Calculate price
    let unitPrice: number;
    let pricingModel: string;

    if (product.type === 'simple') {
      if (!product.price) throw ApiError.badRequest('Product has no price');
      unitPrice = product.price;
      pricingModel = 'fixed';
    } else {
      if (product.pricingModel === 'quote_only') {
        throw ApiError.badRequest('This product requires a quote request');
      }

      const breakdown = await pricingService.calculatePrice({
        productId: data.productId,
        selectedAttributes: data.selectedAttributes,
        length: data.length,
        quantity: data.quantity,
        userType: data.userType,
      });

      unitPrice = breakdown.unitPrice;
      pricingModel = breakdown.pricingModel;
    }

    const lineTotal = roundPrice(unitPrice * data.quantity);

    const cart = await this.getCart(userId, sessionId);

    // Build selected attributes array with names
    const selectedAttrs = Object.entries(data.selectedAttributes).map(([attrId, value]) => ({
      attribute: attrId as any,
      attributeName: attrId, // Will be populated
      value,
    }));

    // Check if same product + attributes + length combo exists
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === data.productId &&
        JSON.stringify(item.selectedAttributes.map((a) => `${a.attribute}:${a.value}`).sort()) ===
          JSON.stringify(selectedAttrs.map((a) => `${a.attribute}:${a.value}`).sort()) &&
        item.length === (data.length || null)
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += data.quantity;
      cart.items[existingIndex].unitPrice = unitPrice;
      cart.items[existingIndex].lineTotal = roundPrice(
        unitPrice * cart.items[existingIndex].quantity
      );
    } else {
      cart.items.push({
        product: data.productId as any,
        variant: null,
        selectedAttributes: selectedAttrs,
        pricingModel,
        unitPrice,
        length: data.length || null,
        quantity: data.quantity,
        lineTotal,
      });
    }

    await cart.save();
    return Cart.findById(cart._id).populate('items.product', 'name slug sku images');
  },

  async updateItemQuantity(userId: string | null, sessionId: string, itemId: string, quantity: number) {
    if (quantity < 1) throw ApiError.badRequest('Quantity must be at least 1');

    const cart = await this.getCart(userId, sessionId);
    const item = (cart.items as any).id(itemId);
    if (!item) throw ApiError.notFound('Cart item not found');

    item.quantity = quantity;
    item.lineTotal = roundPrice(item.unitPrice * quantity);

    await cart.save();
    return Cart.findById(cart._id).populate('items.product', 'name slug sku images');
  },

  async removeItem(userId: string | null, sessionId: string, itemId: string) {
    const cart = await this.getCart(userId, sessionId);
    cart.items = cart.items.filter((item) => (item as any)._id?.toString() !== itemId) as any;
    await cart.save();
    return Cart.findById(cart._id).populate('items.product', 'name slug sku images');
  },

  async clearCart(userId: string | null, sessionId: string) {
    const cart = await this.getCart(userId, sessionId);
    cart.items = [] as any;
    await cart.save();
    return cart;
  },

  async mergeGuestCart(sessionId: string, userId: string) {
    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = await Cart.create({ user: userId, items: [] });
    }

    for (const guestItem of guestCart.items) {
      userCart.items.push(guestItem);
    }

    await userCart.save();
    await Cart.deleteOne({ _id: guestCart._id });
  },

  getCartSummary(cart: ICart) {
    const subtotal = roundPrice(cart.items.reduce((sum, item) => sum + item.lineTotal, 0));
    const taxAmount = roundPrice(subtotal * GST_RATE);
    const total = roundPrice(subtotal + taxAmount);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return { subtotal, taxAmount, total, itemCount };
  },
};
