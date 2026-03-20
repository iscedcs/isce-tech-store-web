"use client";

import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES, PRODUCTS } from "@/lib/const";
import { FilterIcon } from "@/lib/icons";
import { useState } from "react";

const categories = ["All", "WEARABLE", "SMART DEVICE", "ACCESSORIES"];

export default function FilterSection() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts =
    selectedCategory === "All"
      ? Object.values(PRODUCTS)
      : Object.values(PRODUCTS).filter((p) => p.category === selectedCategory);
  return (
    <section className="bg-primary-light px-4 sm:px-6 py-4 sm:py-6 border-b border-secondary-gray">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        {/* Filter Button */}
        <button className="flex items-center gap-2 text-primary-foreground hover:text-accent-blue transition-colors text-sm sm:text-base">
          <FilterIcon />
        </button>

        {/* Categories */}
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-colors font-medium text-xs sm:text-sm ${
                selectedCategory === category
                  ? "bg-secondary-dark text-primary-light"
                  : "bg-primary-light text-secondary-gray  border border-secondary-gray  hover:bg-primary-foreground hover:text-primary-light"
              }`}>
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-primary-foreground font-semibold text-sm sm:text-base">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </div>
      </div>
    </section>
  );
}
