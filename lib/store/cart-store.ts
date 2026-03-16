import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  customization?: {
    frontDesign?: string | null;
    backDesign?: string | null;
    hasCustomDesign: boolean;
    customizationFee?: number;
    designServiceFee?: number;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  updateCustomization: (
    slug: string,
    customization: CartItem["customization"],
  ) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getCustomizationFees: () => number;
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
                  : i,
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
            i.slug === slug ? { ...i, quantity } : i,
          ),
        })),

      updateCustomization: (slug, customization) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.slug === slug ? { ...i, customization } : i,
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const basePrice = item.price * item.quantity;
          const customizationFee =
            (item.customization?.customizationFee || 0) * item.quantity;
          const designServiceFee =
            (item.customization?.designServiceFee || 0) * item.quantity;
          return total + basePrice + customizationFee + designServiceFee;
        }, 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getCustomizationFees: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const customizationFee =
            (item.customization?.customizationFee || 0) * item.quantity;
          const designServiceFee =
            (item.customization?.designServiceFee || 0) * item.quantity;
          return total + customizationFee + designServiceFee;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
