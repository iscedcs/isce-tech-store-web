"use client";

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
    <div className="flex flex-col gap-4">
      <div className="relative bg-gradient-secondary border border-secondary-gray rounded-2xl overflow-hidden aspect-square flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <span className="inline-block bg-primary-dark text-primary-light text-xs font-semibold px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
        {/* Placeholder for actual product image */}
        <div className="w-full h-full bg-linear-to-br from-secondary-gradient-1 to-secondary-gradient-3 flex items-center justify-center">
          <div className="text-center">
            <p className="text-secondary-foreground text-lg font-medium">
              {title}
            </p>
            <p className="text-secondary-foreground text-sm mt-2">
              Product Image
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail section placeholder */}
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-secondary border border-secondary-gray rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-accent-blue transition-colors">
            <div className="text-secondary-foreground text-xs">
              View {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
