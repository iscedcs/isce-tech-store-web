"use client";

import { Star, Check } from "lucide-react";

interface ProductInfoSectionProps {
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  benefits: string[];
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onCustomizeClick: () => void;
}

export default function ProductInfoSection({
  title,
  price,
  rating,
  reviewCount,
  description,
  benefits,
  quantity,
  onQuantityChange,
  onAddToCart,
  onCustomizeClick,
}: ProductInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary-light mb-4">
          {title}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-secondary-gray"
                }
              />
            ))}
          </div>
          <span className="text-secondary-foreground text-sm">
            {rating.toFixed(1)} ({reviewCount} Stars)
          </span>
        </div>

        {/* Price */}
        <div className="text-4xl font-bold text-accent-blue mb-4">
          ${price.toFixed(2)}
        </div>
      </div>

      {/* Description */}
      <p className="text-secondary-foreground text-base leading-relaxed">
        {description}
      </p>

      {/* Key Benefits */}
      <div>
        <h3 className="text-primary-light font-semibold mb-3">Key Benefits</h3>
        <ul className="space-y-2">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <Check size={20} className="text-accent-blue shrink-0" />
              <span className="text-secondary-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-medium text-primary-light mb-3">
          Quantity:
        </label>
        <div className="flex items-center gap-4 w-fit">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg bg-gradient-secondary border border-secondary-gray text-primary-light hover:border-accent-blue transition-colors flex items-center justify-center text-lg font-medium">
            −
          </button>
          <span className="text-xl font-semibold text-primary-light w-12 text-center">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-10 h-10 rounded-lg bg-gradient-secondary border border-secondary-gray text-primary-light hover:border-accent-blue transition-colors flex items-center justify-center text-lg font-medium">
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onAddToCart}
          className="w-full bg-accent-blue hover:bg-blue-600 text-primary-dark font-semibold py-3 px-6 rounded-lg transition-colors">
          Add to Cart
        </button>
        <button
          onClick={onCustomizeClick}
          className="w-full bg-gradient-secondary border border-accent-blue text-accent-blue hover:bg-opacity-80 font-semibold py-3 px-6 rounded-lg transition-colors">
          Enable Customisation
        </button>
      </div>
    </div>
  );
}
