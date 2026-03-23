"use client";

import { useState } from "react";
import ProductImageSection from "./product-image-section";
import ProductInfoSection from "./product-info-section";
import CustomizationSection from "./customization-section";
import { useCartStore } from "@/lib/store/cart-store";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailWrapperProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    rating: number;
    reviewCount: number;
    description: string;
    longDescription: string;
    features: string[];
    brandFeel: string[];
    imageSrc: string;
    badge?: string;
    colors: string[];
  };
}

export default function ProductDetailWrapper({
  product,
}: ProductDetailWrapperProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
      selectedColor,
      image: product.imageSrc,
    });

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.title} (${selectedColor}) added to your cart`,
    });
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Left: Product Image */}
          <ProductImageSection
            title={product.title}
            imageSrc={product.imageSrc}
            badge={product.badge}
            productSlug={product.slug}
          />

          {/* Right: Product Info */}
          <ProductInfoSection
            title={product.title}
            price={product.price}
            rating={product.rating}
            reviewCount={product.reviewCount}
            description={product.description}
            longDescription={product.longDescription}
            features={product.features}
            brandFeel={product.brandFeel}
            quantity={quantity}
            selectedColor={selectedColor}
            availableColors={product.colors}
            onQuantityChange={setQuantity}
            onColorChange={setSelectedColor}
            onAddToCart={handleAddToCart}
            onCustomizeClick={handleCustomizeClick}
          />
        </div>
      ) : (
        // Customization View
        <div className="max-w-4xl mx-auto">
          <CustomizationSection
            productTitle={product.title}
            productSlug={product.slug}
            productImage={product.imageSrc}
            basePrice={product.price}
            quantity={quantity}
            availableColors={product.colors}
            onCancel={handleCancelCustomization}
          />
        </div>
      )}
    </div>
  );
}
