"use client";

import { Input } from "@/components/ui/input";
import { CartIcon, HeartIcon, HomeIcon, SearchIcon } from "@/lib/icons";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MaxWidthWrapper from "../shared/max-width-wrapper";
import CartDrawer from "../cart/cart-drawer";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "../ui/button";
import { StoreIcon, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const { data: session } = useSession();

  return (
    <>
      <MaxWidthWrapper>
        <nav className="bg-secondary-dark text-primary-light px-6 py-6 flex justify-between items-center gap-8">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 hover:opacity-80 transition-opacity">
            <Image
              src="/assets/isce_white_full_logo.png"
              width={80}
              height={80}
              alt="ISCE STORE"
              quality={75}
            />
          </Link>

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
            <Link href="/" className="transition-colors" aria-label="Home">
              <HomeIcon />
            </Link>
            <button
              className="bg-transparent cursor-pointer transition-colors"
              aria-label="Wishlist">
              <HeartIcon />
            </button>

            <Link
              href="/products"
              className="transition-colors"
              aria-label="Home">
              <StoreIcon />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-transparent cursor-pointer transition-colors relative"
              aria-label="Shopping Cart">
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-primary-light text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="bg-transparent cursor-pointer transition-colors hover:opacity-80"
                aria-label="Profile">
                {session?.user ? (
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {(session.user.firstName?.[0] || "U").toUpperCase()}
                  </div>
                ) : (
                  <User className="w-6 h-6" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {session?.user ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user.firstName} {session.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                        My Profile
                      </Link>
                      <Link
                        href="/profile/orders"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                        My Orders
                      </Link>
                      <Link
                        href="/profile/addresses"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                        Addresses
                      </Link>
                      <Link
                        href="/profile/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                        Settings
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut({ redirectTo: "/" });
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </nav>
      </MaxWidthWrapper>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
