"use client";

import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/lib/const";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CartIcon } from "@/lib/icons";
import { useCartStore } from "@/lib/store/cart-store";
import { useToastContext } from "@/components/providers/toast-provider";

export default function ProductsCategoryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { addItem } = useCartStore();
  const { toast } = useToastContext();

  const filteredProducts =
    selectedCategory === "All"
      ? Object.values(PRODUCTS)
      : Object.values(PRODUCTS).filter((p) => p.category === selectedCategory);

  const handleQuickAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      selectedColor: product.colors[0],
    });

    toast({
      title: "Added to cart ✓",
      description: `${product.title} (${product.colors[0]}) added to your cart`,
      duration: 3000,
    });
  };
  return (
    <div className="min-h-screen bg-primary-light">
      {/* Header */}
      <section className="bg-secondary-dark-2 py-12 px-4 border-b border-secondary-dark-2">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-accent-blue hover:text-accent-blue-light text-sm font-medium mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-primary-light mt-4 mb-2">
            All Products
          </h1>
          <p className="text-primary-light">
            Browse our complete collection of smart digital business cards
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-secondary-dark-2 px-6 py-6 border-b border-secondary-gray sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-4 flex-wrap">
          {PRODUCT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                selectedCategory === category
                  ? "bg-primary text-primary-light"
                  : "bg-primary-light text-secondary-gray  cursor-pointer border border-secondary-gray"
              }`}>
              {category}
            </button>
          ))}
        </div>
        <div className="text-center mt-4 text-secondary-dark font-medium text-sm">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.slug} href={`/products/${product.slug}`}>
                <div className="group cursor-pointer h-full ">
                  <div className=" bg-primary-foreground rounded-lg border border-secondary-gray hover:border-accent-blue transition-all duration-300 overflow-hidden h-full flex flex-col shadow-md hover:shadow-lg">
                    {/* Image Container */}
                    <div className="relative h-64 bg-secondary-dark overflow-hidden">
                      <Image
                        src={product.imageSrc}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="inline-block bg-primary text-primary-light text-xs font-semibold px-3 py-1 rounded-full">
                          {product.badge}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col grow">
                      <div className="flex items-center gap-2 mb-2">
                        {/* <span className="text-2xl">{product.emoji}</span> */}
                        <h3 className="text-lg text-primary-light font-bold">
                          {product.title}
                        </h3>
                      </div>
                      <p className="text-secondary-gray text-sm mb-4 grow">
                        {product.description.substring(0, 80)}...
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-secondary-gray">
                        <span className="text-xl font-bold text-accent-blue">
                          ₦{product.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 w-full gap-3 mt-4">
                        <Button
                          size="sm"
                          className="px-3 py-2 bg-accent-blue text-primary rounded-lg text-xs font-semibold hover:bg-accent-blue-light transition-colors w-full">
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={(e) => handleQuickAddToCart(product, e)}
                          size="sm"
                          className="bg-secondary-dark px-4 gap-2 hover:bg-accent-blue text-primary-light hover:text-primary-foreground w-full">
                          <CartIcon /> Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-primary-light mb-2">
              No Products Found
            </h2>
            <p className="text-secondary-foreground mb-6">
              Try selecting a different category
            </p>
            <Link
              href="/"
              className="inline-block bg-accent-blue text-primary font-semibold py-3 px-8 rounded-lg hover:bg-accent-blue-light transition-colors">
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
