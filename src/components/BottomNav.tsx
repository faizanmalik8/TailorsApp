"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconListCheck, IconSearch, IconSettings } from '@tabler/icons-react';

export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', path: '/', icon: IconHome },
    { name: 'Active', path: '/active', icon: IconListCheck },
    { name: 'Search', path: '/search', icon: IconSearch },
    { name: 'Settings', path: '/settings', icon: IconSettings },
  ];

  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-50 pointer-events-none">
      <div className="mx-auto max-w-md bg-white/90 backdrop-blur-xl border border-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-full h-[72px] px-6 pointer-events-auto flex justify-between items-center relative">
        {navItems.map(item => {
          const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-full group outline-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div 
                className={`relative flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive ? '-translate-y-2' : 'translate-y-0 active:scale-90 group-hover:-translate-y-1'
                }`}
              >
                <Icon 
                  size={isActive ? 26 : 24} 
                  stroke={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${isActive ? 'text-[#152A4A]' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
                
                <span 
                  className={`absolute top-7 text-[10px] font-bold tracking-wide transition-all duration-300 ${
                    isActive ? 'opacity-100 text-[#152A4A] translate-y-1' : 'opacity-0 text-gray-400 translate-y-0'
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
