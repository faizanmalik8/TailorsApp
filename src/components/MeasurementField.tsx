"use client";

import React from 'react';
import { MeasurementFieldDef } from '@/lib/constants';

interface MeasurementFieldProps {
  field: MeasurementFieldDef;
  value: string;
  selectedTags: string[];
  onValueChange: (val: string) => void;
  onTagToggle: (tag: string) => void;
}

export function MeasurementField({ field, value, selectedTags, onValueChange, onTagToggle }: MeasurementFieldProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Label and Value Input */}
      <div className="flex items-center justify-between md:justify-start gap-4 md:w-1/3">
        <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-gray-500">{field.labelEnglish}</span>
          <span className="font-bold text-xl text-[#152A4A]" dir="rtl">{field.labelUrdu}</span>
        </div>
        <input 
          type="number" 
          placeholder="0.0" 
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-20 md:w-24 text-center border-b-2 border-[#152A4A] bg-white p-2 text-xl font-bold text-[#152A4A] focus:outline-none focus:bg-blue-50 transition-colors rounded-t-md shrink-0" 
        />
      </div>

      {/* Tags */}
      {field.availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 md:w-2/3 md:justify-end" dir="rtl">
          {field.availableTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isSelected 
                    ? 'bg-[#152A4A] text-white shadow-sm' 
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-[#152A4A] hover:text-[#152A4A]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
