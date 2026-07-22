'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption<T> {
  value: T;
  label: string;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Dropdown<T extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Sélectionner...',
  className = '',
  disabled = false
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active option
  const activeOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm text-text-main flex items-center justify-between transition focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400 dark:hover:border-slate-700'
        }`}
      >
        <span className="truncate">{activeOption ? activeOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 mt-1.5 w-full bg-bg-card border border-border-subtle rounded-xl shadow-premium py-1 z-50 max-h-60 overflow-y-auto no-scrollbar animate-fade-in">
          {options.length > 0 ? (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-brand-primary/10 hover:text-brand-primary transition-all duration-150 ${
                  opt.value === value ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'text-text-main'
                }`}
              >
                {opt.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-xs text-text-secondary italic">Aucune option</div>
          )}
        </div>
      )}
    </div>
  );
}
