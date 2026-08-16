"use client";

import React, { useState, useEffect } from 'react';
import { getShopSettings, saveShopSettings, getMessageTemplates, saveMessageTemplates, ShopSettings, MessageTemplates } from '@/lib/store';
import { IconDeviceFloppy } from '@tabler/icons-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>({ shopName: '', ownerName: '', phone: '', suitPrice: 0 });
  const [templates, setTemplates] = useState<MessageTemplates>({ orderPlaced: '', orderReady: '', paymentReminder: '' });

  useEffect(() => {
    setSettings(getShopSettings());
    setTemplates(getMessageTemplates());
  }, []);

  const handleSaveSettings = () => {
    saveShopSettings(settings);
    alert('Shop settings saved!');
  };

  const handleSaveTemplates = () => {
    saveMessageTemplates(templates);
    alert('Templates saved!');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 container mx-auto max-w-4xl pb-24">
      <h2 className="text-2xl font-bold text-[#152A4A] border-b border-gray-200 pb-4">Settings</h2>
      
      {/* Shop Profile */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-[#152A4A]">Shop Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input 
              type="text" 
              value={settings.shopName}
              onChange={e => setSettings({...settings, shopName: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
            <input 
              type="text" 
              value={settings.ownerName}
              onChange={e => setSettings({...settings, ownerName: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
            <input 
              type="tel" 
              value={settings.phone}
              onChange={e => setSettings({...settings, phone: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Suit Price (Rs)</label>
            <input 
              type="number" 
              value={settings.suitPrice || ''}
              onChange={e => setSettings({...settings, suitPrice: parseInt(e.target.value) || 0})}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A]"
            />
          </div>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-[#152A4A] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0c1a2e]"
        >
          <IconDeviceFloppy size={20} /> Save Profile
        </button>
      </div>

      {/* WhatsApp Templates */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h3 className="font-bold text-lg text-[#152A4A]">WhatsApp Templates</h3>
          <p className="text-sm text-gray-500">Available placeholders: {'{shopName}'}, {'{ownerName}'}, {'{name}'}, {'{garment}'}, {'{quantity}'}, {'{datePlaced}'}, {'{dueDate}'}, {'{total}'}, {'{advance}'}, {'{balance}'}</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Ready</label>
            <textarea 
              value={templates.orderReady}
              onChange={e => setTemplates({...templates, orderReady: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reminder</label>
            <textarea 
              value={templates.paymentReminder}
              onChange={e => setTemplates({...templates, paymentReminder: e.target.value})}
              className="w-full border-2 border-gray-200 rounded-lg p-3 outline-none focus:border-[#152A4A] min-h-[100px]"
            />
          </div>
        </div>
        <button 
          onClick={handleSaveTemplates}
          className="flex items-center gap-2 bg-[#152A4A] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#0c1a2e]"
        >
          <IconDeviceFloppy size={20} /> Save Templates
        </button>
      </div>
    </div>
  );
}
