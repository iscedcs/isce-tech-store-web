"use client";

import { Input } from "@/components/ui/input";
import { CartIcon, HeartIcon, HomeIcon, SearchIcon } from "@/lib/icons";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MaxWidthWrapper from "../shared/max-width-wrapper";
import CartDrawer from "../cart/cart-drawer";
import { useCartStore } from "@/lib/store/cart-store";
import { StoreIcon, User, LogOut, ShieldCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  CUSTOMER_NAV_LINKS,
  CUSTOMER_ROLES,
  ADMIN_NAV_LINKS,
  ADMIN_ROLES,
  SUPER_ADMIN_NAV_LINKS,
} from "@/lib/const";

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAdmin =
    session?.user?.userType && ADMIN_ROLES.includes(session.user.userType);
  const isSuperAdmin = session?.user?.userType === "SUPER_ADMIN";
  const isRegularUser =
    !!session?.user?.userType && CUSTOMER_ROLES.includes(session.user.userType);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchQuery.trim();
    if (!term) {
      router.push("/products");
      return;
    }

    router.push(`/products?q=${encodeURIComponent(term)}`);
  };

  return (
    <>
      <div className="bg-secondary-dark text-primary-light">
        <MaxWidthWrapper>
          <nav className=" px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 flex justify-between items-center gap-2 sm:gap-4 md:gap-8">
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

            {/* Search Bar - Hidden on very small screens */}
            <div className="hidden sm:flex flex-1 max-w-md bg-primary-foreground">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-gray w-4 h-4" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search products..."
                  className="w-full border border-secondary-gray text-primary-light placeholder:text-secondary-gray pl-10 pr-20 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-accent-blue font-medium hover:opacity-80 transition-opacity"
                  aria-label="Search products">
                  Search
                </button>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex gap-3 sm:gap-4 md:gap-6 items-center shrink-0">
              <Link href="/" className="transition-colors" aria-label="Home">
                <HomeIcon />
              </Link>
              {/* <button
                className="bg-transparent cursor-pointer transition-colors"
                aria-label="Wishlist">
                <HeartIcon />
              </button> */}

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="bg-transparent cursor-pointer transition-colors hover:opacity-80"
                  aria-label="Profile">
                  {session?.user ? (
                    <div className="w-8 h-8 bg-linear-to-br from-accent-blue to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {(session.user.firstName?.[0] || "U").toUpperCase()}
                    </div>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
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

                        {/* Admin Links */}
                        {isAdmin && !isSuperAdmin && (
                          <>
                            {ADMIN_NAV_LINKS.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 border-b border-gray-200">
                                <ShieldCheck className="w-4 h-4" />
                                {link.label}
                              </Link>
                            ))}
                          </>
                        )}

                        {isSuperAdmin && (
                          <>
                            {SUPER_ADMIN_NAV_LINKS.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-700 hover:bg-emerald-50 border-b border-gray-200">
                                <ShieldCheck className="w-4 h-4" />
                                {link.label}
                              </Link>
                            ))}
                          </>
                        )}

                        {/* Customer Links */}
                        {isRegularUser &&
                          CUSTOMER_NAV_LINKS.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsProfileOpen(false)}
                              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-200">
                              {link.label}
                            </Link>
                          ))}

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
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
