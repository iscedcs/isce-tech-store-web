"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Package, MapPin, Settings, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { CUSTOMER_NAV_LINKS } from "@/lib/const";
import type { LucideIcon } from "lucide-react";

interface ProfileUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ProfileSidebarProps {
  user?: ProfileUser;
}

const iconMap: Record<string, LucideIcon> = {
  User: User,
  Package: Package,
  MapPin: MapPin,
  Settings: Settings,
  Home: Home,
};

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname === "/profile";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-accent-blue to-blue-700 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
            {(user?.firstName?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 sm:space-y-2">
        {CUSTOMER_NAV_LINKS.map((item) => {
          const Icon = iconMap[item.icon || "User"] || User;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors ${
                active
                  ? "bg-accent-blue text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <Button
        onClick={async () => {
          await signOut({ redirect: false });
          router.push("/");
        }}
        variant="destructive"
        className="w-full flex items-center justify-center gap-2">
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}
