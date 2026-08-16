"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconUsers, IconSearch, IconSettings } from "@tabler/icons-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: IconHome },
    { name: "Active", href: "/active", icon: IconUsers },
    { name: "Search", href: "/search", icon: IconSearch },
    { name: "Settings", href: "/settings", icon: IconSettings },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-[#152A4A]" : "text-gray-400"
              }`}
            >
              <Icon size={24} stroke={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
