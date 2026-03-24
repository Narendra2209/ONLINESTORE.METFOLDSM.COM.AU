import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Computed
  itemCount: number;
  subtotal: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

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
          updatedItems[existingIndex].quantity += item.quantity;
          updatedItems[existingIndex].lineTotal =
            updatedItems[existingIndex].unitPrice * updatedItems[existingIndex].quantity;
          set({ items: updatedItems });
        } else {
          set({ items: [...items, { ...item, _id: crypto.randomUUID() }] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i._id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;
        const items = get().items.map((item) =>
          item._id === itemId
            ? { ...item, quantity, lineTotal: item.unitPrice * quantity }
            : item
        );
        set({ items });
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (open) => set({ isOpen: open }),

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
