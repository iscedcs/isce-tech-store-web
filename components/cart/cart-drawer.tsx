"use client";

import { useState } from "react";
import { PRODUCTS } from "@/lib/const";
import { TrashIcon } from "@/lib/icons";
import { CartItem, useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    onClose();
    router.push("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-secondary-dark-2 border-l border-secondary-gray z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-gray">
          <h2 className="text-lg sm:text-xl font-bold text-primary-light">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-secondary-gray hover:text-primary-light transition-colors text-xl sm:text-2xl">
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-secondary-foreground mb-4">
                Your cart is empty
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="inline-block px-4 py-2 bg-accent-blue text-primary rounded-lg text-sm font-semibold hover:bg-accent-blue-light transition-colors">
                Continue Shopping
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <CartItemCard
                key={item.slug}
                item={item}
                product={PRODUCTS[item.slug]}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-secondary-gray p-4 sm:p-6 space-y-3 sm:space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-primary-light font-semibold text-sm sm:text-base">
                Subtotal:
              </span>
              <span className="text-lg sm:text-2xl font-bold text-accent-blue">
                {formatCurrency(getTotalPrice())}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors bg-accent-blue text-primary hover:bg-accent-blue-light disabled:opacity-50">
              {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base border border-secondary-gray text-primary-light hover:border-accent-blue transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

interface CartItemCardProps {
  item: CartItem;
  product: any;
  onRemove: (slug: string) => void;
  onUpdateQuantity: (slug: string, quantity: number) => void;
}

function CartItemCard({
  item,
  product,
  onRemove,
  onUpdateQuantity,
}: CartItemCardProps) {
  return (
    <div className="bg-primary-light/10 opacity- rounded-lg p-3 sm:p-4 border border-secondary-gray">
      {/* Product Info */}
      <div className="flex gap-3 mb-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-secondary-dark">
          <Image
            src={product.imageSrc}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-primary-light font-semibold text-xs sm:text-sm line-clamp-2">
            {item.title}
          </h3>
          {item.selectedColor && (
            <p className="text-secondary-foreground text-xs mt-1">
              Color: {item.selectedColor}
            </p>
          )}
          <p className="text-accent-blue font-semibold text-sm sm:text-base mt-2">
            ₦{item.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quantity & Remove */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              onUpdateQuantity(item.slug, Math.max(1, item.quantity - 1))
            }
            className="w-6 h-6 rounded bg-secondary-dark border border-secondary-gray text-primary-light text-xs hover:border-accent-blue transition-colors flex items-center justify-center">
            −
          </button>
          <span className="text-primary-light text-sm font-medium w-4 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.slug, item.quantity + 1)}
            className="w-6 h-6 rounded bg-secondary-dark border border-secondary-gray text-primary-light text-xs hover:border-accent-blue transition-colors flex items-center justify-center">
            +
          </button>
        </div>
        <button
          onClick={() => onRemove(item.slug)}
          className="text-secondary-gray cursor-pointer hover:text-destructive transition-colors text-sm font-medium">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
