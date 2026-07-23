'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingBag, 
  CreditCard, 
  Plus, 
  X, 
  Users, 
  Store, 
  FileCheck, 
  Truck, 
  ShoppingCart, 
  History, 
  Settings, 
  HelpCircle, 
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';

export default function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const canAccessHistory = useAppStore((state) => state.canAccessHistory());
  const canUseOnlineOrders = useAppStore((state) => state.canUseOnlineOrders());

  const role = currentProfile?.role || 'commercial';
  const planId = currentOrg?.subscriptionPlanId || 'plan-free';

  // Primary 4 Tabs for Bottom Bar
  const primaryTabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Devis', href: '/devis', icon: FileText },
    { name: 'Commandes', href: '/commandes', icon: ShoppingBag },
    { name: 'Factures', href: '/factures', icon: CreditCard, hideForRole: 'chef_atelier' },
  ].filter(t => !t.hideForRole || t.hideForRole !== role);

  // Secondary Modules for Bottom Sheet Drawer
  const secondaryModules = [
    { name: 'Clients', href: '/clients', icon: Users, roleAllowed: true },
    { name: 'Catalogue', href: '/catalogue', icon: Store, roleAllowed: true },
    { name: 'BAT (Proof)', href: '/bat', icon: FileCheck, roleAllowed: true },
    { name: 'Livraisons', href: '/livraisons', icon: Truck, roleAllowed: true },
    { 
      name: 'Commandes en ligne', 
      href: '/commandes-en-ligne', 
      icon: ShoppingCart, 
      roleAllowed: true,
      locked: !canUseOnlineOrders,
      lockBadge: 'PRO' 
    },
    { 
      name: 'Historique', 
      href: '/historique', 
      icon: History, 
      roleAllowed: true,
      locked: !canAccessHistory,
      lockBadge: 'PRO' 
    },
    { name: 'Paramètres', href: '/parametres', icon: Settings, roleAllowed: role === 'admin' },
    { name: 'Aide & FAQ', href: '/aide', icon: HelpCircle, roleAllowed: true },
  ].filter(m => m.roleAllowed);

  return (
    <>
      {/* Mobile Fixed Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-md border-t border-border-subtle px-3 py-1.5 flex items-center justify-around shadow-2xl">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setIsOpen(false)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 text-[10px] font-medium ${
                isActive 
                  ? 'text-brand-primary font-bold bg-brand-primary/10' 
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`} />
              <span>{tab.name}</span>
            </Link>
          );
        })}

        {/* Plus (+) Trigger Button for Bottom Sheet */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 text-[10px] font-medium text-text-secondary hover:text-brand-primary"
        >
          <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="mt-0.5 text-brand-primary font-semibold">Plus</span>
        </button>
      </div>

      {/* Bottom Sheet Drawer Modal */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex flex-col justify-end animate-fade-in">
          {/* Backdrop dismiss */}
          <div className="flex-1" onClick={() => setIsOpen(false)} />

          {/* Drawer Content */}
          <div className="bg-bg-card border-t border-border-subtle rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                  <span>Tous les modules</span>
                  {planId === 'plan-pro' ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      Formule Pro
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                      Essai 7 Jours
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {currentOrg?.name} • {currentProfile?.fullName || 'Utilisateur'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-text-secondary hover:text-text-main flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid List of Secondary Modules */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {secondaryModules.map((module) => {
                const Icon = module.icon;
                const isActive = pathname === module.href;

                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-150 relative ${
                      isActive
                        ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary'
                        : 'bg-bg-base dark:bg-[#0B0F19] border-border-subtle text-text-main hover:border-brand-primary/30'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-brand-primary text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-text-secondary'}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{module.name}</p>
                      {module.locked && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                          <Lock className="w-2.5 h-2.5" /> Plan Pro
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Super Admin Special Link */}
              {isSuperAdmin && (
                <Link
                  href="/super-admin"
                  onClick={() => setIsOpen(false)}
                  className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Espace Super Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
