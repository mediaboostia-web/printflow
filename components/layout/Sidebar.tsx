'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Briefcase,
  Receipt,
  Truck,
  Settings,
  HelpCircle,
  Printer,
  ClipboardCheck,
  Globe,
  History
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';

export default function Sidebar() {
  const pathname = usePathname();
  const currentProfileId = useAppStore((state) => state.currentProfileId);
  const profiles = useAppStore((state) => state.profiles);
  const currentProfile = React.useMemo(
    () => profiles.find((p) => p.id === currentProfileId) || profiles[0],
    [profiles, currentProfileId]
  );
  const role = currentProfile ? currentProfile.role : 'commercial';
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);

  // Navigation structure
  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Clients', href: '/clients', icon: Users, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Catalogue', href: '/catalogue', icon: Package, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Devis', href: '/devis', icon: FileText, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Bons à Tirer (BAT)', href: '/bat', icon: ClipboardCheck, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Commandes', href: '/commandes', icon: Briefcase, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Commandes en ligne', href: '/commandes-en-ligne', icon: Globe, roles: ['admin', 'commercial'] },
    { name: 'Livraisons', href: '/livraisons', icon: Truck, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Factures & Règl.', href: '/factures', icon: Receipt, roles: ['admin', 'commercial'] }, // Hidden for chef_atelier
    { name: 'Historique', href: '/historique', icon: History, roles: ['admin', 'commercial'] },
  ];

  const preferenceNavigation = [
    { name: 'Paramètres', href: '/parametres', icon: Settings, roles: ['admin', 'commercial', 'chef_atelier'] },
    { name: 'Centre d\'aide', href: '/aide', icon: HelpCircle, roles: ['admin', 'commercial', 'chef_atelier'] },
  ];

  // Filter navigation by role
  const visibleMainNav = mainNavigation.filter(item => item.roles.includes(role));
  const visiblePrefNav = preferenceNavigation.filter(item => item.roles.includes(role));

  return (
    <aside 
      className={`bg-bg-card border-r border-border-subtle flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-20 md:w-64'
      }`}
    >
      {/* Brand logo */}
      <div 
        className={`h-16 flex items-center border-b border-border-subtle transition-all duration-300 ${
          isSidebarCollapsed ? 'justify-center px-2' : 'justify-center md:justify-start px-4 md:px-5'
        }`}
      >
        {isSidebarCollapsed ? (
          <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-8 h-8 object-contain rounded-lg shrink-0" />
        ) : (
          <div className="flex items-center gap-2.5 min-w-0">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-8 h-8 object-contain rounded-lg shrink-0" />
            <span className="hidden md:inline text-xl font-black tracking-tight text-text-main transition duration-300">
              Print<span className="text-brand-primary">_Flow</span>
            </span>
          </div>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 pt-5 space-y-7 no-scrollbar">
        {/* Main Menu */}
        <div>
          {!isSidebarCollapsed && (
            <h3 className="hidden md:block px-3 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 transition duration-300">
              Menu Principal
            </h3>
          )}
          <ul className="space-y-1">
            {visibleMainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              
              return (
                <li key={item.name} className="relative">
                  {/* Limelight Indicator Accent Line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(0,176,96,0.8)] z-10 animate-fade-in" />
                  )}
                  
                  <Link
                    href={item.href}
                    title={item.name}
                    className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-200 relative justify-center p-2.5 ${
                      isSidebarCollapsed 
                        ? '' 
                        : 'md:justify-start md:gap-3 md:px-3.5 md:py-2.5'
                    } ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                        : 'text-text-secondary hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-text-main'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`} />
                    {!isSidebarCollapsed && <span className="hidden md:inline">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Preference Menu */}
        <div>
          {!isSidebarCollapsed && (
            <h3 className="hidden md:block px-3 text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 transition duration-300">
              Préférences
            </h3>
          )}
          <ul className="space-y-1">
            {visiblePrefNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <li key={item.name} className="relative">
                  {/* Limelight Indicator Accent Line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(0,176,96,0.8)] z-10 animate-fade-in" />
                  )}
                  
                  <Link
                    href={item.href}
                    title={item.name}
                    className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-200 relative justify-center p-2.5 ${
                      isSidebarCollapsed 
                        ? '' 
                        : 'md:justify-start md:gap-3 md:px-3.5 md:py-2.5'
                    } ${
                      isActive 
                        ? 'bg-brand-primary/10 text-brand-primary font-bold' 
                        : 'text-text-secondary hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-text-main'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-primary' : 'text-text-secondary'}`} />
                    {!isSidebarCollapsed && <span className="hidden md:inline">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* User Status / Quick profile info */}
      <div className="p-4 border-t border-border-subtle bg-bg-base/30">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center md:justify-start gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-text-main flex items-center justify-center font-bold uppercase shrink-0 ring-2 ring-white dark:ring-slate-900">
            {currentProfile.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          {!isSidebarCollapsed && (
            <div className="hidden md:block flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-main truncate">{currentProfile.fullName}</p>
              <p className="text-xs text-text-secondary capitalize truncate">
                {role === 'chef_atelier' ? 'Chef d\'Atelier' : role}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
