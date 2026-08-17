"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getShopSettings } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { IconLogout } from '@tabler/icons-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
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

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  if (pathname === '/login') return null;

  const isHome = pathname === '/';

  return (
    <header 
      className={`bg-[#152A4A] text-white sticky top-0 z-50 ${isHome ? '' : 'shadow-md'}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center min-w-0 pr-4">
          {/* Dynamic Shop Logo/Name */}
          <div className="w-8 h-8 rounded-full bg-white/20 mr-3 flex items-center justify-center shrink-0">
            <span className="font-bold text-xs">{initials}</span>
          </div>
          <h1 className="text-lg font-medium truncate">{shopName}</h1>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-red-400 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shrink-0"
        >
          <IconLogout size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
