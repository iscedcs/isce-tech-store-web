"use client";

import { Input } from "@/components/ui/input";
import { CartIcon, HeartIcon, HomeIcon, SearchIcon } from "@/lib/icons";
import Image from "next/image";
import MaxWidthWrapper from "../shared/max-width-wrapper";

export default function Navbar() {
  return (
    <MaxWidthWrapper>
      <nav className="bg-secondary-dark text-primary-light px-6 py-6 flex justify-between items-center gap-8">
        <div className="shrink-0">
          <Image
            src="/assets/isce_white_full_logo.png"
            width={80}
            height={80}
            alt="ISCE STORE"
            quality={75}
          />
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md bg-primary-foreground">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-gray" />
            <Input
              type="text"
              placeholder="Search Product....."
              className="w-full border border-secondary-gray text-primary-light placeholder:text-secondary-gray pl-10 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex gap-6 items-center shrink-0">
          <button aria-label="Home">
            <HomeIcon />
          </button>
          <button aria-label="Wishlist">
            <HeartIcon />
          </button>
          <button
            className="hover:text-accent-blue transition-colors"
            aria-label="Shopping Cart">
            <CartIcon />
          </button>
        </div>
      </nav>
    </MaxWidthWrapper>
  );
}
