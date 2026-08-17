"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GarmentTypePicker } from '@/components/GarmentTypePicker';
import { MeasurementField } from '@/components/MeasurementField';
import { Customer, getMockCustomers, saveMockCustomer, saveMockOrder, generateId } from '@/lib/store';
import { GARMENT_TEMPLATES } from '@/lib/constants';

export default function NewCustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams?.get('customerId');
  
  // Customer State
  const [name, setName] = useState('');
  const [urduName, setUrduName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');

  // Garment State
  const [selectedGarmentId, setSelectedGarmentId] = useState<string | null>(null);
  
  // Measurement State
  const [measurements, setMeasurements] = useState<Record<string, { value: string, tags: string[] }>>({});
  const [quantity, setQuantity] = useState('1');
  const [dueDate, setDueDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  
  // Existing Customer ref
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    // Load default suit price
    import('@/lib/store').then(({ getShopSettings }) => {
      const settings = getShopSettings();
      setBasePrice(settings.suitPrice || 0);
      if (!totalAmount) {
        setTotalAmount((settings.suitPrice || 0).toString());
      }
    });

    if (customerId) {
      const customers = getMockCustomers();
      const found = customers.find(c => c.id === customerId);
      if (found) {
        setExistingCustomer(found);
        setName(found.name);
        if (found.urduName) setUrduName(found.urduName);
        setPhone(found.phone);
        if (found.customerNumber) setCustomerNumber(found.customerNumber.toString());
      }
    } else {
      // Auto-increment for new customer
      const customers = getMockCustomers();
      let maxNumber = 0;
      customers.forEach(c => {
        if (c.customerNumber && c.customerNumber > maxNumber) {
          maxNumber = c.customerNumber;
        }
      });
      setCustomerNumber((maxNumber + 1).toString().padStart(4, '0'));
    }
  }, [customerId]);

  useEffect(() => {
    // Only auto-translate if the user hasn't heavily modified it or if we are typing English
    const delayDebounceFn = setTimeout(async () => {
      if (name.trim()) {
        try {
          // Google Input Tools API for Urdu transliteration
          const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(name.trim())}&itc=ur-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`);
          const data = await res.json();
          if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
            setUrduName(data[1][0][1][0]);
          }
        } catch (e) {
          console.error("Transliteration failed", e);
        }
      } else {
        setUrduName('');
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [name]);

  const activeTemplate = GARMENT_TEMPLATES.find(g => g.id === selectedGarmentId);

  const handleGarmentSelect = (id: string) => {
    setSelectedGarmentId(id);
    if (existingCustomer && existingCustomer.measurements && existingCustomer.measurements[id]) {
      setMeasurements(existingCustomer.measurements[id]);
    } else {
      setMeasurements({}); 
    }
  };

  const handleMeasurementChange = (fieldId: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], value, tags: prev[fieldId]?.tags || [] }
    }));
  };

  const handleTagToggle = (fieldId: string, tag: string) => {
    setMeasurements(prev => {
      const currentTags = prev[fieldId]?.tags || [];
      const newTags = currentTags.includes(tag) 
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
        
      return {
        ...prev,
        [fieldId]: { ...prev[fieldId], value: prev[fieldId]?.value || '', tags: newTags }
      };
    });
  };

  const handleSave = () => {
    if (!selectedGarmentId) {
      alert("Please select a garment category");
      return;
    }
    
    if (!name.trim() && !phone.trim()) {
      alert("Please provide a name or phone number");
      return;
    }
    
    const customers = getMockCustomers();
    let maxNumber = 0;
    customers.forEach(c => {
      if (c.customerNumber && c.customerNumber > maxNumber) {
        maxNumber = c.customerNumber;
      }
    });

    const customerToSave: Customer = existingCustomer || {
      id: generateId(),
      name: name.trim() || 'Unnamed',
      urduName: urduName.trim(),
      phone: phone.trim(),
      measurements: {},
      customerNumber: parseInt(customerNumber, 10) || (maxNumber + 1)
    };
    
    // If name/phone updated
    customerToSave.name = name.trim() || 'Unnamed';
    customerToSave.urduName = urduName.trim();
    customerToSave.phone = phone.trim();
    
    // Update measurements
    customerToSave.measurements[selectedGarmentId] = measurements;
    saveMockCustomer(customerToSave);
    
    // Create order
    const qty = parseInt(quantity, 10) || 1;
    saveMockOrder({
      id: generateId(),
      customerId: customerToSave.id,
      garmentId: selectedGarmentId,
      quantity: qty,
      status: 'received',
      totalAmount: parseFloat(totalAmount) || 0,
      amountPaid: parseFloat(amountPaid) || 0,
      datePlaced: new Date().toISOString(),
      dueDate: dueDate || null,
      measurementSnapshot: measurements
    });
    
    alert("Saved successfully!");
    router.push('/');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 container mx-auto max-w-3xl">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-[#152A4A]">New Order</h2>
      </div>
      
      {/* Customer Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-lg text-[#152A4A]">Customer Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID (Auto-Generated)</label>
            <input 
              type="text" 
              placeholder="e.g. 0001" 
              value={customerNumber}
              onChange={e => setCustomerNumber(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg font-mono bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urdu Name (Auto-Translated)</label>
            <input 
              type="text" 
              placeholder="اردو نام" 
              value={urduName}
              onChange={e => setUrduName(e.target.value)}
              dir="rtl"
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg font-urdu text-right"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              placeholder="WhatsApp Number" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg"
            />
          </div>
        </div>
      </div>

      {/* Garment Selection */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-lg text-[#152A4A]">Category</h3>
        <GarmentTypePicker selectedId={selectedGarmentId} onSelect={handleGarmentSelect} />
      </div>

      {/* Measurements List */}
      {activeTemplate && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-bold text-lg text-[#152A4A]">Measurements</h3>
          
          <div className="space-y-3">
            {activeTemplate.fields.map(field => (
              <MeasurementField 
                key={field.id}
                field={field}
                value={measurements[field.id]?.value || ''}
                selectedTags={measurements[field.id]?.tags || []}
                onValueChange={(val) => handleMeasurementChange(field.id, val)}
                onTagToggle={(tag) => handleTagToggle(field.id, tag)}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Suits</label>
              <input 
                type="number" 
                value={quantity}
                onChange={e => {
                  setQuantity(e.target.value);
                  const qty = parseInt(e.target.value, 10) || 1;
                  setTotalAmount((qty * basePrice).toString());
                }}
                min="1"
                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (Rs)</label>
              <input 
                type="number" 
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Paid (Rs)</label>
              <input 
                type="number" 
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] text-lg"
              />
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-[#152A4A] text-white font-bold text-xl py-4 rounded-xl mt-6 shadow-md active:bg-[#0c1a2e] transition-colors"
          >
            Save Order
          </button>
        </div>
      )}
      
      {/* Safe padding for bottom nav */}
      <div className="h-16"></div>
    </div>
  );
}
