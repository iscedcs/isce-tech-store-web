"use client";

import { useState } from "react";
import FilterSection from "@/components/pages/home/filter-section";
import HeroSection from "@/components/pages/home/hero-section";
import ProductGrid from "@/components/pages/home/product-grid";
import { CtaSection } from "@/components/shared/cta-section";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <main>
      <HeroSection />
      <FilterSection
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ProductGrid selectedCategory={selectedCategory} />
    </main>
  );
}
