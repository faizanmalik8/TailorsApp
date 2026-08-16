"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getShopSettings } from '@/lib/store';

export function Header() {
  const pathname = usePathname();
  const [shopName, setShopName] = useState("Tailor Shop");
  const [initials, setInitials] = useState("TS");

  useEffect(() => {
    const settings = getShopSettings();
    if (settings.shopName) {
      setShopName(settings.shopName);
      const words = settings.shopName.split(' ').filter(w => w.length > 0);
      if (words.length >= 2) {
        setInitials((words[0][0] + words[1][0]).toUpperCase());
      } else if (words.length === 1) {
        setInitials(words[0].substring(0, 2).toUpperCase());
      }
    }
  }, []);

  const isHome = pathname === '/';

  return (
    <header 
      className={`bg-[#152A4A] text-white sticky top-0 z-50 ${isHome ? '' : 'shadow-md'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 px-4 flex items-center">
        {/* Dynamic Shop Logo/Name */}
        <div className="w-8 h-8 rounded-full bg-white/20 mr-3 flex items-center justify-center shrink-0">
          <span className="font-bold text-xs">{initials}</span>
        </div>
        <h1 className="text-lg font-medium truncate">{shopName}</h1>
      </div>
    </header>
  );
}
