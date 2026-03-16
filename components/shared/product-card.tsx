"use client";

import React from "react";
import { Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/lib/icons";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { useToastContext } from "@/components/providers/toast-provider";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  isTrending?: boolean;
  imageSrc?: string;
  colors?: string[];
}

export default function ProductCard({
  id,
  slug,
  title,
  description,
  price,
  rating,
  reviewCount,
  isTrending = false,
  imageSrc,
  colors = [],
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToastContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id,
      slug,
      title,
      price,
      quantity: 1,
      selectedColor: colors[0] || "Default",
      image: imageSrc || "/products/placeholder.png",
    });

    toast({
      title: "Added to cart ✓",
      description: `${title} added to your cart`,
      duration: 3000,
    });
  };

  return (
    <Link href={`/products/${slug}`}>
      <div className="bg-primary-foreground rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer h-full">
        {/* Image Container */}
        <div className="bg-secondary-gray h-[30svh] flex items-center justify-center relative overflow-hidden">
          {imageSrc && (
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          )}
          {isTrending && (
            <div className="absolute top-3 left-3 bg-accent-blue-light text-accent-blue px-3 py-2 rounded-full flex items-center gap-1 text-xs font-semibold">
              <TrendingUp size={14} className="text-secondary-dark" />
              Trending
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col h-full justify-between">
          <div>
            <h3 className="text-primary-light font-bold mb-2">{title}</h3>
            <p className="text-secondary-gray text-sm mb-4">{description}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.floor(rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-secondary-gray"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-secondary-gray">
                ({reviewCount})
              </span>
            </div>
            <div className="flex justify-between items-center pt-4 ">
              <span className="font-bold text-lg text-accent-blue">
                ₦{price.toLocaleString()}
              </span>
              <Button
                onClick={handleAddToCart}
                variant="ghost"
                size="sm"
                className="bg-secondary-dark px-4 gap-2 hover:bg-accent-blue text-primary-light hover:text-primary-foreground transition-colors">
                <CartIcon /> Add
              </Button>
            </div>
          </div>

          {/* Price and Button */}
        </div>
      </div>
    </Link>
  );
}
