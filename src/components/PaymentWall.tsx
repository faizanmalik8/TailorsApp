"use client";

import { IconBrandWhatsapp, IconLock } from '@tabler/icons-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function PaymentWall({ email, status }: { email: string, status: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleWhatsApp = () => {
    // The user's WhatsApp number to receive payments
    const adminPhone = "923070026748"; // 03070026748 mapped to international format
    const message = `Hi Faizan, I just transferred the subscription amount to JazzCash (03070026748) for my account: ${email}. Please activate my dashboard!`;
    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 flex flex-col items-center justify-center p-4 relative z-[100]">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center space-y-6 relative overflow-hidden">
        {/* Top styling */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#152A4A]" />
        
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconLock size={40} />
        </div>

        <h2 className="text-2xl font-bold text-[#152A4A]">
          {status === 'expired' ? 'Subscription Expired' : 'Account Locked'}
        </h2>
        
        <p className="text-gray-600 leading-relaxed text-sm">
          {status === 'expired' 
            ? 'Your monthly subscription has ended. Please renew to continue managing your tailors shop.'
            : 'Your account is pending payment verification. Please pay the subscription fee to activate your dashboard.'}
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left text-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Method</span>
              <span className="font-bold text-[#152A4A]">JazzCash</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Account No.</span>
              <span className="font-bold text-[#152A4A] tracking-wider">0307 0026748</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Account Title</span>
              <span className="font-bold text-[#152A4A]">Muhammad Faizan Malik</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 font-bold py-4 rounded-xl border border-green-200 hover:bg-green-100 transition-colors shadow-sm"
        >
          <IconBrandWhatsapp size={24} />
          Send Proof on WhatsApp
        </button>

        <button 
          onClick={handleLogout}
          className="text-gray-400 text-sm hover:text-gray-600 underline font-medium pt-2 block mx-auto"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
