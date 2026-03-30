import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import api from '@/lib/axios';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  _syncing: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Sync with backend
  syncToBackend: () => Promise<void>;
  loadFromBackend: () => Promise<void>;

  // Computed
  itemCount: number;
  subtotal: number;
}

// Sync cart items to backend (fire and forget)
async function pushCartToBackend(items: CartItem[]) {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    await api.post('/cart/sync', {
      items: items.map((item) => ({
        productId: item.product._id,
        productName: item.product.name,
        productSlug: item.product.slug,
        productSku: item.product.sku,
        productImages: item.product.images,
        selectedAttributes: item.selectedAttributes,
        pricingModel: item.pricingModel,
        unitPrice: item.unitPrice,
        length: item.length,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
    });
  } catch {
    // Silently fail — local cart is the fallback
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _syncing: false,

      addItem: (item) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) =>
            i.product._id === item.product._id &&
            JSON.stringify(i.selectedAttributes) === JSON.stringify(item.selectedAttributes) &&
            i.length === item.length
        );

        if (existingIndex >= 0) {
          const updatedItems = [...items];
          const existing = updatedItems[existingIndex];
          existing.quantity += item.quantity;
          const lengthMult = existing.pricingModel === 'per_metre' && existing.length ? existing.length : 1;
          existing.lineTotal = existing.unitPrice * lengthMult * existing.quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, { ...item, _id: crypto.randomUUID() }] });
        }
        // Sync to backend
        setTimeout(() => pushCartToBackend(get().items), 100);
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i._id !== itemId) });
        setTimeout(() => pushCartToBackend(get().items), 100);
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;
        const items = get().items.map((item) => {
          if (item._id !== itemId) return item;
          const lengthMult = item.pricingModel === 'per_metre' && item.length ? item.length : 1;
          return { ...item, quantity, lineTotal: item.unitPrice * lengthMult * quantity };
        });
        set({ items });
        setTimeout(() => pushCartToBackend(get().items), 100);
      },

      clearCart: () => {
        set({ items: [] });
        // Don't sync empty cart to backend here — logout handles its own sync
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (open) => set({ isOpen: open }),

      // Sync full cart to backend (returns Promise so caller can await)
      syncToBackend: () => {
        return pushCartToBackend(get().items);
      },

      // Load cart from backend — replaces local cart with user's saved cart
      loadFromBackend: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) return;

          const { data } = await api.get('/cart/sync');
          const backendItems: CartItem[] = (data.data?.items || []).map((item: any) => ({
            _id: item._id || crypto.randomUUID(),
            product: {
              _id: item.productId || item.product?._id || '',
              name: item.productName || item.product?.name || 'Product',
              slug: item.productSlug || item.product?.slug || '',
              sku: item.productSku || item.product?.sku || '',
              images: item.productImages || item.product?.images || [],
            },
            selectedAttributes: item.selectedAttributes || [],
            pricingModel: item.pricingModel || 'per_piece',
            unitPrice: item.unitPrice || 0,
            length: item.length || undefined,
            quantity: item.quantity || 1,
            lineTotal: item.lineTotal || 0,
          }));

          // Replace local cart with backend cart (user's saved cart)
          if (backendItems.length > 0) {
            set({ items: backendItems });
          }
        } catch {
          // Silently fail — keep local cart as fallback
        }
      },

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.lineTotal, 0);
      },
    }),
    {
      name: 'metfold-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
