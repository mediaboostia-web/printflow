'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, 
  LogOut, 
  Building2, 
  Users, 
  CreditCard, 
  Sparkles, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  Check, 
  Clock, 
  Shield, 
  Key, 
  Copy, 
  Activity, 
  Layout, 
  FileText,
  AlertCircle,
  X,
  Download,
  Eye,
  Printer
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import { Organization, Profile, AuditLog } from '@/types/domain';
import Dropdown from '@/components/ui/Dropdown';

// Import Recharts components for beautiful trends graphs
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function SuperAdminHomePage() {
  const router = useRouter();
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isSuperAdmin = useAppStore((state) => state.isSuperAdmin);
  const checkSession = useAppStore((state) => state.checkSession);
  const logout = useAppStore((state) => state.logout);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Store lists & actions
  const organizations = useAppStore((state) => state.organizations);
  const profiles = useAppStore((state) => state.profiles);
  const superadmins = useAppStore((state) => state.superadmins || []);
  const subscriptionPlans = useAppStore((state) => state.subscriptionPlans);
  const availableTemplates = useAppStore((state) => state.availableTemplates);
  const auditLogs = useAppStore((state) => state.auditLogs);

  const addOrganizationWithAdmin = useAppStore((state) => state.addOrganizationWithAdmin);
  const toggleOrganizationActive = useAppStore((state) => state.toggleOrganizationActive);
  const updateOrganizationSubscription = useAppStore((state) => state.updateOrganizationSubscription);
  const addSubscriptionPlan = useAppStore((state) => state.addSubscriptionPlan);
  const updateSubscriptionPlan = useAppStore((state) => state.updateSubscriptionPlan);
  const deleteSubscriptionPlan = useAppStore((state) => state.deleteSubscriptionPlan);
  const addInvoiceTemplate = useAppStore((state) => state.addInvoiceTemplate);
  const loadSupabaseData = useAppStore((state) => state.loadSupabaseData);
  const addSuperAdmin = useAppStore((state) => state.addSuperAdmin);

  // Navigation tab: 'dashboard' | 'subscriptions' | 'organizations' | 'templates' | 'audit_logs' | 'themes' | 'profile'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'organizations' | 'templates' | 'audit_logs' | 'themes' | 'profile'>('dashboard');

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Search query for organizations and audits
  const [orgSearch, setOrgSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Modals & form states
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // New Org & Admin states
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgAddress, setNewOrgAddress] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPlanId, setNewOrgPlanId] = useState('plan-std');
  
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('admin123');
  
  // Success popup state for generated admin credentials
  const [createdAdminCreds, setCreatedAdminCreds] = useState<{ email: string; pass: string; org: string } | null>(null);

  // New Super Admin states
  const [newSaFullName, setNewSaFullName] = useState('');
  const [newSaEmail, setNewSaEmail] = useState('');
  const [newSaPassword, setNewSaPassword] = useState('RootAccess#2026');

  // Plan CRUD states
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState<number>(25000);
  const [planCycle, setPlanCycle] = useState<'monthly' | '6_months' | '12_months'>('monthly');
  const [planDesc, setPlanDesc] = useState('');

  // Template CRUD states
  const [templateId, setTemplateId] = useState('');
  const [templateName, setTemplateName] = useState('');

  // Manual Subscription Assign states
  const [assignOrgId, setAssignOrgId] = useState('');
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignStatus, setAssignStatus] = useState<'active' | 'suspended'>('active');
  const [assignMonthsDuration, setAssignMonthsDuration] = useState(1);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState('');
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    checkSession().finally(() => setSessionChecked(true));
  }, [hasHydrated, checkSession]);

  useEffect(() => {
    if (!hasHydrated || !sessionChecked) return;
    if (!isAuthenticated || !isSuperAdmin) {
      router.replace('/super-admin/login');
    } else {
      loadSupabaseData();
    }
  }, [hasHydrated, sessionChecked, isAuthenticated, isSuperAdmin, router, loadSupabaseData]);

  if (!hasHydrated || !sessionChecked || !isAuthenticated || !isSuperAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090D16]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Toast feedback trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Compute stats
  const totalOrgs = organizations.length;
  const totalUsers = profiles.length;
  const activeSubs = organizations.filter(o => o.isActive && o.subscriptionStatus === 'active').length;
  const globalRevenue = organizations.reduce((acc, o) => {
    if (o.subscriptionStatus !== 'active') return acc;
    const plan = subscriptionPlans.find(p => p.id === o.subscriptionPlanId);
    return acc + (plan ? plan.priceFcfa : 0);
  }, 0);

  // Sample Recharts Trend data
  const trendData = [
    { name: 'Janv', orgs: 2, users: 5, revenue: 150000 },
    { name: 'Févr', orgs: 3, users: 9, revenue: 270000 },
    { name: 'Mars', orgs: 4, users: 13, revenue: 390000 },
    { name: 'Avril', orgs: 6, users: 18, revenue: 510000 },
    { name: 'Mai', orgs: 8, users: 24, revenue: 760000 },
    { name: 'Juin', orgs: 10, users: 31, revenue: 980000 },
    { name: 'Juill', orgs: totalOrgs, users: totalUsers, revenue: globalRevenue || 980000 }
  ];

  // Org Submit Form
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !adminFullName || !adminEmail) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    setIsCreatingOrg(true);
    const res = await addOrganizationWithAdmin(
      { name: newOrgName, address: newOrgAddress, phone: newOrgPhone, email: newOrgEmail, subscriptionPlanId: newOrgPlanId },
      { fullName: adminFullName, email: adminEmail, role: 'admin', password: adminPassword }
    );
    setIsCreatingOrg(false);

    if (!res.success) {
      alert(res.error || "Impossible de créer l'organisation.");
      return;
    }

    // Save admin info to display in credentials popup
    setCreatedAdminCreds({
      email: adminEmail,
      pass: adminPassword,
      org: newOrgName
    });

    // Reset fields
    setNewOrgName('');
    setNewOrgAddress('');
    setNewOrgPhone('');
    setNewOrgEmail('');
    setAdminFullName('');
    setAdminEmail('');
    setAdminPassword('admin123');

    setIsOrgModalOpen(false);
    triggerToast('Organisation et compte Administrateur créés avec succès !');
  };

  // Plan Submit Form
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName) return;

    if (selectedPlan) {
      // Edit
      updateSubscriptionPlan({
        id: selectedPlan.id,
        name: planName,
        priceFcfa: Number(planPrice),
        billingCycle: planCycle,
        description: planDesc
      });
      triggerToast('Formule d\'abonnement mise à jour.');
    } else {
      // Create
      addSubscriptionPlan({
        name: planName,
        priceFcfa: Number(planPrice),
        billingCycle: planCycle,
        description: planDesc
      });
      triggerToast('Nouvelle formule d\'abonnement créée.');
    }

    setIsPlanModalOpen(false);
    setSelectedPlan(null);
    setPlanName('');
    setPlanPrice(25000);
    setPlanDesc('');
  };

  const handleOpenEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPlanName(plan.name);
    setPlanPrice(plan.priceFcfa);
    setPlanCycle(plan.billingCycle);
    setPlanDesc(plan.description);
    setIsPlanModalOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Voulez-vous supprimer cette formule d\'abonnement ?')) {
      deleteSubscriptionPlan(planId);
      triggerToast('Formule d\'abonnement supprimée.');
    }
  };

  // Template Submit
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId || !templateName) return;
    addInvoiceTemplate({ id: templateId, name: templateName });
    setTemplateId('');
    setTemplateName('');
    setIsTemplateModalOpen(false);
    triggerToast('Nouveau gabarit de facture ajouté.');
  };

  // Subscription Assignment Submit
  const handleAssignSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignOrgId || !assignPlanId) return;

    const endDate = new Date(Date.now() + assignMonthsDuration * 30 * 24 * 60 * 60 * 1000).toISOString();
    updateOrganizationSubscription(assignOrgId, assignPlanId, assignStatus, endDate);
    setIsAssignModalOpen(false);
    triggerToast('Abonnement de l\'organisation attribué manuellement.');
  };

  // Filter lists
  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(orgSearch.toLowerCase()) || 
    (o.email && o.email.toLowerCase().includes(orgSearch.toLowerCase()))
  );

  const filteredLogs = auditLogs.filter(l => 
    l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.organizationId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col md:flex-row antialiased">
      
      {/* Super Admin Left Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 md:sticky md:top-0 md:h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-slate-900">Print_Flow</h1>
            <span className="text-[10px] text-brand-primary font-bold tracking-wider uppercase mt-1.5 block">Super Admin</span>
          </div>
        </div>

        {/* Sidebar Navigation - Clean, without searchbar */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'dashboard'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'dashboard' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <Activity className="w-4 h-4 shrink-0" />
            <span>Dashboard Global</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'subscriptions'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'subscriptions' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Formules & Abonnements</span>
          </button>

          <button
            onClick={() => setActiveTab('organizations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'organizations'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'organizations' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Gestion Organisations</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'templates'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'templates' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <Layout className="w-4 h-4 shrink-0" />
            <span>Gabarits & Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'audit_logs'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'audit_logs' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <FileText className="w-4 h-4 shrink-0" />
            <span>Journal d'Activités</span>
          </button>

          <button
            onClick={() => setActiveTab('themes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'themes'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'themes' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <Globe className="w-4 h-4 shrink-0" />
            <span>Thèmes (Bientôt dispo)</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-xs font-bold transition relative ${
              activeTab === 'profile'
                ? 'bg-brand-primary/10 text-brand-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {activeTab === 'profile' && (
              <span className="w-1 h-5 bg-brand-primary absolute left-0 rounded-r-full shadow-[0_0_10px_rgba(0,176,96,0.8)]" />
            )}
            <Shield className="w-4 h-4 shrink-0" />
            <span>Profil & Opérateurs</span>
          </button>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Se déconnecter</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 min-w-0 bg-slate-50 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* Toast Notification popup */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-premium z-50 animate-bounce text-xs font-bold flex items-center gap-2 text-white">
            <Sparkles className="w-4.5 h-4.5 text-brand-primary animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header of Content tab */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                {activeTab === 'dashboard' && 'Dashboard Infrastructure'}
                {activeTab === 'subscriptions' && 'Formules & Abonnements'}
                {activeTab === 'organizations' && 'Gestion des Organisations'}
                {activeTab === 'templates' && 'Gabarits de Facturation'}
                {activeTab === 'audit_logs' && 'Journal d\'Activité Audit'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'dashboard' && 'Statistiques globales d\'activité de la plate-forme SaaS.'}
                {activeTab === 'subscriptions' && 'Définir les packages tarifaires et attribuer les plans.'}
                {activeTab === 'organizations' && 'Piloter les imprimeries tenancières de l\'infrastructure.'}
                {activeTab === 'templates' && 'Mettre en ligne les gabarits A4 éditables de factures.'}
                {activeTab === 'audit_logs' && 'Historique de traçabilité des opérations de la plate-forme.'}
              </p>
            </div>
            
            {/* Date and Time Header Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm shrink-0">
              <Clock className="w-4 h-4 text-brand-primary" />
              <div className="text-left text-[11px] font-bold">
                <span className="first-letter:uppercase text-slate-700">
                  {currentTime.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="mx-2 text-slate-350">|</span>
                <span className="text-brand-primary font-black font-mono">
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2 shrink-0">
            {activeTab === 'organizations' && (
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer une Imprimerie</span>
              </button>
            )}
            {activeTab === 'subscriptions' && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPlan(null);
                    setPlanName('');
                    setPlanPrice(25000);
                    setPlanDesc('');
                    setIsPlanModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouvelle Formule</span>
                </button>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-slate-700 bg-[#101726] hover:bg-slate-800 text-slate-200 text-xs font-bold transition shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Attribuer un Plan</span>
                </button>
              </div>
            )}
            {activeTab === 'templates' && (
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Gabarit</span>
              </button>
            )}
          </div>
        </div>

        {/* Credentials popup if organization is just created */}
        {createdAdminCreds && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-premium max-w-xl animate-fade-in">
            <div className="flex items-center gap-2.5 text-brand-primary font-bold text-sm">
              <Shield className="w-5 h-5" />
              <span>Identifiants Administrateur Générés !</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Le premier compte d'administrateur pour l'organisation <span className="font-bold text-white">"{createdAdminCreds.org}"</span> a été configuré avec succès. Copiez ces identifiants pour les remettre au client :
            </p>
            <div className="bg-[#101726] p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Adresse e-mail :</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-white">{createdAdminCreds.email}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(createdAdminCreds.email);
                      triggerToast('E-mail copié !');
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Mot de passe :</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-white">{createdAdminCreds.pass}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(createdAdminCreds.pass);
                      triggerToast('Mot de passe copié !');
                    }}
                    className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCreatedAdminCreds(null)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs font-bold text-white transition"
            >
              Fermer cet avis de sécurité
            </button>
          </div>
        )}

        {/* ---------------- 1. DASHBOARD GLOBAL TAB ---------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* KPI statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-2 hover:bg-emerald-50/10 hover:border-brand-primary/40 transition shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{totalOrgs}</p>
                <p className="text-xs text-slate-500">Imprimeries affiliées</p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-2 hover:bg-emerald-50/10 hover:border-brand-primary/40 transition shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
                <p className="text-xs text-slate-500">Utilisateurs actifs globaux</p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-2 hover:bg-emerald-50/10 hover:border-brand-primary/40 transition shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{activeSubs}</p>
                <p className="text-xs text-slate-500">Abonnements actifs</p>
              </div>

              <div className="rounded-3xl bg-white border border-slate-200 p-5 space-y-2 hover:bg-emerald-50/10 hover:border-brand-primary/40 transition shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600">
                  <Globe className="w-4.5 h-4.5" />
                </div>
                <p className="text-xl font-extrabold text-brand-primary">{formatFCFA(globalRevenue)}</p>
                <p className="text-xs text-slate-500">Chiffre d'affaires SaaS</p>
              </div>
            </div>

            {/* Recharts smoothing trend chart */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Analyse de croissance de l'infrastructure</span>
                <span className="px-3 py-1 bg-slate-100 text-[10px] text-slate-600 font-bold rounded-full">Mensuel (2026)</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00B060" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#00B060" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '11px', color: '#1E293B' }}
                      formatter={(val: any, name: any) => {
                        if (name === 'revenue') return [formatFCFA(val), 'Revenus'];
                        if (name === 'orgs') return [val, 'Organisations'];
                        return [val, 'Utilisateurs'];
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#00B060" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List of default organizations status summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Répartition abonnements</h3>
                <div className="space-y-3">
                  {subscriptionPlans.map(plan => {
                    const count = organizations.filter(o => o.subscriptionPlanId === plan.id).length;
                    const percent = organizations.length > 0 ? (count / organizations.length) * 100 : 0;
                    return (
                      <div key={plan.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-700">
                          <span>{plan.name}</span>
                          <span className="font-bold text-slate-900">{count} org. ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-primary" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">État du service</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Authentification client (Supabase Auth Mock)</span>
                    <span className="text-brand-primary font-bold">Actif • Normal</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Base de données en mémoire (Zustand state)</span>
                    <span className="text-brand-primary font-bold">Actif • Normal</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-500">Fichiers BAT volumineux (Virtual Upload)</span>
                    <span className="text-brand-primary font-bold">Actif • Normal</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Table or grid of existing plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map(plan => {
                const count = organizations.filter(o => o.subscriptionPlanId === plan.id).length;
                return (
                  <div key={plan.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between hover:border-brand-primary/40 transition space-y-4 shadow-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="text-base font-extrabold text-slate-900">{plan.name}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-bold uppercase">
                          {plan.billingCycle === 'monthly' && 'Mensuel'}
                          {plan.billingCycle === '6_months' && '6 mois'}
                          {plan.billingCycle === '12_months' && 'Annuel'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-655 leading-relaxed min-h-[36px]">{plan.description}</p>
                      <div className="pt-2">
                        <span className="text-lg font-black text-brand-primary">{formatFCFA(plan.priceFcfa)}</span>
                        <span className="text-[10px] text-slate-500"> / cycle</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-semibold">{count} imprimeries actives</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditPlan(plan)}
                          className="p-2 rounded-xl text-slate-500 hover:text-brand-primary hover:bg-brand-primary/10 transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List of Orgs subscriptions table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suivi des abonnements par organisation</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase bg-slate-50">
                      <th className="px-6 py-4">Organisation</th>
                      <th className="px-6 py-4">Formule Active</th>
                      <th className="px-6 py-4">Tarif</th>
                      <th className="px-6 py-4">État de facturation</th>
                      <th className="px-6 py-4">Date de renouvellement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {organizations.map(org => {
                      const plan = subscriptionPlans.find(p => p.id === org.subscriptionPlanId);
                      return (
                        <tr key={org.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-900">{org.name}</td>
                          <td className="px-6 py-4">{plan ? plan.name : '—'}</td>
                          <td className="px-6 py-4 font-bold text-brand-primary">{plan ? formatFCFA(plan.priceFcfa) : '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              org.subscriptionStatus === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}>
                              {org.subscriptionStatus || 'Inconnu'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {org.subscriptionEndDate ? new Date(org.subscriptionEndDate).toLocaleDateString('fr-FR') : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------- 3. GESTION DES ORGANISATIONS TAB ---------------- */}
        {activeTab === 'organizations' && (
          <div className="space-y-6">
            
            {/* Search Filter bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une imprimerie par nom ou email..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 transition"
                />
              </div>
            </div>

            {/* Organizations Grid Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase bg-slate-50">
                      <th className="px-6 py-4">Nom de l'Imprimerie</th>
                      <th className="px-6 py-4">Coordonnées</th>
                      <th className="px-6 py-4">Administrateur en chef</th>
                      <th className="px-6 py-4">Formule active</th>
                      <th className="px-6 py-4">État</th>
                      <th className="px-6 py-4 text-center">Actions de contrôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOrgs.length > 0 ? (
                      filteredOrgs.map((org) => {
                        const adminProfile = profiles.find(p => p.organizationId === org.id && p.role === 'admin');
                        const plan = subscriptionPlans.find(p => p.id === org.subscriptionPlanId);
                        
                        return (
                          <tr key={org.id} className="hover:bg-slate-50/50">
                            {/* Org Name */}
                            <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                              {org.name}
                            </td>

                            {/* Contact Details */}
                            <td className="px-6 py-4 whitespace-nowrap space-y-1">
                              <p className="text-slate-800 text-xs">{org.email || '—'}</p>
                              <p className="text-slate-500 text-[10px]">{org.phone || '—'}</p>
                            </td>

                            {/* Admin Profile */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {adminProfile ? (
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-800">{adminProfile.fullName}</p>
                                  <p className="text-[10px] text-slate-500">{adminProfile.email}</p>
                                </div>
                              ) : (
                                <span className="text-rose-600 font-semibold flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>Aucun Admin</span>
                                </span>
                              )}
                            </td>

                            {/* Plan */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-slate-700">{plan ? plan.name : '—'}</span>
                            </td>

                            {/* State */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                org.isActive 
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              }`}>
                                {org.isActive ? 'Actif' : 'Suspendu'}
                              </span>
                            </td>

                            {/* Action toggle */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => {
                                  toggleOrganizationActive(org.id);
                                  triggerToast(`Statut de "${org.name}" modifié.`);
                                }}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition flex items-center gap-1 mx-auto border ${
                                  org.isActive 
                                    ? 'bg-rose-500/10 text-rose-650 border-rose-500/20 hover:bg-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                                }`}
                              >
                                <Power className="w-3 h-3" />
                                <span>{org.isActive ? 'Suspendre' : 'Réactiver'}</span>
                              </button>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          Aucune organisation trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------- 4. GABARITS & TEMPLATES TAB ---------------- */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            
            {/* Visual list of Invoice templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Template Card Modern */}
              <div className="bg-white border-2 border-brand-primary/30 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-4 hover:border-brand-primary transition shadow-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded font-bold uppercase">Modern Neon</span>
                    <span className="text-[10px] text-slate-400 font-medium">Recommandé</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">Gabarit Néon Moderne</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Design futuriste haut de gamme avec bordure supérieure verte néon ou accents personnalisables.</p>
                </div>
                <div className="h-28 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-semibold uppercase">
                  Aperçu moderne
                </div>
              </div>

              {/* Template Card Tech */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-4 hover:border-brand-primary/30 transition shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 px-2 py-0.5 rounded font-bold uppercase">Cyber Grid</span>
                  <h4 className="text-sm font-extrabold text-slate-900">Gabarit Cyber Grid</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">Bordure noire renforcée, grilles de données contrastées adaptées aux factures industrielles.</p>
                </div>
                <div className="h-28 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-semibold uppercase">
                  Aperçu cyber grid
                </div>
              </div>

              {/* Template Card Classic */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden p-6 flex flex-col justify-between space-y-4 hover:border-brand-primary/30 transition shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-bold uppercase">Classic Solid</span>
                  <h4 className="text-sm font-extrabold text-slate-900">Gabarit Classique Épuré</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">En-tête de page sous forme de bandeau gris plein. Sobriété administrative traditionnelle.</p>
                </div>
                <div className="h-28 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-semibold uppercase">
                  Aperçu classique
                </div>
              </div>

            </div>

            {/* List of custom added templates */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Autres templates enregistrés</h3>
              {availableTemplates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
                  {availableTemplates.map(t => (
                    <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                      <p className="text-xs font-bold text-slate-900">{t.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">ID: {t.id}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Aucun modèle supplémentaire mis en ligne.</p>
              )}
            </div>

          </div>
        )}

        {/* ---------------- 5. JOURNAL D'ACTIVITÉS TAB ---------------- */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Log filter */}
            <div className="flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
              <Search className="w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une opération dans l'audit par mot clé..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary placeholder:text-slate-400 transition"
              />
            </div>

            {/* Log list flow - Append-only */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-800">
              <div className="flow-root">
                <ul className="-mb-8">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                      <li key={log.id}>
                        <div className="relative pb-8">
                          {idx !== filteredLogs.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-slate-55 border border-slate-200 flex items-center justify-center text-brand-primary">
                                <Clock className="w-4 h-4" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs text-slate-700">
                                  {log.action}{' '}
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-bold uppercase ml-2 border border-slate-200">
                                    {log.organizationId}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right text-[10px] whitespace-nowrap text-slate-500">
                                {new Date(log.occurredAt).toLocaleString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 py-6 text-center">Aucune trace dans le journal d'activité d'audit.</p>
                  )}
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* ---------------- 6. THEMES COMING SOON TAB ---------------- */}
        {activeTab === 'themes' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm text-center max-w-xl mx-auto animate-fade-in text-slate-800">
            <Globe className="w-12 h-12 text-brand-primary mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 font-black">Personnalisation des Thèmes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              La personnalisation graphique de la plateforme (couleurs de marque, polices et habillages de formulaires) sera disponible dans une prochaine version.
            </p>
            <span className="inline-block px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase">
              Bientôt disponible
            </span>
          </div>
        )}

        {/* ---------------- 7. PROFIL & OPÉRATEURS TAB ---------------- */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Info Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-brand-primary" />
                  <span>Mes Informations Opérateur</span>
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  triggerToast("Informations de l'opérateur mises à jour avec succès.");
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nom Complet</label>
                    <input
                      type="text"
                      defaultValue="Root Administrateur"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Adresse E-mail</label>
                    <input
                      type="email"
                      defaultValue="superadmin@printflow.io"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                      disabled
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Modifier le mot de passe</label>
                    <input
                      type="password"
                      placeholder="Nouveau mot de passe"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary/95 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                </form>
              </div>

              {/* Add Super Admin Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-brand-primary" />
                  <span>Ajouter un Super Administrateur</span>
                </h3>
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newSaFullName || !newSaEmail) {
                    alert("Veuillez renseigner le nom et l'email.");
                    return;
                  }
                  const res = await addSuperAdmin({
                    fullName: newSaFullName,
                    email: newSaEmail,
                    password: newSaPassword
                  });
                  if (res.success) {
                    triggerToast(`Super Admin "${newSaFullName}" créé.`);
                    setNewSaFullName('');
                    setNewSaEmail('');
                    setNewSaPassword('RootAccess#2026');
                  } else {
                    alert(res.error || "Une erreur est survenue.");
                  }
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nom Complet *</label>
                    <input
                      type="text"
                      value={newSaFullName}
                      onChange={(e) => setNewSaFullName(e.target.value)}
                      placeholder="ex: Jean Dupond"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Adresse E-mail *</label>
                    <input
                      type="email"
                      value={newSaEmail}
                      onChange={(e) => setNewSaEmail(e.target.value)}
                      placeholder="operator@printflow.io"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Mot de passe *</label>
                    <input
                      type="password"
                      value={newSaPassword}
                      onChange={(e) => setNewSaPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Créer le compte Super Admin
                  </button>
                </form>
              </div>

            </div>

            {/* List of Super Admins */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm text-slate-850">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Opérateurs Super Admin</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 tracking-wider">
                      <th className="px-6 py-3 whitespace-nowrap">Nom complet</th>
                      <th className="px-6 py-3 whitespace-nowrap">Adresse e-mail</th>
                      <th className="px-6 py-3 whitespace-nowrap">Date de création</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {superadmins.map((sa) => (
                      <tr key={sa.id} className="hover:bg-slate-100/50 transition">
                        <td className="px-6 py-3.5 font-bold text-slate-800">{sa.fullName}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-600">{sa.email}</td>
                        <td className="px-6 py-3.5 text-slate-500">
                          {new Date(sa.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ---------------- CREATE ORG MODAL ---------------- */}
      {isOrgModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-premium overflow-hidden transform scale-100 transition duration-300 text-slate-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Créer une Imprimerie Tenancière
              </h3>
              <button 
                onClick={() => setIsOrgModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-550 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOrg} className="p-6 space-y-4">
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">1. Informations de l'Imprimerie</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nom *</label>
                    <input
                      type="text"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="ex: Sahel Imprimerie"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail *</label>
                    <input
                      type="email"
                      value={newOrgEmail}
                      onChange={(e) => setNewOrgEmail(e.target.value)}
                      placeholder="contact@sahel.com"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone</label>
                    <input
                      type="text"
                      value={newOrgPhone}
                      onChange={(e) => setNewOrgPhone(e.target.value)}
                      placeholder="+221 77..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Adresse</label>
                    <input
                      type="text"
                      value={newOrgAddress}
                      onChange={(e) => setNewOrgAddress(e.target.value)}
                      placeholder="Adresse physique..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Formule d'Abonnement Initiale</label>
                  <Dropdown
                    options={subscriptionPlans.map(p => ({ value: p.id, label: `${p.name} - ${formatFCFA(p.priceFcfa)}` }))}
                    value={newOrgPlanId}
                    onChange={(val) => setNewOrgPlanId(val)}
                  />
                </div>

                <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider pt-2 border-t border-slate-100">2. Création du compte Administrateur principal</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nom Complet *</label>
                    <input
                      type="text"
                      value={adminFullName}
                      onChange={(e) => setAdminFullName(e.target.value)}
                      placeholder="ex: Ousmane Ndiaye"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Adresse e-mail admin *</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="o.ndiaye@sahel.com"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Mot de passe de connexion initial *</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Saisissez ou générez"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono font-semibold"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOrgModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrg}
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-60 disabled:cursor-wait"
                >
                  {isCreatingOrg ? 'Création en cours...' : "Enregistrer et Générer l'Admin"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------- CREATE/EDIT PLAN MODAL ---------------- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 text-slate-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {selectedPlan ? 'Modifier la Formule' : 'Créer une Formule'}
              </h3>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-550 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nom du plan *</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="ex: Formule Standard"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Prix (FCFA) *</label>
                  <input
                    type="number"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Cycle de facturation *</label>
                  <Dropdown
                    options={[
                      { value: 'monthly', label: 'Mensuel' },
                      { value: '6_months', label: '6 mois' },
                      { value: '12_months', label: '12 mois / Annuel' }
                    ]}
                    value={planCycle}
                    onChange={(val) => setPlanCycle(val as any)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Description & Fonctionnalités</label>
                  <textarea
                    rows={2.5}
                    value={planDesc}
                    onChange={(e) => setPlanDesc(e.target.value)}
                    placeholder="ex: Idéal pour les petites imprimeries..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  Enregistrer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------- ASSIGN SUBSCRIPTION PLAN MODAL ---------------- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 text-slate-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Attribuer Manuellement un Plan
              </h3>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-550 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAssignSub} className="p-6 space-y-4">
              
              <div className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Sélectionner l'Imprimerie *</label>
                  <Dropdown
                    options={organizations.map(o => ({ value: o.id, label: o.name }))}
                    value={assignOrgId}
                    onChange={(val) => setAssignOrgId(val)}
                    placeholder="Choisir l'organisation..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Sélectionner la Formule *</label>
                  <Dropdown
                    options={subscriptionPlans.map(p => ({ value: p.id, label: p.name }))}
                    value={assignPlanId}
                    onChange={(val) => setAssignPlanId(val)}
                    placeholder="Choisir le plan..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">État de facturation *</label>
                  <Dropdown
                    options={[
                      { value: 'active', label: 'Actif (Payé)' },
                      { value: 'suspended', label: 'Suspendu (Impayé)' }
                    ]}
                    value={assignStatus}
                    onChange={(val) => setAssignStatus(val as any)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Durée de validité (en mois) *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={assignMonthsDuration}
                    onChange={(e) => setAssignMonthsDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary font-bold"
                    required
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  Attribuer l'abonnement
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------- CREATE TEMPLATE MODAL ---------------- */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 text-slate-800">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Ajouter un Gabarit Graphique
              </h3>
              <button 
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-550 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTemplate} className="p-6 space-y-4">
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Identifiant du modèle *</label>
                  <input
                    type="text"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    placeholder="ex: modern_neon"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Nom du gabarit *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="ex: Gabarit Moderne Orange"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    required
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  Publier
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
