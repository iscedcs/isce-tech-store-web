"use client";

import ProductCard from "@/components/shared/product-card";

const products = [
  {
    id: 1,
    title: "Classic Digital Business Card",
    description:
      "Premium NFC business card with instant contact sharing. Tap to share....",
    price: 32.99,
    rating: 5,
    reviewCount: 4.8,
    isTrending: true,
  },
  {
    id: 2,
    title: "IISCE Stickers",
    description:
      "Premium NFC business card with instant contact sharing. Tap to share....",
    price: 32.99,
    rating: 5,
    reviewCount: 4.8,
    isTrending: true,
  },
  {
    id: 3,
    title: "NFC Smart Watch",
    description:
      "Premium NFC business card with instant contact sharing. Tap to share....",
    price: 32.99,
    rating: 5,
    reviewCount: 4.8,
    isTrending: true,
  },
];

export default function ProductGrid() {
  return (
    <section className="bg-primary-light px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              description={product.description}
              price={product.price}
              rating={product.rating}
              reviewCount={product.reviewCount}
              isTrending={product.isTrending}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
