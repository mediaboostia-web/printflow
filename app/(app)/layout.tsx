'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAppStore } from '@/lib/state/store';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const theme = useAppStore((state) => state.theme);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const checkSession = useAppStore((state) => state.checkSession);
  const [showWhatsAppPopup, setShowWhatsAppPopup] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Sync theme to document element on mount/change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadSupabaseData = useAppStore((state) => state.loadSupabaseData);

  // Verify the real Supabase Auth session (cookie-backed) once localStorage has
  // rehydrated. proxy.ts already blocks unauthenticated requests server-side —
  // this is the client-side follow-up so isAuthenticated reflects reality even
  // when it's stale (e.g. the session expired since the last visit).
  useEffect(() => {
    if (!hasHydrated) return;
    checkSession().finally(() => setSessionChecked(true));
  }, [hasHydrated, checkSession]);

  useEffect(() => {
    if (!hasHydrated || !sessionChecked) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (isSuperAdmin) {
      router.replace('/super-admin');
    }
  }, [hasHydrated, sessionChecked, isAuthenticated, isSuperAdmin, router]);

  // Load database tables from Supabase upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadSupabaseData();
    }
  }, [isAuthenticated, loadSupabaseData]);

  // Track active activity intervals for Free Trial accounts (trigger popup every 20 mins)
  useEffect(() => {
    if (!isAuthenticated || isSuperAdmin || !currentOrg) return;
    if (currentOrg.subscriptionPlanId !== 'plan-free') return;

    let lastPopupTime = Number(localStorage.getItem('printflow-last-whatsapp-popup') || '0');
    if (!lastPopupTime) {
      lastPopupTime = Date.now();
      localStorage.setItem('printflow-last-whatsapp-popup', String(lastPopupTime));
    }

    const interval = setInterval(() => {
      const current = Date.now();
      const elapsedMs = current - lastPopupTime;
      const twentyMinutesMs = 20 * 60 * 1000;

      if (elapsedMs >= twentyMinutesMs) {
        setShowWhatsAppPopup(true);
        lastPopupTime = current;
        localStorage.setItem('printflow-last-whatsapp-popup', String(lastPopupTime));
      }
    }, 10000); // check status every 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, isSuperAdmin, currentOrg]);

  if (!hasHydrated || !sessionChecked || !isAuthenticated || isSuperAdmin) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-base dark:bg-[#0B0F19]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="app-shell flex h-screen w-screen overflow-hidden bg-bg-base dark:bg-[#0B0F19] text-text-main dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content pane */}
      <div className="app-shell-col flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar header */}
        <Header />

        {/* Scrollable page content */}
        <main className="app-shell-main flex-1 overflow-y-auto px-6 py-6 scroll-smooth bg-bg-base dark:bg-[#0B0F19] transition-colors duration-300">
          {children}
        </main>
      </div>

      {/* WhatsApp Support Upgrade Popup Modal */}
      {showWhatsAppPopup && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/85 flex items-center justify-center z-55 p-4 backdrop-blur-xs animate-fade-in text-text-main">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden text-center p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ⏳
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-text-main">Essai Gratuit — Print_Flow</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Vous utilisez actuellement notre offre d'essai gratuit de 7 jours. Pour continuer à profiter pleinement de toutes les fonctionnalités de gestion, passez à un abonnement payant Standard ou Pro.
              </p>
            </div>

            <p className="text-[10px] text-brand-primary font-bold">
              Contactez directement notre service client par WhatsApp pour activer votre abonnement en quelques minutes.
            </p>

            <div className="space-y-2">
              <a
                href="https://wa.me/24162451522"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowWhatsAppPopup(false)}
                className="w-full inline-block py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition shadow-sm"
              >
                Contacter Support (+241 62 45 15 22)
              </a>
              <button
                onClick={() => setShowWhatsAppPopup(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-text-secondary text-xs font-bold rounded-full transition cursor-pointer border border-border-subtle"
              >
                Continuer l'essai gratuit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
