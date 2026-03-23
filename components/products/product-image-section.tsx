"use client";

import Image from "next/image";
import { useState } from "react";
import { PRODUCT_VARIATIONS } from "@/lib/const";

interface ProductImageSectionProps {
  title: string;
  imageSrc: string;
  badge?: string;
  productSlug?: string;
}

export default function ProductImageSection({
  title,
  imageSrc,
  badge = "NFC",
  productSlug,
}: ProductImageSectionProps) {
  const variations =
    productSlug && PRODUCT_VARIATIONS[productSlug]
      ? PRODUCT_VARIATIONS[productSlug]
      : [];

  const [mainImage, setMainImage] = useState(imageSrc);

  return (
    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
      <div className="relative bg-secondary-dark-3 border border-secondary-gray rounded-xl sm:rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
          <span className="inline-block bg-primary text-primary-light text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
        <div className="w-full h-full relative">
          <Image
            src={mainImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Thumbnail section - show variations if available */}
      {variations.length > 0 && (
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${Math.min(variations.length, 4)}, 1fr)`,
          }}>
          {variations.map((variationSrc, i) => (
            <div
              onClick={() => setMainImage(variationSrc)}
              key={i}
              className="bg-secondary-dark-3 border border-secondary-gray rounded-lg sm:rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-accent-blue transition-colors overflow-hidden"
              style={{
                borderColor: mainImage === variationSrc ? "#4A90E2" : undefined,
              }}>
              <Image
                src={variationSrc}
                alt={`${title} variation ${i + 1}`}
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Fallback thumbnail section - show placeholder if no variations */}
      {variations.length === 0 && (
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              onClick={() => setMainImage(imageSrc)}
              key={i}
              className="bg-secondary-dark-3 border border-secondary-gray rounded-lg sm:rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-accent-blue transition-colors overflow-hidden"
              style={{
                borderColor: mainImage === imageSrc ? "#4A90E2" : undefined,
              }}>
              <Image
                src={imageSrc}
                alt={`${title} view ${i + 1}`}
                width={100}
                height={100}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
