'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  name: string;
  slug: string;
}

interface FilterDropdownProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
}

export default function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.slug === value);
  
  // Custom display name: "Quốc Gia: Trung Quốc" or default label
  const hasSelection = selectedOption && selectedOption.slug !== '';
  
  const displayTitle = hasSelection 
    ? `${label}: ${selectedOption.name}` 
    : label;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Dropdown Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border backdrop-blur-md transition-all duration-300 select-none text-left text-sm font-semibold hover:bg-white/10 ${
          isOpen || hasSelection 
            ? 'border-purple-500/50 shadow-[0_0_15px_rgba(114,38,255,0.15)] text-white' 
            : 'border-white/10 text-white/70'
        }`}
      >
        <span className="truncate">
          {hasSelection ? (
            <>
              {label}: <span className="text-cyan-400 font-bold">{selectedOption.name}</span>
            </>
          ) : (
            displayTitle
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/50 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-[#0a082c]/95 border border-white/10 rounded-2xl max-h-60 overflow-y-auto backdrop-blur-xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] p-2 scrollbar-thin flex flex-col gap-1"
          >
            {options.map((option) => {
              const isSelected = value === option.slug;
              return (
                <button
                  key={option.slug}
                  type="button"
                  onClick={() => {
                    onChange(option.slug);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#d070ff] to-[#7226FF] text-white shadow-md'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{option.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2 animate-scaleIn" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
