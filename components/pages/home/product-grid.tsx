"use client";

import ProductCard from "@/components/shared/product-card";
import { PRODUCTS } from "@/lib/const";

interface ProductGridProps {
  selectedCategory: string;
}

export default function ProductGrid({ selectedCategory }: ProductGridProps) {
  const products =
    selectedCategory === "All"
      ? Object.values(PRODUCTS)
      : Object.values(PRODUCTS).filter(
          (product) => product.category === selectedCategory,
        );

  return (
    <section className="bg-primary-light px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                id={product.id}
                slug={product.slug}
                title={product.title}
                description={product.description}
                price={product.price}
                rating={product.rating}
                reviewCount={product.reviewCount}
                isTrending={true}
                imageSrc={product.imageSrc}
                colors={product.colors}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-secondary-gray text-sm sm:text-base">
            No products found for this category.
          </div>
        )}
      </div>
    </section>
  );
}
