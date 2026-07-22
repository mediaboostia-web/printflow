'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Briefcase,
  FileText,
  Activity,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAppStore } from '@/lib/state/store';
import {
  allQuotes,
  allBATs,
  allPOs,
  allInvoices,
  mockClients,
} from '@/lib/mock/data';
import { formatFCFA } from '@/lib/utils/money';

type ChartFilter = 'revenue' | 'orders' | 'bat';
type ChartPeriod = 'month' | 'quarter' | 'year';
type TableFilter = 'week' | 'month' | 'year';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const QUARTER_LABELS = ['T1', 'T2', 'T3', 'T4'];

export default function Dashboard() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const role = currentProfile ? currentProfile.role : 'commercial';
  const updateOrganizationSubscription = useAppStore((state) => state.updateOrganizationSubscription);

  // Interactive States
  const [hideFigures, setHideFigures] = useState<boolean>(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [chartFilter, setChartFilter] = useState<ChartFilter>('revenue');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('month');
  const [tableFilter, setTableFilter] = useState<TableFilter>('month');
  
  // Loading Scale States
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // Store data
  const storeQuotes = useAppStore((state) => state.quotes);
  const storeBATs = useAppStore((state) => state.bats);
  const storePOs = useAppStore((state) => state.pos);
  const storeInvoices = useAppStore((state) => state.invoices);
  const storeClients = useAppStore((state) => state.clients);

  // Dynamic Greeting based on time
  const [greeting, setGreeting] = useState<{ salutation: string; phrase: string }>({
    salutation: 'Bonjour',
    phrase: 'voici le résumé complet et garanti de votre performance aujourd\'hui.'
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let salutation = 'Bonjour';
      let phrase = 'voici le bilan consolidé et garanti de votre performance d\'activité.';
      
      if (hour >= 5 && hour < 12) {
        salutation = 'Bon matin';
        phrase = 'prêt pour lancer une excellente journée de production ? Vos indicateurs en direct sont actualisés.';
      } else if (hour >= 12 && hour < 18) {
        salutation = 'Bonjour';
        phrase = 'j\'espère que votre après-midi est productive. Retrouvez ici le suivi en direct de vos opérations.';
      } else if (hour >= 18 && hour < 22) {
        salutation = 'Bonsoir';
        phrase = 'voici le bilan complet et validé de votre performance aujourd\'hui. Toutes vos données d\'atelier sont à jour.';
      } else {
        salutation = 'Bonsoir';
        phrase = 'merci pour votre dévouement tardif. Retrouvez l\'ensemble de vos bilans de production à jour.';
      }
      setGreeting({ salutation, phrase });
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Instant filter handlers without artificial delay
  const handleChartFilterChange = (filter: ChartFilter) => {
    setChartFilter(filter);
  };

  const handleChartPeriodChange = (period: ChartPeriod) => {
    setChartPeriod(period);
  };

  const handleTableFilterChange = (filter: TableFilter) => {
    setTableFilter(filter);
  };

  // 1. Filter data by organization
  const quotes = storeQuotes.filter(q => q.organizationId === currentOrgId);
  const bats = storeBATs.filter(b => b.organizationId === currentOrgId);
  const pos = storePOs.filter(p => p.organizationId === currentOrgId);
  const invoices = storeInvoices.filter(i => i.organizationId === currentOrgId && !i.isDeleted);
  const clients = storeClients.filter(c => c.organizationId === currentOrgId);

  // 1b. Chart data — real per-month aggregates, reshaped by the selected period
  const monthlyBuckets = MONTH_LABELS.map((label, idx) => {
    const monthRevenue = invoices
      .filter(inv => new Date(inv.createdAt).getMonth() === idx)
      .reduce((sum, inv) => sum + Number(inv.totalFcfa), 0);
    const monthOrders = pos.filter(po => new Date(po.createdAt).getMonth() === idx).length;
    const monthBats = bats.filter(b => new Date(b.createdAt).getMonth() === idx);
    const monthBatValidated = monthBats.filter(b => b.status === 'valide').length;
    return { label, revenue: monthRevenue, orders: monthOrders, batValidated: monthBatValidated, batTotal: monthBats.length };
  });

  const chartData = (() => {
    if (chartPeriod === 'quarter') {
      return QUARTER_LABELS.map((label, qIdx) => {
        const monthsInQuarter = monthlyBuckets.slice(qIdx * 3, qIdx * 3 + 3);
        const revenue = monthsInQuarter.reduce((s, m) => s + m.revenue, 0);
        const orders = monthsInQuarter.reduce((s, m) => s + m.orders, 0);
        const batValidated = monthsInQuarter.reduce((s, m) => s + m.batValidated, 0);
        const batTotal = monthsInQuarter.reduce((s, m) => s + m.batTotal, 0);
        return { label, revenue, orders, bat: batTotal > 0 ? Math.round((batValidated / batTotal) * 100) : 0 };
      });
    }
    if (chartPeriod === 'year') {
      // Cumulative year-to-date trend — one point per month, values accumulate
      let cumRevenue = 0, cumOrders = 0, cumBatValidated = 0, cumBatTotal = 0;
      return monthlyBuckets.map((m) => {
        cumRevenue += m.revenue;
        cumOrders += m.orders;
        cumBatValidated += m.batValidated;
        cumBatTotal += m.batTotal;
        return {
          label: m.label,
          revenue: cumRevenue,
          orders: cumOrders,
          bat: cumBatTotal > 0 ? Math.round((cumBatValidated / cumBatTotal) * 100) : 0,
        };
      });
    }
    // month: one point per month, as-is
    return monthlyBuckets.map((m) => ({
      label: m.label,
      revenue: m.revenue,
      orders: m.orders,
      bat: m.batTotal > 0 ? Math.round((m.batValidated / m.batTotal) * 100) : 0,
    }));
  })();

  const chartMetricLabel = chartFilter === 'revenue' ? 'CA Actuel' : chartFilter === 'orders' ? 'Commandes produites' : "Taux d'approbation";
  const formatChartValue = (v: number) => {
    if (chartFilter === 'revenue') return formatFCFA(v);
    if (chartFilter === 'bat') return `${v}%`;
    return `${v}`;
  };

  // 2. Calculate Admin/Commercial financial metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalFcfa), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.amountPaidFcfa), 0);
  const totalUnpaid = totalRevenue - totalPaid;
  const activeOrdersCount = pos.filter(po => po.status !== 'termine').length;
  
  const validatedBatsCount = bats.filter(bat => bat.status === 'valide').length;
  const totalBatsCount = bats.length;
  const batValidationRate = totalBatsCount > 0 ? Math.round((validatedBatsCount / totalBatsCount) * 100) : 0;

  // 3. Calculate Chef d'Atelier specific production metrics
  const pendingProductionCount = pos.filter(po => po.status === 'en_attente_production').length;
  const inPrintCount = pos.filter(po => po.status === 'en_cours_impression').length;
  const completedProductionCount = pos.filter(po => po.status === 'termine').length;
  
  // Format numbers nicely
  const formattedRevenue = formatFCFA(totalRevenue);
  const formattedUnpaid = formatFCFA(totalUnpaid);

  // 4. Dynamic Time-Filtering for Recent Transactions
  const mockCurrentDate = new Date('2026-07-19T17:00:00Z');
  
  const getFilteredQuotes = () => {
    return quotes.filter(quote => {
      const quoteDate = new Date(quote.createdAt);
      const diffTime = Math.abs(mockCurrentDate.getTime() - quoteDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (tableFilter === 'week') {
        return diffDays <= 7;
      } else if (tableFilter === 'month') {
        return diffDays <= 30;
      }
      return true; // Year
    });
  };

  const filteredQuotes = getFilteredQuotes();

  // Helper to mask values
  const displayValue = (val: string) => {
    return hideFigures ? '••••••' : val;
  };

  if (pageLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center gap-4 bg-bg-base text-text-main transition-colors duration-300">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-brand-primary animate-spin" />
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 absolute animate-ping" />
        </div>
        <p className="text-sm font-semibold text-text-secondary animate-pulse">Chargement de Print_Flow...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Greetings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">
            {greeting.salutation}, {currentProfile.fullName} !
          </h1>
          <p className="text-text-secondary text-sm mt-0.5 font-medium">
            {greeting.phrase}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHideFigures(!hideFigures)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-bg-card border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-full px-4.5 py-2.5 shadow-sm transition shrink-0"
          >
            {hideFigures ? (
              <>
                <Eye className="w-3.5 h-3.5 text-text-secondary" />
                <span>Afficher les chiffres</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-text-secondary" />
                <span>Masquer les chiffres</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subscription Banner */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-premium relative overflow-hidden">
        <div className="flex items-center gap-3.5 z-10 min-w-0 w-full sm:w-auto">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 ${
            currentOrg.subscriptionPlanId === 'plan-pro'
              ? 'bg-purple-500/10 text-purple-500 border border-purple-500/25'
              : currentOrg.subscriptionPlanId === 'plan-std'
              ? 'bg-emerald-500/10 text-brand-primary border border-brand-primary/20'
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
          }`}>
            {currentOrg.subscriptionPlanId === 'plan-pro' ? '👑' : currentOrg.subscriptionPlanId === 'plan-std' ? '⭐' : '⏳'}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-extrabold text-text-main truncate">
                Formule active : <span className="text-brand-primary">{
                  currentOrg.subscriptionPlanId === 'plan-pro'
                    ? 'Formule PRO (Premium)'
                    : currentOrg.subscriptionPlanId === 'plan-std'
                    ? 'Formule STANDARD'
                    : "Essai Gratuit 7 Jours"
                }</span>
              </p>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                currentOrg.subscriptionStatus === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              }`}>
                {currentOrg.subscriptionStatus === 'active' ? 'Actif' : 'Expiré'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 font-semibold truncate">
              Date d'échéance : {currentOrg.subscriptionEndDate ? new Date(currentOrg.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Non définie'}
            </p>
          </div>
        </div>

        {/* Action upgrade — hidden once already on the Pro plan */}
        {role === 'admin' && currentOrg.subscriptionPlanId !== 'plan-pro' && (
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="text-xs font-bold text-brand-primary hover:text-white border border-brand-primary/30 hover:border-brand-primary hover:bg-brand-primary rounded-full px-5 py-2.5 transition shadow-sm shrink-0 cursor-pointer w-full sm:w-auto"
          >
            Changer d'abonnement / Mettre à niveau
          </button>
        )}
      </div>

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in text-text-main">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-xl shadow-premium overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/10">
              <h3 className="text-base font-extrabold text-text-main">
                Formules d'Abonnement Print_Flow
              </h3>
              <button 
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <p className="text-xs text-text-secondary leading-relaxed">
                Faites évoluer votre imprimerie en choisissant la formule adaptée à vos besoins. Pour finaliser ou modifier votre abonnement, vous pouvez soit changer directement ci-dessous, soit contacter notre support commercial.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Standard */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  currentOrg.subscriptionPlanId === 'plan-std'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border-subtle bg-bg-card'
                }`}>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase text-brand-primary">Formule Standard</span>
                    <h4 className="text-base font-black text-text-main">15 000 XAF <span className="text-xs font-normal text-text-secondary">/ mois</span></h4>
                    <ul className="text-[10px] text-text-secondary space-y-1 pt-2 list-disc list-inside">
                      <li>Devis, Factures, Commande</li>
                      <li>Gestion des clients</li>
                      <li>Ajout du personnel au choix</li>
                      <li className="text-rose-500 font-semibold">Pas d'import de document BAT</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      updateOrganizationSubscription(currentOrg.id, 'plan-std', 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                      setIsUpgradeModalOpen(false);
                      alert("Votre organisation a été migrée avec succès vers la Formule Standard !");
                    }}
                    className="w-full py-2 rounded-full border border-brand-primary/45 hover:bg-brand-primary hover:text-white text-xs font-bold text-brand-primary transition cursor-pointer"
                  >
                    Activer Standard (15K)
                  </button>
                </div>

                {/* Plan Pro */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                  currentOrg.subscriptionPlanId === 'plan-pro'
                    ? 'border-purple-500 bg-purple-500/5'
                    : 'border-border-subtle bg-bg-card'
                }`}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase text-purple-500">Formule PRO</span>
                      <span className="text-[8px] bg-purple-500/15 text-purple-600 px-1.5 py-0.5 rounded font-black">RECOMMANDÉ</span>
                    </div>
                    <h4 className="text-base font-black text-text-main">65 000 XAF <span className="text-xs font-normal text-text-secondary">/ mois</span></h4>
                    <ul className="text-[10px] text-text-secondary space-y-1 pt-2 list-disc list-inside">
                      <li>Toutes les fonctionnalités incluses</li>
                      <li>Ajout de personnel ILLIMITÉ</li>
                      <li className="text-emerald-500 font-bold">Import de fichiers BAT inclus</li>
                      <li>Accès complet sans restrictions</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      updateOrganizationSubscription(currentOrg.id, 'plan-pro', 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                      setIsUpgradeModalOpen(false);
                      alert("Félicitations ! Votre organisation a été migrée vers la Formule Pro !");
                    }}
                    className="w-full py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Activer PRO (65K)
                  </button>
                </div>
              </div>

              {/* WhatsApp Redirect */}
              <div className="bg-slate-105 dark:bg-slate-800/40 border border-border-subtle rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-text-main">Besoin d'assistance pour le paiement ?</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">Contactez notre support commercial par WhatsApp pour valider votre compte.</p>
                </div>
                <a
                  href="https://wa.me/24162451522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition shadow-sm whitespace-nowrap"
                >
                  Contacter Support (+241 62 45 15 22)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid with pointer-based glow and color effects */}
      {role !== 'chef_atelier' ? (
        // Admin & Commercial KPI Grid (Limelight Glow effects)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue Card */}
          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Chiffre d'Affaires émis</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight group-hover:text-brand-primary transition">
                  {displayValue(formattedRevenue)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" />
                +12.5%
              </span>
              <span className="text-text-secondary">vs mois dernier</span>
            </div>
          </div>

          {/* Unpaid Invoices Card */}
          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-amber-50/10 dark:hover:bg-amber-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Créances à recouvrer</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight group-hover:text-rose-600 transition">
                  {displayValue(formattedUnpaid)}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="flex items-center gap-0.5 font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3 h-3" />
                -4.2%
              </span>
              <span className="text-text-secondary">retard moyen 8j</span>
            </div>
          </div>

          {/* Active Orders Card */}
          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-blue-50/10 dark:hover:bg-blue-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Commandes actives</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight group-hover:text-brand-primary transition">
                  {activeOrdersCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{pos.filter(po => po.status === 'en_cours_impression').length} sous presse</span>
              <span className="text-text-secondary">• {pos.filter(po => po.status === 'en_attente_production').length} planifiées</span>
            </div>
          </div>

          {/* BAT Validation Rate Card */}
          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-violet-50/10 dark:hover:bg-violet-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Validation BAT</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight group-hover:text-brand-primary transition">
                  {batValidationRate}%
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="font-semibold text-violet-600 dark:text-violet-400">{validatedBatsCount} validés</span>
              <span className="text-text-secondary">sur {totalBatsCount} devis</span>
            </div>
          </div>
        </div>
      ) : (
        // Chef d'Atelier KPI Grid (Limelight Glow effects)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-blue-50/10 dark:hover:bg-blue-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Commandes actives</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight">{activeOrdersCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-text-secondary">Flux de l'atelier en cours</div>
          </div>

          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-amber-50/10 dark:hover:bg-amber-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">En attente d'impression</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight">{pendingProductionCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-text-secondary">Prêt pour planification</div>
          </div>

          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Sous presse</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight text-brand-primary">{inPrintCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-brand-primary flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-text-secondary">Impression physique active</div>
          </div>

          <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col justify-between hover:bg-violet-50/10 dark:hover:bg-violet-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Terminées ce mois</p>
                <h3 className="text-2xl font-bold text-text-main tracking-tight">{completedProductionCount}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs text-text-secondary">Prêt pour livraison/finition</div>
          </div>
        </div>
      )}

      {/* Full-width Chart Container */}
      <div className="bg-bg-card p-6 rounded-3xl border border-border-subtle shadow-premium flex flex-col relative overflow-hidden w-full">
        
        {/* Loading scale skeleton block instead of general spinner overlay */}
        {chartLoading ? (
          <div className="w-full flex flex-col h-full animate-scale-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-2 w-1/3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
              </div>
              <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            {/* Visual bar mock chart showing the scale animation pulse */}
            <div className="w-full h-[180px] md:h-[240px] flex items-end justify-between gap-4 px-6 py-4">
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[40%] rounded-2xl" />
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[60%] rounded-2xl" />
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[35%] rounded-2xl" />
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[80%] rounded-2xl" />
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[55%] rounded-2xl" />
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[70%] rounded-2xl" />
              <div className="bg-slate-200 dark:bg-slate-800 w-full h-[90%] rounded-2xl" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  {chartFilter === 'revenue' ? "Chiffre d'affaires" : chartFilter === 'orders' ? 'Volume de commandes' : 'Taux d\'approbation BAT'}
                </h3>
                <p className="text-text-secondary text-xs mt-0.5">
                  {chartPeriod === 'month' ? 'Détail mensuel' : chartPeriod === 'quarter' ? 'Détail trimestriel' : 'Cumul annuel'} — année en cours (2026)
                </p>
              </div>

              {/* Chart Filter tabs with stylish rounded corners */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-border-subtle w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={() => handleChartFilterChange('revenue')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    chartFilter === 'revenue'
                      ? 'bg-bg-card text-text-main shadow-sm'
                      : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  CA
                </button>
                <button
                  onClick={() => handleChartFilterChange('orders')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    chartFilter === 'orders'
                      ? 'bg-bg-card text-text-main shadow-sm'
                      : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  Commandes
                </button>
                <button
                  onClick={() => handleChartFilterChange('bat')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    chartFilter === 'bat'
                      ? 'bg-bg-card text-text-main shadow-sm'
                      : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  BAT %
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 text-text-main">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary block" />
                  {chartMetricLabel}
                </span>
              </div>

              {/* Period selector: Mois / Trimestre / Année */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-border-subtle w-full sm:w-auto">
                {([
                  { key: 'month', label: 'Mois' },
                  { key: 'quarter', label: 'Trimestre' },
                  { key: 'year', label: 'Année' },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleChartPeriodChange(opt.key)}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-[11px] font-bold transition ${
                      chartPeriod === opt.key
                        ? 'bg-bg-card text-brand-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-main'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts AreaChart — real, dynamic, driven by chartData/chartFilter/chartPeriod */}
            <div className="w-full h-[220px] md:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B060" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#00B060" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/50" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    className="text-text-secondary"
                    padding={{ left: 12, right: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tick={{ fontSize: 9, fill: 'currentColor' }}
                    className="text-text-secondary"
                    tickFormatter={(v: number) => (hideFigures ? '••' : chartFilter === 'bat' ? `${v}%` : chartFilter === 'revenue' ? `${Math.round(v / 1000)}k` : `${v}`)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const value = payload[0].value as number;
                      return (
                        <div className="rounded-xl bg-slate-900 dark:bg-slate-800 px-3.5 py-2.5 shadow-premium-lg">
                          <p className="text-[9px] font-medium text-slate-400">{label} — {chartMetricLabel}</p>
                          <p className="text-[11px] font-bold text-white">{displayValue(formatChartValue(value))}</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={chartFilter}
                    stroke="#00B060"
                    strokeWidth={3}
                    fill="url(#chartGradient)"
                    activeDot={{ r: 6, fill: '#00B060', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Transactions / Activity list without details action column */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden relative">
        {tableLoading ? (
          // Component Scale Loading Skeleton for table
          <div className="p-6 space-y-4 animate-scale-pulse">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex justify-between items-center py-2">
                  <div className="space-y-2 w-1/3">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2"></div>
                  </div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-5 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-text-main">Opérations Récentes</h3>
                <p className="text-text-secondary text-xs mt-0.5">Dernières commandes, devis et paiements enregistrés</p>
              </div>
              
              {/* Dynamic Table Filter with stylish rounded-full corners */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-border-subtle w-full justify-between sm:justify-start">
                  <button
                    onClick={() => handleTableFilterChange('week')}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      tableFilter === 'week' 
                        ? 'bg-bg-card text-text-main shadow-sm' 
                        : 'text-text-secondary hover:text-text-main'
                    }`}
                  >
                    Semaine
                  </button>
                  <button
                    onClick={() => handleTableFilterChange('month')}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      tableFilter === 'month' 
                        ? 'bg-bg-card text-text-main shadow-sm' 
                        : 'text-text-secondary hover:text-text-main'
                    }`}
                  >
                    Mois
                  </button>
                  <button
                    onClick={() => handleTableFilterChange('year')}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      tableFilter === 'year' 
                        ? 'bg-bg-card text-text-main shadow-sm' 
                        : 'text-text-secondary hover:text-text-main'
                    }`}
                  >
                    Année
                  </button>
                </div>
                
                <button className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-brand-primary border border-border-subtle rounded-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition w-full sm:w-auto text-center">
                  Voir tout
                </button>
              </div>
            </div>

            {/* Table layout (no Action column) */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-text-main">
                <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="px-4 sm:px-6 py-4">Opération / Devis</th>
                    <th className="px-4 sm:px-6 py-4">Client</th>
                    <th className="px-4 sm:px-6 py-4">Type / Statut</th>
                    <th className="px-4 sm:px-6 py-4">Créateur / Acteur</th>
                    {role !== 'chef_atelier' && <th className="px-4 sm:px-6 py-4 text-right">Montant</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredQuotes.length > 0 ? (
                    filteredQuotes.slice(0, 5).map((quote) => {
                      const client = clients.find(c => c.id === quote.clientId);
                      const order = pos.find(p => p.quoteId === quote.id);
                      const invoice = invoices.find(i => i.quoteId === quote.id);
                      
                      const getStatusBadge = (status: string) => {
                        switch(status) {
                          case 'valide':
                          case 'soldee':
                          case 'termine':
                            return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
                          case 'soumis':
                          case 'en_cours_impression':
                          case 'partiellement_payee':
                            return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
                          case 'en_attente':
                          case 'en_attente_acompte':
                          case 'en_attente_production':
                            return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
                          case 'refuse':
                            return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
                          default:
                            return 'bg-slate-50 dark:bg-slate-800/20 text-slate-700 dark:text-slate-350 border-border-subtle';
                        }
                      };

                      const getStatusLabel = (status: string) => {
                        switch(status) {
                          case 'en_attente': return 'En attente';
                          case 'valide': return 'Validé';
                          case 'refuse': return 'Refusé';
                          case 'soumis': return 'BAT Soumis';
                          case 'en_attente_production': return 'Prêt production';
                          case 'en_cours_impression': return 'Sous Presse';
                          case 'termine': return 'Terminé';
                          case 'en_attente_acompte': return 'Attente acompte';
                          case 'partiellement_payee': return 'Acompte versé';
                          case 'soldee': return 'Facture Soldée';
                          default: return status;
                        }
                      };

                      return (
                        <tr key={quote.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-text-main flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-slate-400" />
                              {quote.quoteNumber}
                            </div>
                            <span className="text-xs text-text-secondary">
                              Créé le {new Date(quote.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <p className="font-medium text-text-main">{client?.companyName || 'Client inconnu'}</p>
                            <p className="text-xs text-text-secondary">{client?.contactName || ''}</p>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(quote.status)}`}>
                                Devis: {getStatusLabel(quote.status)}
                              </span>
                              {order && (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(order.status)}`}>
                                  Prod: {getStatusLabel(order.status)}
                                </span>
                              )}
                              {invoice && (
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getStatusBadge(invoice.status)}`}>
                                  Facture: {getStatusLabel(invoice.status)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs font-medium">
                            Amadou Sow
                            <span className="block text-[10px] text-text-secondary">Commercial</span>
                          </td>
                          {role !== 'chef_atelier' && (
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-bold text-text-main">
                              {displayValue(formatFCFA(quote.totalFcfa))}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={role === 'chef_atelier' ? 4 : 5} className="px-6 py-12 text-center text-text-secondary font-medium">
                        Aucune opération sur cette période.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
