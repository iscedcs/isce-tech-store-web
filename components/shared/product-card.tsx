"use client";

import React from "react";
import { Star, TrendingUp, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/lib/icons";

interface ProductCardProps {
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  isTrending?: boolean;
}

export default function ProductCard({
  title,
  description,
  price,
  rating,
  reviewCount,
  isTrending = false,
}: ProductCardProps) {
  return (
    <div className="bg-primary-foreground rounded-lg  overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image Placeholder */}
      <div className="bg-secondary-gray h-[30svh]  flex items-center justify-center relative">
        {isTrending && (
          <div className="absolute top-3 left-3 bg-accent-blue-light text-accent-blue px-3 py-2 rounded-full flex items-center gap-1 text-xs font-semibold">
            <TrendingUp size={14} className="text-secondary-dark" />
            Trending
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
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
                  i < rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-secondary-gray"
                }
              />
            ))}
          </div>
          <span className="text-xs text-secondary-gray">({reviewCount})</span>
        </div>

        {/* Price and Button */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg bg-linear-to-r from-[#0052D4] to-[#4364F7] bg-clip-text text-transparent">
            ₦{price}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="bg-secondary-dark px-4 gap-2 hover:bg-accent-blue text-primary-light hover:text-primary-foreground">
            <CartIcon /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}
