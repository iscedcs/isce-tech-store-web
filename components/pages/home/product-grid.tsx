"use client";

import ProductCard from "@/components/shared/product-card";
import { PRODUCTS } from "@/lib/const";

export default function ProductGrid() {
  const products = Object.values(PRODUCTS);

  return (
    <section className="bg-primary-light px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </section>
  );
}
