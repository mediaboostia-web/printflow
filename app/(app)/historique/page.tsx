'use client';

import React, { useState } from 'react';
import {
  History,
  Lock,
  Search,
  FileText,
  ClipboardCheck,
  Receipt,
  Wallet,
  Clock,
  Activity
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';

type HistoryFilter = 'all' | 'quotes' | 'bat' | 'invoices' | 'payments';

const filterMeta: Record<Exclude<HistoryFilter, 'all'>, { label: string; icon: typeof FileText; classes: string }> = {
  quotes: { label: 'Devis', icon: FileText, classes: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  bat: { label: 'BAT', icon: ClipboardCheck, classes: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  invoices: { label: 'Factures', icon: Receipt, classes: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' },
  payments: { label: 'Paiements', icon: Wallet, classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
};

export default function HistoriquePage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const canUsePublicCatalogue = useAppStore((state) => state.canUsePublicCatalogue());
  const auditLogs = useAppStore((state) => state.auditLogs);

  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!canUsePublicCatalogue) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Historique</h1>
          <p className="text-text-secondary text-sm mt-0.5">Traçabilité complète des devis, BAT, factures et paiements de votre organisation.</p>
        </div>
        <div className="bg-bg-card border border-dashed border-border-subtle rounded-3xl p-10 shadow-premium flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-text-main">Fonctionnalité réservée à la Formule Pro</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Passez à la Formule Pro pour conserver un historique complet et consultable à tout moment des devis créés/validés, BAT, factures émises et paiements enregistrés. Contactez votre administrateur Print_Flow pour l'activer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const relevantTypes: string[] = ['quotes', 'bat', 'invoices', 'payments'];

  const orgLogs = auditLogs
    .filter(l => l.organizationId === currentOrgId && relevantTypes.includes(l.entityType))
    .filter(l => filter === 'all' || l.entityType === filter)
    .filter(l => l.action.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const countByType = (type: Exclude<HistoryFilter, 'all'>) =>
    auditLogs.filter(l => l.organizationId === currentOrgId && l.entityType === type).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Historique</h1>
        <p className="text-text-secondary text-sm mt-0.5">Traçabilité complète des devis, BAT, factures et paiements de votre organisation.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {(Object.keys(filterMeta) as Exclude<HistoryFilter, 'all'>[]).map((type) => {
          const meta = filterMeta[type];
          const Icon = meta.icon;
          return (
            <div key={type} className="rounded-3xl bg-bg-card border border-border-subtle p-4 sm:p-5 space-y-2 shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] transition min-w-0">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${meta.classes}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-2xl font-bold text-text-main truncate">{countByType(type)}</p>
              <p className="text-xs text-text-secondary truncate">{meta.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
          />
        </div>
        <div className="flex overflow-x-auto gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-border-subtle no-scrollbar whitespace-nowrap w-full">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${filter === 'all' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
          >
            Tous
          </button>
          {(Object.keys(filterMeta) as Exclude<HistoryFilter, 'all'>[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${filter === type ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              {filterMeta[type].label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 shadow-premium">
        {orgLogs.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {orgLogs.map((log, idx) => {
                const meta = filterMeta[log.entityType as Exclude<HistoryFilter, 'all'>];
                const Icon = meta?.icon || Activity;
                return (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {idx !== orgLogs.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                      )}
                      <div className="relative flex items-start gap-3">
                        <span className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${meta?.classes || 'bg-slate-100 text-text-secondary border-border-subtle'}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <div className="flex-1 min-w-0 pt-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <p className="text-xs sm:text-sm text-text-main font-medium break-words">{log.action}</p>
                          <div className="flex items-center gap-1 text-[10px] text-text-secondary shrink-0 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            {new Date(log.occurredAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="py-16 text-center text-text-secondary font-medium flex flex-col items-center gap-3">
            <History className="w-10 h-10 opacity-40" />
            <span>Aucun événement à afficher pour le moment.</span>
          </div>
        )}
      </div>
    </div>
  );
}
