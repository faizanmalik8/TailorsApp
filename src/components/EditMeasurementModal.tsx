"use client";

import React, { useState } from 'react';
import { Customer, saveMockCustomer } from '@/lib/store';
import { GARMENT_TEMPLATES } from '@/lib/constants';
import { MeasurementField } from '@/components/MeasurementField';
import { IconX, IconDeviceFloppy } from '@tabler/icons-react';

interface EditMeasurementModalProps {
  customer: Customer;
  garmentId: string;
  onClose: () => void;
  onSaveSuccess: (updatedCustomer: Customer) => void;
}

export function EditMeasurementModal({ customer, garmentId, onClose, onSaveSuccess }: EditMeasurementModalProps) {
  // Load initial measurements for this garment from the customer profile
  const initialMeasurements = customer.measurements[garmentId] || {};
  const [localMeasurements, setLocalMeasurements] = useState<Record<string, { value: string, tags: string[] }>>(initialMeasurements);

  const template = GARMENT_TEMPLATES.find(g => g.id === garmentId);
  if (!template) return null;

  const handleValueChange = (fieldId: string, value: string) => {
    setLocalMeasurements(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], value, tags: prev[fieldId]?.tags || [] }
    }));
  };

  const handleTagToggle = (fieldId: string, tag: string) => {
    setLocalMeasurements(prev => {
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
    const updatedCustomer = {
      ...customer,
      measurements: {
        ...customer.measurements,
        [garmentId]: localMeasurements
      }
    };
    saveMockCustomer(updatedCustomer);
    onSaveSuccess(updatedCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-lg text-[#152A4A]">Edit {template.name}</h3>
            <p className="text-xs text-gray-500">For {customer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
            <IconX size={24} />
          </button>
        </div>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" dir="rtl">
          {template.fields.map(field => (
            <MeasurementField 
              key={field.id}
              field={field}
              value={localMeasurements[field.id]?.value || ''}
              selectedTags={localMeasurements[field.id]?.tags || []}
              onValueChange={(val) => handleValueChange(field.id, val)}
              onTagToggle={(tag) => handleTagToggle(field.id, tag)}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-[#152A4A] text-white py-3 rounded-xl font-bold shadow-sm hover:bg-[#0c1a2e]"
          >
            <IconDeviceFloppy size={20} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
