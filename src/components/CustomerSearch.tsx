"use client";

import React, { useState } from 'react';
import { Customer, getMockCustomers } from '@/lib/store';
import { IconSearch, IconUserPlus } from '@tabler/icons-react';

interface CustomerSearchProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
  onAddNew: () => void;
}

export function CustomerSearch({ onSelect, selectedCustomer, onAddNew }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const allCustomers = getMockCustomers();
  
  const filtered = query.length > 0 
    ? allCustomers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query))
    : [];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100" dir="rtl">
      <label className="block font-bold text-lg text-[#152A4A] mb-3">گاہک (Customer)</label>
      
      {selectedCustomer ? (
        <div className="flex items-center justify-between p-3 bg-[#EAF1FA] rounded-lg border border-blue-100">
          <div>
            <div className="font-bold text-[#152A4A]">{selectedCustomer.name}</div>
            <div className="text-sm text-gray-600" dir="ltr">{selectedCustomer.phone}</div>
          </div>
          <button 
            type="button" 
            onClick={() => onSelect(null)}
            className="text-sm text-blue-600 underline px-2 py-1"
          >
            تبدیل کریں (Change)
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center border-2 border-gray-200 rounded-lg focus-within:border-[#152A4A] overflow-hidden transition-colors">
            <span className="p-3 text-gray-400">
              <IconSearch size={20} />
            </span>
            <input
              type="text"
              placeholder="نام یا واٹس ایپ نمبر تلاش کریں..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsSearching(true);
              }}
              className="flex-1 p-3 outline-none text-lg"
            />
          </div>
          
          {isSearching && query.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-10 max-h-60 overflow-y-auto">
              {filtered.length > 0 ? (
                filtered.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelect(c);
                      setIsSearching(false);
                      setQuery('');
                    }}
                    className="w-full text-right p-4 border-b border-gray-50 hover:bg-gray-50 flex flex-col items-start"
                  >
                    <span className="font-bold text-[#152A4A]">{c.name}</span>
                    <span className="text-sm text-gray-500" dir="ltr">{c.phone}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="mb-3">کوئی گاہک نہیں ملا (No customer found)</p>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSearching(false);
                      onAddNew();
                    }}
                    className="flex items-center justify-center w-full gap-2 text-[#152A4A] font-medium p-2 bg-[#EAF1FA] rounded-md"
                  >
                    <IconUserPlus size={18} /> نیا گاہک شامل کریں (Add New)
                  </button>
                </div>
              )}
            </div>
          )}
          
          {!isSearching && query.length === 0 && (
            <button 
              type="button"
              onClick={onAddNew}
              className="mt-3 flex items-center justify-center w-full gap-2 text-[#152A4A] font-medium p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IconUserPlus size={20} /> نیا گاہک شامل کریں (Add New Customer)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
