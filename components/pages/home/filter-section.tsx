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
    <section className="bg-primary-light px-6 py-6 border-b border-secondary-gray">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-4 flex-wrap">
        {/* Filter Button */}
        <button className="flex items-center gap-2 text-primary-foreground hover:text-accent-blue transition-colors">
          <FilterIcon />
        </button>

        {/* Categories */}
        <div className="flex gap-3 flex-wrap">
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                selectedCategory === category
                  ? "bg-secondary-dark text-primary-light"
                  : "bg-primary-light text-secondary-gray  border border-secondary-gray  hover:bg-primary-foreground hover:text-primary-light"
              }`}>
              {category}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-primary-foreground font-semibold">
          {filteredProducts.length} product
          {filteredProducts.length !== 1 ? "s" : ""} found
        </div>
      </div>
    </section>
  );
}
