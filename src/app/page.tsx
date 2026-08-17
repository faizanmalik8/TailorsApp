"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getMockCustomers, getMockOrders, getShopSettings, Order, ShopSettings } from '@/lib/store';
import { IconUsersGroup, IconUsers, IconShirt, IconCashBanknote, IconUserPlus, IconLogout } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [amountPending, setAmountPending] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadData = () => {
      setSettings(getShopSettings());
      const allCustomers = getMockCustomers();
      const allOrders = getMockOrders();
      const activeOrders = allOrders.filter(o => o.status !== 'delivered');
      const pendingAmount = allOrders.reduce((sum, o) => {
        const total = Number(o.totalAmount) || 0;
        const paid = Number(o.amountPaid) || 0;
        return sum + Math.max(0, total - paid);
      }, 0);

      const uniqueClients = new Set(activeOrders.map(o => o.customerId));

      setTotalCustomers(allCustomers.length);
      setActiveClients(uniqueClients.size);
      setAmountPending(pendingAmount);
      setOrders(activeOrders);
    };

    loadData();
    window.addEventListener('tailors_data_updated', loadData);
    return () => window.removeEventListener('tailors_data_updated', loadData);
  }, []);

  return (
    <div className="flex flex-col bg-gray-50 min-h-[calc(100vh-56px)]">
      {/* Top Blue Header Section */}
      <div className="bg-[#152A4A] pt-4 px-4 md:px-8 pb-20 flex flex-col items-center">
        <p className="text-blue-200 text-sm mb-1 font-medium">Welcome back to</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 tracking-wide text-center">
          {settings?.shopName || "Dashboard"}
        </h2>
        
        <Link 
          href="/customers/new"
          className="bg-white text-[#152A4A] flex items-center justify-center gap-3 w-full max-w-sm rounded-2xl py-4 font-bold text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <IconUserPlus size={24} stroke={2.5} />
          <div className="font-medium text-sm mt-2 text-[#152A4A] flex flex-col items-center">
            Take Measurement <span className="font-urdu text-xs opacity-70" dir="rtl">(ناپ)</span>
          </div>
        </Link>
      </div>

      {/* Main Content Area with rounded overlap */}
      <div className="flex-1 bg-gray-50 rounded-t-[2.5rem] -mt-10 pt-10 px-4 md:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10">
        <div className="container mx-auto max-w-lg md:max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            {/* Total Customers */}
            <div className="bg-white rounded-[2rem] aspect-square flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow">
              <div className="text-blue-500 mb-4 bg-blue-50 p-4 rounded-2xl">
                <IconUsersGroup size={32} />
              </div>
              <span className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-1 flex items-center justify-center gap-1">
                Customers <span className="font-urdu normal-case opacity-80 mt-0.5" dir="rtl">(گاہک)</span>
              </span>
              <span className="text-2xl font-black text-[#152A4A]">{totalCustomers}</span>
            </div>

            {/* Active Clients */}
            <div className="bg-white rounded-[2rem] aspect-square flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow">
              <div className="text-indigo-500 mb-4 bg-indigo-50 p-4 rounded-2xl">
                <IconUsers size={32} />
              </div>
              <span className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-1 flex items-center justify-center gap-1">
                Active <span className="font-urdu normal-case opacity-80 mt-0.5" dir="rtl">(متحرک)</span>
              </span>
              <span className="text-2xl font-black text-[#152A4A]">{activeClients}</span>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-[2rem] aspect-square flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow">
              <div className="text-purple-500 mb-4 bg-purple-50 p-4 rounded-2xl">
                <IconShirt size={32} />
              </div>
              <span className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-1 flex items-center justify-center gap-1">
                Orders <span className="font-urdu normal-case opacity-80 mt-0.5" dir="rtl">(آرڈر)</span>
              </span>
              <span className="text-2xl font-black text-[#152A4A]">{orders.length}</span>
            </div>

            {/* Amount Pending */}
            <Link href="/active?tab=ledger" className="bg-white rounded-[2rem] aspect-square flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-lg transition-shadow cursor-pointer block border border-transparent hover:border-amber-100">
              <div className="text-amber-500 mb-4 bg-amber-50 p-4 rounded-2xl">
                <IconCashBanknote size={32} />
              </div>
              <span className="text-xs text-gray-500 font-bold tracking-wide uppercase mb-1 flex items-center justify-center gap-1">
                Pending <span className="font-urdu normal-case opacity-80 mt-0.5" dir="rtl">(کھاتہ)</span>
              </span>
              <span className="text-2xl font-black text-amber-600">Rs {amountPending}</span>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
