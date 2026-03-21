"use client";

import Image from "next/image";

interface ProductImageSectionProps {
  title: string;
  imageSrc: string;
  badge?: string;
}

export default function ProductImageSection({
  title,
  imageSrc,
  badge = "NFC",
}: ProductImageSectionProps) {
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
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Thumbnail section - optional gallery */}
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-secondary-dark-3 border border-secondary-gray rounded-lg sm:rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-accent-blue transition-colors overflow-hidden">
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
    </div>
  );
}
