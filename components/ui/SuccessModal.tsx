'use client';

import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  autoCloseMs?: number;
}

// Tech-Luxe success confirmation — dark by design (fixed palette), used for create-success
// feedback across the app (devis, clients, catalogue, ...). Fire-and-forget: mount it once
// per page and flip `open` after a successful create.
export default function SuccessModal({ open, onClose, title, message, autoCloseMs = 2500 }: SuccessModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = autoCloseMs > 0 ? setTimeout(onClose, autoCloseMs) : undefined;
    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(2, 6, 12, 0.65)' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-3xl border p-7 text-center shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{ backgroundColor: '#161b22', borderColor: '#21262d' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto mb-5 w-16 h-16 relative">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ backgroundColor: 'rgba(0,242,254,0.15)' }}
          />
          <div
            className="animate-success-pop absolute inset-0 rounded-full flex items-center justify-center border"
            style={{ backgroundColor: 'rgba(0,242,254,0.08)', borderColor: 'rgba(0,242,254,0.3)' }}
          >
            <Check className="w-8 h-8" style={{ color: '#00f2fe' }} strokeWidth={3} />
          </div>
        </div>

        <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
        {message && <p className="text-xs text-slate-400 leading-relaxed">{message}</p>}
      </div>
    </div>
  );
}
