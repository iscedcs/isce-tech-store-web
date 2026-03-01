import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  customization?: {
    frontDesign?: File | null;
    backDesign?: File | null;
    hasCustomDesign: boolean;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  updateCustomization: (slug: string, customization: CartItem["customization"]) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.slug === item.slug);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (slug) =>
        set((state) => ({
          items: state.items.filter((i) => i.slug !== slug),
        })),

      updateQuantity: (slug, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, quantity } : i
          ),
        })),

      updateCustomization: (slug, customization) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, customization } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: typeof window !== "undefined" ? localStorage : undefined,
    }
  )
);