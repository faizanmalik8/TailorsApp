"use client";

import React from 'react';
import { GARMENT_TEMPLATES } from '@/lib/constants';
import { IconCheck } from '@tabler/icons-react';

interface GarmentTypePickerProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function GarmentTypePicker({ selectedId, onSelect }: GarmentTypePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {GARMENT_TEMPLATES.map((template) => {
        const isSelected = selectedId === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className={`relative p-4 rounded-xl border-2 text-left flex flex-col items-start transition-all ${
              isSelected 
                ? 'border-[#152A4A] bg-[#EAF1FA] shadow-md' 
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-center w-full mb-1">
              <span className="font-bold text-lg text-[#152A4A]">{template.name}</span>
              {isSelected && (
                <div className="bg-[#152A4A] text-white p-1 rounded-full">
                  <IconCheck size={16} stroke={3} />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
