"use client";

import { useState } from "react";
import ProductImageSection from "./product-image-section";
import ProductInfoSection from "./product-info-section";
import CustomizationSection from "./customization-section";

interface ProductDetailWrapperProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    rating: number;
    reviewCount: number;
    description: string;
    benefits: string[];
    imageSrc: string;
    badge?: string;
  };
}

export default function ProductDetailWrapper({
  product,
}: ProductDetailWrapperProps) {
  const [quantity, setQuantity] = useState(1);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleAddToCart = () => {
    console.log("[v0] Adding to cart:", { product: product.title, quantity });
    // Cart logic will be implemented later
  };

  const handleCustomizeClick = () => {
    setIsCustomizing(true);
  };

  const handleCancelCustomization = () => {
    setIsCustomizing(false);
  };

  return (
    <div className="w-full">
      {!isCustomizing ? (
        // Main Product View
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <ProductImageSection
            title={product.title}
            imageSrc={product.imageSrc}
            badge={product.badge}
          />

          {/* Right: Product Info */}
          <ProductInfoSection
            title={product.title}
            price={product.price}
            rating={product.rating}
            reviewCount={product.reviewCount}
            description={product.description}
            benefits={product.benefits}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            onCustomizeClick={handleCustomizeClick}
          />
        </div>
      ) : (
        // Customization View
        <div className="max-w-4xl mx-auto">
          <CustomizationSection
            basePrice={product.price}
            quantity={quantity}
            onCancel={handleCancelCustomization}
          />
        </div>
      )}
    </div>
  );
}
