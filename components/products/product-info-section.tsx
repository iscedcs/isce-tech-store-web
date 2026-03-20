"use client";

import { Star, Check } from "lucide-react";

interface ProductInfoSectionProps {
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  features: string[];
  brandFeel: string[];
  quantity: number;
  selectedColor: string;
  availableColors: string[];
  onQuantityChange: (quantity: number) => void;
  onColorChange: (color: string) => void;
  onAddToCart: () => void;
  onCustomizeClick: () => void;
}

export default function ProductInfoSection({
  title,
  price,
  rating,
  reviewCount,
  description,
  longDescription,
  features,
  brandFeel,
  quantity,
  selectedColor,
  availableColors,
  onQuantityChange,
  onColorChange,
  onAddToCart,
  onCustomizeClick,
}: ProductInfoSectionProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-4">
          {title}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.floor(rating)
                    ? "text-accent-yellow-light"
                    : "text-secondary-gray"
                }>
                ★
              </span>
            ))}
          </div>
          <span className="text-secondary-foreground text-xs sm:text-sm">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-blue mb-4 sm:mb-4">
          ₦{price.toLocaleString()}
        </div>
      </div>

      {/* Description */}
      <p className="text-primary font-normal text-sm sm:text-base leading-relaxed">
        {description}
      </p>

      {longDescription && (
        <p className="text-primary text-xs sm:text-sm leading-relaxed">
          {longDescription}
        </p>
      )}

      {/* Brand Feel */}
      <div>
        <h3 className="text-primary font-semibold mb-2 sm:mb-3 text-xs sm:text-sm uppercase tracking-wide">
          Brand Feel
        </h3>
        <div className="flex flex-wrap gap-2">
          {brandFeel.map((feel, idx) => (
            <span
              key={idx}
              className="px-2 sm:px-3 py-1 bg-secondary-dark-2 text-primary-light text-xs font-medium rounded-full border border-secondary-gray">
              {feel}
            </span>
          ))}
        </div>
      </div>

      {/* Key Benefits */}
      <div className="bg-primary-light rounded-xl shadow-2xl px-4 sm:px-6 py-6 sm:py-8">
        <h3 className="text-primary font-semibold mb-3 text-sm sm:text-base">Key Features</h3>
        <ul className="space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-primary font-bold mt-1 shrink-0">✓</span>
              <span className="text-primary text-xs sm:text-sm font-normal">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Color Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-bold text-primary mb-2 sm:mb-3">
          Card Color
        </label>
        <select
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-secondary-dark-2 border border-secondary-gray rounded-lg text-primary-light text-sm sm:text-base focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue appearance-none cursor-pointer">
          {availableColors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-primary mb-2 sm:mb-3">
          Quantity
        </label>
        <div className="flex items-center gap-2 sm:gap-4 w-fit">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary-dark-2 border border-secondary-gray text-primary-light hover:border-accent-blue transition-colors flex items-center justify-center text-sm sm:text-lg font-medium">
            −
          </button>
          <span className="text-lg sm:text-xl font-semibold text-primary w-8 sm:w-12 text-center">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary-dark-2 border border-secondary-gray text-primary-light hover:border-accent-blue transition-colors flex items-center justify-center text-sm sm:text-lg font-medium">
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 sm:space-y-3 pt-4 sm:pt-6">
        <button
          onClick={onAddToCart}
          className="w-full bg-accent-blue hover:bg-accent-blue-light text-primary-light font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base">
          Add to Cart - ₦{(price * quantity).toLocaleString()}
        </button>
        <button
          onClick={onCustomizeClick}
          className="w-full bg-secondary-dark-2 border border-accent-blue text-primary-light hover:bg-secondary-dark-3 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base">
          Customize Card Design
        </button>
      </div>
    </div>
  );
}
