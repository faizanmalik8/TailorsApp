"use client";

import React, { useRef } from 'react';
import { Customer, Order, getShopSettings } from '@/lib/store';
import { GARMENT_TEMPLATES } from '@/lib/constants';
import * as htmlToImage from 'html-to-image';
import { format, parseISO } from 'date-fns';

interface ReceiptProps {
  order: Order;
  customer: Customer;
  onClose: () => void;
}

export function Receipt({ order, customer, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const settings = getShopSettings();
  const garment = GARMENT_TEMPLATES.find(g => g.id === order.garmentId);

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, { quality: 1.0 });
      const link = document.createElement('a');
      link.download = `Receipt_${customer.name}_${order.id.substring(0,6)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate receipt image", err);
    }
  };

  const shareReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, { quality: 1.0 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'receipt.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Receipt for ${customer.name}`,
        });
      } else {
        alert("Sharing not supported on this browser. Downloading instead.");
        downloadReceipt();
      }
    } catch (err) {
      console.error("Failed to share receipt", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* The actual receipt to capture */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4 flex justify-center">
          <div 
            ref={receiptRef} 
            className="w-full relative shadow-2xl rounded-2xl overflow-hidden bg-white" 
            style={{ width: '360px', minHeight: '500px' }}
          >
            {/* Top Navy Blue Header with Pattern */}
            <div className="bg-[#152A4A] relative overflow-hidden pt-8 pb-10 px-6 text-center">
              <div className="absolute -top-10 -right-10 text-white/5 rotate-12">
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6c0 1.1-.9 2-2 2S2 7.1 2 6s.9-2 2-2 2 .9 2 2z" /><path d="M8.2 8.2L14 14" /><path d="M19.8 19.8c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" /><path d="M15.8 15.8L14 14" /><path d="M14 14l-4-4" /><path d="M10 10l-1.8-1.8" /><path d="M6 19.8c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" /><path d="M8.2 15.8L20 4" /><path d="M19.8 6c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" /></svg>
              </div>
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M3 21h18"/><path d="M19 21v-4"/><path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"/><path d="M7 17v-4"/><path d="M9 13a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
                </div>
                <h2 className="text-3xl font-black text-white tracking-wide mb-1 drop-shadow-md">{settings.shopName}</h2>
                <div className="flex flex-col items-center gap-0.5 mt-1 opacity-90">
                  <p className="text-xs font-medium text-blue-100 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {settings.phone}
                  </p>
                  <p className="text-xs font-medium text-blue-100 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {settings.ownerName} <span className="font-urdu text-xs font-bold" dir="rtl">(مالک)</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* White Body Content */}
            <div className="bg-white rounded-t-3xl -mt-6 relative z-20 px-6 pt-6 pb-8">
              
              {/* Receipt Badge */}
              <div className="absolute top-0 right-6 -mt-3 bg-amber-400 text-amber-950 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md shadow-amber-400/20 border border-amber-300">
                Receipt
              </div>

              {/* Order Info & Customer */}
              <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium flex gap-2 items-center">
                    Date <span className="font-urdu text-xs font-bold text-gray-700" dir="rtl">(تاریخ)</span>
                  </span>
                  <span className="font-bold text-[#152A4A]">{format(parseISO(order.datePlaced), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium flex gap-2 items-center">
                    Customer <span className="font-urdu text-xs font-bold text-gray-700" dir="rtl">(گاہک)</span>
                  </span>
                  <span className="font-bold text-[#152A4A]">{customer.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium flex gap-2 items-center">
                    Phone <span className="font-urdu text-xs font-bold text-gray-700" dir="rtl">(فون)</span>
                  </span>
                  <span className="font-bold text-[#152A4A] tabular-nums">{customer.phone}</span>
                </div>
              </div>

              {/* Items Section */}
              <div className="px-2 mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item Details</span>
                </div>
                <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div className="flex flex-col">
                    <span className="font-black text-[#152A4A] text-lg">{garment?.name}</span>
                    {order.dueDate && (
                      <span className="text-xs font-medium text-amber-600 mt-0.5 flex gap-1.5 items-center">
                        Due: {format(parseISO(order.dueDate), 'dd MMM yyyy')}
                        <span className="font-urdu text-xs font-bold" dir="rtl">(واپسی)</span>
                      </span>
                    )}
                  </div>
                  <div className="bg-[#152A4A] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md">
                    x{order.quantity}
                  </div>
                </div>
              </div>

              {/* Dashed Divider */}
              <div className="relative my-6 opacity-30">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-2 border-dashed border-gray-400"></div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-3 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex gap-2 items-center">
                    Total Amount
                    <span className="font-urdu text-sm font-bold text-gray-700" dir="rtl">(کل رقم)</span>
                  </span>
                  <span className="font-bold text-[#152A4A] tabular-nums">Rs {order.totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex gap-2 items-center">
                    Advance Paid
                    <span className="font-urdu text-sm font-bold text-gray-700" dir="rtl">(جمع)</span>
                  </span>
                  <span className="font-bold text-green-600 tabular-nums">Rs {order.amountPaid}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center bg-red-50 p-3 rounded-xl border border-red-100">
                    <span className="font-black text-red-900 flex gap-2 items-center text-lg">
                      Balance
                      <span className="font-urdu text-base font-bold" dir="rtl">(بقایہ)</span>
                    </span>
                    <span className="font-black text-2xl text-red-600 tabular-nums">Rs {order.totalAmount - order.amountPaid}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8 space-y-1">
                <p className="text-sm font-bold text-gray-400">Thank you for choosing us! ✨</p>
                <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Powered by TailorsApp</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
          <button 
            onClick={() => {
              import('@/lib/store').then(({ formatWhatsAppNumber, generateWhatsAppMessage }) => {
                const msg = generateWhatsAppMessage('orderPlaced', customer, order, garment?.name || 'Dress', settings);
                const url = `https://wa.me/${formatWhatsAppNumber(customer.phone)}?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
              });
            }}
            className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-lg font-bold border border-green-200 hover:bg-green-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9l-5.05.9" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
            Send on WhatsApp
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={shareReceipt}
              className="bg-[#152A4A] text-white py-3 rounded-lg font-bold"
            >
              Share Image
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-100 text-gray-700 py-3 rounded-lg font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
