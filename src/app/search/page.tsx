"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Customer, getMockCustomers } from '@/lib/store';
import { IconSearch, IconChevronRight, IconUserPlus } from '@tabler/icons-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomers(getMockCustomers());
  }, []);

  const filtered = query.length > 0
    ? customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query))
    : customers;

  return (
    <div className="p-4 md:p-8 space-y-6 container mx-auto max-w-4xl">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#152A4A]">Search Customers</h2>
        <Link 
          href="/customers/new" 
          className="flex items-center gap-1 text-sm bg-[#EAF1FA] text-[#152A4A] font-bold px-3 py-2 rounded-lg"
        >
          <IconUserPlus size={18} /> Add New
        </Link>
      </div>
      
      <div className="relative">
        <div className="flex items-center border-2 border-gray-200 rounded-xl focus-within:border-[#152A4A] overflow-hidden bg-white shadow-sm transition-colors">
          <span className="p-4 text-gray-400">
            <IconSearch size={24} />
          </span>
          <input
            type="text"
            placeholder="Search by Name or Phone Number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-4 outline-none text-lg bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map(c => (
            <Link 
              href={`/customers/${c.id}`} 
              key={c.id}
              className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-[#152A4A] hover:bg-blue-50 transition-colors"
            >
              <div>
                <h3 className="font-bold text-lg text-[#152A4A]">{c.name}</h3>
                <p className="text-sm text-gray-500">{c.phone}</p>
              </div>
              <IconChevronRight className="text-gray-400" />
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No customers found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
