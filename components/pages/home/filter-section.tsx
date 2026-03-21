"use client";

import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES, PRODUCTS } from "@/lib/const";
import { FilterIcon } from "@/lib/icons";
import { useState } from "react";

interface FilterSectionProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function FilterSection({
  selectedCategory,
  onCategoryChange,
}: FilterSectionProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredProducts =
    selectedCategory === "All"
      ? Object.values(PRODUCTS)
      : Object.values(PRODUCTS).filter((p) => p.category === selectedCategory);

  return (
    <section className="bg-primary-light px-4 sm:px-6 py-4 sm:py-6 border-b border-secondary-gray">
      <div className="max-w-6xl mx-auto flex flex-col gap-3 sm:gap-4">
        {/* Filter Button */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
            className="flex items-center gap-2 text-primary-foreground hover:text-accent-blue transition-colors text-sm sm:text-base sm:pointer-events-none"
            aria-expanded={isMobileFiltersOpen}
            aria-controls="home-product-categories">
            <FilterIcon />
            <span>Filter</span>
          </button>

          <div className="text-primary-foreground font-semibold text-xs sm:text-base whitespace-nowrap sm:ml-auto">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </div>
        </div>

        {/* Categories */}
        <div
          id="home-product-categories"
          className={`${isMobileFiltersOpen ? "flex" : "hidden"} sm:flex gap-2 sm:gap-3 flex-wrap`}>
          {PRODUCT_CATEGORIES.map((category) => (
            <Button
              key={category}
              onClick={() => {
                onCategoryChange(category);
                setIsMobileFiltersOpen(false);
              }}
              className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-colors font-medium text-xs sm:text-sm ${
                selectedCategory === category
                  ? "bg-secondary-dark text-primary-light"
                  : "bg-primary-light text-secondary-gray  border border-secondary-gray  hover:bg-primary-foreground hover:text-primary-light"
              }`}>
              {category}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
