'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Layers,
  Globe,
  Users,
  Check,
  Star,
  Play,
  Building2,
  TrendingUp,
  Clock,
  CreditCard,
  Lock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Send,
  Zap,
  HelpCircle,
  BarChart3,
  Package,
  XCircle,
  FileCheck,
  Calculator,
  Laptop
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Interactive Live Simulator State inside Hero Mockup
  const [simQuantity, setSimQuantity] = useState(5000);
  const [simUnitPrice, setSimUnitPrice] = useState(60);
  const [activeTab, setActiveTab] = useState<'devis' | 'bat' | 'facture'>('devis');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculations for live simulator
  const simSubtotal = simQuantity * simUnitPrice;
  const simVat = Math.round(simSubtotal * 0.18);
  const simTotal = simSubtotal + simVat;

  // Animation on scroll observer effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const faqs = [
    {
      q: "Est-ce que PrintFlow est adapté à la TVA 18% en vigueur en Afrique francophone ?",
      a: "Oui, à 100%. PrintFlow intègre le calcul automatique de la TVA 18% sur l'ensemble de vos devis et factures. Vous pouvez également ajuster les taux de taxe selon les exonérations ou spécificités de votre pays."
    },
    {
      q: "Puis-je exporter mes documents au format PDF A4 officiel ?",
      a: "Absolument. En un clic, vous pouvez visualiser, imprimer et télécharger directement vos Devis, Factures, Bons de Commande d'Atelier et Bons de Livraison au format A4 avec le logo et les coordonnées de votre imprimerie."
    },
    {
      q: "Comment fonctionne la validation des Bon à Tirer (BAT) ?",
      a: "Vous pouvez importer les fichiers d'impression de vos clients (jusqu'à 500 Mo en archive .ZIP). Votre client consulte le BAT en ligne et valide. Une fois validé, la commande est verrouillée et transmise à l'atelier."
    },
    {
      q: "Quelles devises sont prises en compte ?",
      a: "Par défaut, PrintFlow est configuré en FCFA (XOF / XAF). Vous pouvez également basculer instantanément l'affichage en Euro (€), Dollar ($), Dirham Marocain (MAD) ou Franc Guinéen (GNF)."
    },
    {
      q: "Y a-t-il un engagement de durée ?",
      a: "Aucun engagement. Vous pouvez utiliser le plan gratuit pendant 7 jours sans carte bancaire, puis choisir de vous abonner au plan Pro mensuellement ou annuellement avec une réduction de 20%."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans selection:bg-brand-primary/20 selection:text-brand-primary overflow-x-hidden relative">
      
      {/* BACKGROUND CINEMATIC LIGHTING MESH GLOWS (UI/UX Pro Max) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] opacity-40 blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(0, 176, 96, 0.35) 0%, rgba(99, 102, 241, 0.18) 45%, transparent 70%)'
          }}
        />
        <div 
          className="absolute top-[45%] right-[-15%] w-[700px] h-[700px] opacity-25 blur-[160px]"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, rgba(0, 176, 96, 0.2) 50%, transparent 70%)'
          }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] opacity-20 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)'
          }}
        />
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#090D16]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-9 h-9 object-contain rounded-xl shadow-lg group-hover:scale-105 transition" />
            <span className="text-xl font-black tracking-tight text-white">
              Print<span className="text-brand-primary">_Flow</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#problemes" className="hover:text-brand-primary transition">Problèmes</a>
            <a href="#bento-features" className="hover:text-brand-primary transition">Fonctionnalités</a>
            <a href="#comparatif" className="hover:text-brand-primary transition">Comparatif</a>
            <a href="#comment-ca-marche" className="hover:text-brand-primary transition">Comment ça marche</a>
            <a href="#temoignages" className="hover:text-brand-primary transition">Témoignages</a>
            <a href="#tarification" className="hover:text-brand-primary transition">Tarification</a>
            <a href="#faq" className="hover:text-brand-primary transition">FAQ</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition hover:scale-105 flex items-center gap-2 cursor-pointer"
              >
                <span>Accéder au Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Se connecter
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition hover:scale-105 flex items-center gap-2 cursor-pointer"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-14 pb-20 lg:pt-24 lg:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-brand-primary text-xs font-bold shadow-lg shadow-emerald-950/50 backdrop-blur-md animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>SaaS N°1 de Facturation & Atelier d'Imprimerie en Afrique francophone</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Gérez vos Devis, BAT & Factures FCFA <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400">
              avec la précision d'une grande imprimerie.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Conçu spécialement pour les imprimeries du Sénégal, Côte d'Ivoire, Gabon et d'Afrique francophone. Calcul automatique de la TVA 18%, validation des BAT et fiches d'atelier en 1 clic.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-bold shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Démarrer l'Essai Gratuit (7 jours)</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            <a
              href="#live-simulator"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-white hover:text-brand-primary text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer backdrop-blur-md"
            >
              <Play className="w-4 h-4 text-brand-primary fill-brand-primary" />
              <span>Tester le Simulateur en Direct</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Aucun engagement bancaire
            </span>
            <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Configuration en 60 secondes
            </span>
            <span className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Support local WhatsApp 7j/7
            </span>
          </div>

          {/* INTERACTIVE LIVE APP SIMULATOR MOCKUP (TailAdmin / UI UX Pro Max) */}
          <div id="live-simulator" className="pt-10 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-[#101726]/90 border border-slate-800 shadow-2xl p-5 sm:p-8 space-y-6 text-left relative overflow-hidden backdrop-blur-xl">
              
              {/* Top App Chrome Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 pl-2">app.printflow.io/devis-simulator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-brand-primary text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-ping" />
                    Mode Interactif • Afrique Francophone FCFA
                  </span>
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Mensuel</p>
                  <p className="text-2xl font-black text-white">{formatFCFA(18450000)}</p>
                  <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 pt-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +28% vs mois précédent
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Devis Validés ce mois</p>
                  <p className="text-2xl font-black text-brand-primary">48 Devis</p>
                  <p className="text-[11px] font-semibold text-slate-400 pt-1">TVA 18% : {formatFCFA(3321000)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taux de Conformation BAT</p>
                  <p className="text-2xl font-black text-cyan-400">99.2%</p>
                  <p className="text-[11px] font-semibold text-slate-400 pt-1">Zéro tirage gâché en atelier</p>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('devis')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${activeTab === 'devis' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <Calculator className="w-4 h-4" />
                    <span>1. Simuler un Devis FCFA en Direct</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('bat')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${activeTab === 'bat' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>2. Validation BAT Fichier (.ZIP)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('facture')}
                    className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${activeTab === 'facture' ? 'bg-brand-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>3. Facturation A4 & Reçu Acompte</span>
                  </button>
                </div>

                {/* Tab Content 1: Live Interactive Devis Simulator */}
                {activeTab === 'devis' && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-bold border-b border-slate-800 pb-3">
                      <span className="text-white text-sm">Devis Interactif N° DEV-2026-099 • Client: ORANGE SÉNÉGAL</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-brand-primary border border-emerald-500/20 text-[11px] w-fit">
                        TVA 18% Calculée en Temps Réel
                      </span>
                    </div>

                    {/* Quantity & Unit price sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#080C14] border border-slate-800">
                      <div className="space-y-2">
                        <label className="text-slate-400 font-bold flex justify-between">
                          <span>Quantité de Flyers A5 (Exemplaires) :</span>
                          <span className="text-brand-primary font-black text-sm">{simQuantity.toLocaleString()} ex.</span>
                        </label>
                        <input
                          type="range"
                          min={1000}
                          max={50000}
                          step={1000}
                          value={simQuantity}
                          onChange={(e) => setSimQuantity(Number(e.target.value))}
                          className="w-full accent-brand-primary cursor-pointer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-slate-400 font-bold flex justify-between">
                          <span>Prix Unitaire HT par ex. :</span>
                          <span className="text-brand-primary font-black text-sm">{simUnitPrice} FCFA</span>
                        </label>
                        <input
                          type="range"
                          min={20}
                          max={200}
                          step={5}
                          value={simUnitPrice}
                          onChange={(e) => setSimUnitPrice(Number(e.target.value))}
                          className="w-full accent-brand-primary cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Results table */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                        <span>Montant Total Hors Taxe (HT) :</span>
                        <span className="font-bold text-white text-sm">{formatFCFA(simSubtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
                        <span>Taxe sur la Valeur Ajoutée (TVA 18%) :</span>
                        <span className="font-bold text-amber-400 text-sm">{formatFCFA(simVat)}</span>
                      </div>
                      <div className="flex justify-between py-3 font-black text-base text-white bg-brand-primary/10 p-3 rounded-xl border border-brand-primary/30">
                        <span>TOTAL TOUTES TAXES COMPRISES (TTC) :</span>
                        <span className="text-brand-primary">{formatFCFA(simTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: BAT */}
                {activeTab === 'bat' && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
                    <div className="flex justify-between items-center font-bold border-b border-slate-800 pb-3">
                      <span className="text-white text-sm">BAT Bon à Tirer • Fichier_Catalogue_2026_HD.zip (128 Mo)</span>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px]">
                        Verrouillé & Confirmé par Client
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed bg-[#080C14] p-3 rounded-xl border border-slate-800">
                      "BAT approuvé électroniquement par le Directeur Marketing. Bon pour tirage Offset 10 000 ex. Quadrichromie sur couche 170g."
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sécurité Impression : Fichier verrouillé contre toute modification ultérieure.</span>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Facture */}
                {activeTab === 'facture' && (
                  <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
                    <div className="flex justify-between items-center font-bold border-b border-slate-800 pb-3">
                      <span className="text-white text-sm">Facture N° FAC-2026-104 • SOCIÉTÉ GÉNÉRALE C.I.</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
                        Facture Solde • Payée par Virement
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-slate-300 bg-[#080C14] p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="text-slate-500 uppercase font-bold text-[10px]">Acompte Perçu (50%)</p>
                        <p className="font-bold text-white text-sm">{formatFCFA(simTotal / 2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 uppercase font-bold text-[10px]">Reste à Solde</p>
                        <p className="font-bold text-emerald-400 text-sm">0 FCFA (Soldé)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION PROBLÈME vs SOLUTION (UI/UX Pro Max Comparison Matrix) */}
      <section id="problemes" className="py-24 bg-[#090D16] border-y border-slate-800/80 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              Le Défi des Imprimeries
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pourquoi les méthodes traditionnelles freinent votre rentabilité ?
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Découvrez la différence nette entre la gestion manuelle vulnérable aux erreurs et l'automatisation avec PrintFlow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Without PrintFlow */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-rose-900/40 space-y-6">
              <div className="flex items-center gap-3 border-b border-rose-900/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Sans PrintFlow (Gestion Manuelle)</h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Factures Word/Excel non professionnelles</strong> qui dévalorisent l'image de votre imprimerie auprès des grandes entreprises.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Erreurs de calcul sur la TVA 18%</strong> causant des redressements ou des décalages de trésorerie inattendus.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Litiges sur les fichiers d'impression</strong> sans preuve formelle de validation du BAT par le client.</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Acomptes oubliés et imprayés</strong> car le suivi des règlements est dispersé sur des cahiers ou notes volantes.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: With PrintFlow */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-[#0A1220] border border-emerald-500/40 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 border-b border-emerald-500/30 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold shadow-md">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Avec PrintFlow (Modernisation Totale)</h3>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-emerald-100">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span><strong>Documents A4 corporate en 1 clic</strong> (Devis, Factures, Bons de Livraison) personnalisés à vos couleurs et logo.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span><strong>TVA 18% exacte et automatique</strong> avec gestion multi-devises (FCFA, EUR, USD, MAD, GNF).</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span><strong>BAT verrouillé électroniquement</strong> empêchant les erreurs coûteuses d'impression en atelier.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <span><strong>Suivi rigoureux des encaisses & acomptes</strong> avec notifications automatiques et relances intégrées.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* BENTO BOX FEATURES SECTION (UI/UX Pro Max Bento Grid) */}
      <section id="bento-features" className="py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-primary text-xs font-bold">
              Architecture & Fonctionnalités
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Une plateforme complète conçue pour l'atelier et la direction
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Découvrez les modules puissants qui simplifient chaque étape de la chaîne d'impression.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Card 1 (Large - Span 2) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-6 shadow-xl hover:border-brand-primary/40 transition duration-300 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Devis & Facturation FCFA (TVA 18% Intégrée)</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Créez des devis complexes en quelques secondes : choix du papier, grammage, formats additionnels et finitions. Calcul automatique du montant HT, TVA 18% et TTC avec export PDF A4 instantané.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
                <span>Calculateur HT + TVA 18% + TTC</span>
                <span className="px-2 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold">Export A4 Imprimable</span>
              </div>
            </div>

            {/* Bento Card 2 (Tall - Span 1) */}
            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-6 shadow-xl hover:border-cyan-500/40 transition duration-300 relative group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Validation BAT (.ZIP 500 Mo)</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Téléversez les épreuves d'impression. Le client valide son Bon à Tirer directement en ligne avec horodatage et verrouillage sécurisé de la commande.
                </p>
              </div>
              <div className="pt-2 text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> <span>Protection anti-erreur d'impression</span>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-6 shadow-xl hover:border-amber-500/40 transition duration-300 relative group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Fiches d'Atelier Confidentielles</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Transmettez les instructions de tirage aux techniciens de machines (Offset, Numérique, Sérigraphie) sans divulguer les tarifs commerciaux.
                </p>
              </div>
            </div>

            {/* Bento Card 4 (Large - Span 2) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-6 shadow-xl hover:border-emerald-500/40 transition duration-300 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-brand-primary flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Boutique en Ligne & Catalogue Public 24/7</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Offrez à votre imprimerie une vitrine web sur-mesure. Vos clients parcourent vos formats de papier, choisisent leurs quantités et vous envoient leurs demandes directement convertibles en devis.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>URL publique dédiée : printflow.app/catalogue/votre-imprimerie</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-brand-primary font-bold">Convertible en Devis</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="py-24 bg-[#090D16] border-y border-slate-800/80 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              Prise en Main Immédiate
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Opérationnel en 3 étapes simples
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Aucune formation technique requise. Votre imprimerie est prête en 60 secondes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-5 relative">
              <span className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-600/30">1</span>
              <h3 className="text-xl font-bold text-white">1. Configurez votre Imprimerie</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Créez votre compte gratuit. Saisissez votre logo, votre adresse et vos tarifs habituels pour les papiers et supports.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-5 relative">
              <span className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-600/30">2</span>
              <h3 className="text-xl font-bold text-white">2. Générez vos Devis & BAT</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Calculez les montants HT et TVA 18% en un clic. Faites valider le Bon à Tirer par le client avant le tirage en atelier.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-5 relative">
              <span className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-600/30">3</span>
              <h3 className="text-xl font-bold text-white">3. Livrez & Encaissez en FCFA</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dès la livraison effectuée, la facture A4 est générée automatiquement. Suivez vos acomptes et règlements en temps réel.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION TÉMOIGNAGES */}
      <section id="temoignages" className="py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-primary text-xs font-bold">
              Preuve Sociale & Avis
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Reconnu par les gérants d'imprimerie en Afrique francophone
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Découvrez les retours d'expérience authentiques de nos utilisateurs au Sénégal, en Côte d'Ivoire et au Gabon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-5 shadow-xl hover:border-brand-primary/40 transition">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "PrintFlow a totalement réinventé la gestion de notre atelier à Dakar. Nos devis sont validés 2x plus vite et le calcul automatique de la TVA 18% nous fait gagner un temps précieux lors des bilans."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-sm shadow-md">
                  MN
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Mamadou Ndiaye</h4>
                  <p className="text-[11px] text-slate-400">Directeur, Sud Print • Dakar, Sénégal 🇸🇳</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-5 shadow-xl hover:border-cyan-500/40 transition">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "Le verrouillage électronique des BAT nous a épargné plusieurs ré-impressions coûteuses à Abidjan. Les fiches d'atelier sont claires et nos clients apprécient le rendu des factures."
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  KK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Kouassi Konan</h4>
                  <p className="text-[11px] text-slate-400">Fondateur, Ivoire Impression • Abidjan 🇨🇮</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-3xl bg-[#101726] border border-slate-800 space-y-5 shadow-xl hover:border-emerald-500/40 transition">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "Grâce au catalogue public inclus dans le plan Pro, nous recevons régulièrement des demandes de devis d'entreprises locales à Libreville. C'est le SaaS idéal !"
              </p>
              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                  SO
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Stéphanie Ondo</h4>
                  <p className="text-[11px] text-slate-400">Gérante, Libreville Graphique • Gabon 🇬🇦</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION TARIFICATION */}
      <section id="tarification" className="py-24 bg-[#090D16] border-y border-slate-800/80 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-brand-primary text-xs font-bold">
              Tarification Transparente
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Des formules adaptées à votre croissance
            </h2>
            <p className="text-base text-slate-400 leading-relaxed">
              Démarrez gratuitement sans carte bancaire, puis évoluez vers notre formule Pro illimitée.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-xs font-bold cursor-pointer ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`} onClick={() => setBillingCycle('monthly')}>
                Paiement Mensuel
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 rounded-full bg-slate-800 p-1 relative transition cursor-pointer border border-slate-700"
              >
                <div className={`w-5 h-5 rounded-full bg-brand-primary transition-transform ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <span className={`text-xs font-bold cursor-pointer ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`} onClick={() => setBillingCycle('yearly')}>
                Paiement Annuel <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-brand-primary font-bold border border-emerald-500/30">-20% Réduction</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Plan Gratuit */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#101726] border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Plan Découverte</h3>
                  <p className="text-xs text-slate-400">Idéal pour tester l'application en conditions réelles.</p>
                </div>

                <div className="py-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">0 FCFA</span>
                  <span className="text-xs text-slate-400 font-semibold"> / 7 jours d'essai</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 font-medium pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>1 Compte Administrateur</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Émission de Devis & Factures FCFA</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Calcul automatique de la TVA (18%)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Export PDF A4 standard</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-3.5 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold transition text-center cursor-pointer"
              >
                Démarrer l'Essai Gratuit
              </Link>
            </div>

            {/* Plan Pro (Highlighted UI/UX Pro Max) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-emerald-950/80 via-[#0E1726] to-[#0A1220] border-2 border-brand-primary shadow-2xl shadow-emerald-950/80 text-white space-y-6 flex flex-col justify-between relative overflow-hidden">
              
              {/* Highlight Badge */}
              <div className="absolute top-4 right-4 px-3.5 py-1 rounded-full bg-brand-primary text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                Formule Recommandée
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Plan Pro Imprimerie</h3>
                  <p className="text-xs text-emerald-200">Pour les ateliers et imprimeries en activité.</p>
                </div>

                <div className="py-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {billingCycle === 'yearly' ? formatFCFA(20000) : formatFCFA(25000)}
                  </span>
                  <span className="text-xs text-emerald-200 font-semibold"> / mois</span>
                </div>

                <ul className="space-y-3 text-xs text-emerald-100 font-medium pt-2">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span><strong>Utilisateurs illimités</strong> (Admin, Commercial, Chef d'atelier)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span><strong>Validation BAT Fichiers (.ZIP 500 Mo)</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span><strong>Boutique en ligne & Catalogue public 24/7</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span><strong>Fiches d'atelier & Bons de Commande</strong> confidentiels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Support client prioritaire sur WhatsApp</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-4 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition text-center shadow-lg shadow-emerald-600/40 hover:scale-[1.02] cursor-pointer"
              >
                Passer au Plan Pro
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION FAQ ACCORDION */}
      <section id="faq" className="py-24 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-4">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
              Foire Aux Questions
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Questions Fréquentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-2xl bg-[#101726] border border-slate-800 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left text-sm font-bold text-white flex justify-between items-center gap-4 cursor-pointer hover:text-brand-primary transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-brand-primary' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION CTA FINAL */}
      <section className="py-24 z-10 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 text-white space-y-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Prêt à moderniser la gestion de votre imprimerie ?
            </h2>
            <p className="text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Rejoignez des centaines d'entrepreneurs africains qui font confiance à PrintFlow pour leurs devis, BAT et factures.
            </p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-white text-emerald-950 hover:bg-emerald-50 text-sm font-black transition shadow-xl hover:scale-105 cursor-pointer"
              >
                <span>Commencer gratuitement (Essai 7 jours)</span>
                <ArrowRight className="w-4.5 h-4.5 text-emerald-950" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#05080E] border-t border-slate-800/80 py-14 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <img src="/Favicon_PrintFlow.png" alt="Print_Flow" className="w-8 h-8 object-contain rounded-lg" />
              <span className="text-lg font-black text-white">
                Print<span className="text-brand-primary">_Flow</span>
              </span>
            </Link>

            <nav className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-400">
              <a href="#problemes" className="hover:text-brand-primary transition">Problèmes</a>
              <a href="#bento-features" className="hover:text-brand-primary transition">Fonctionnalités</a>
              <a href="#comparatif" className="hover:text-brand-primary transition">Comparatif</a>
              <a href="#comment-ca-marche" className="hover:text-brand-primary transition">Comment ça marche</a>
              <a href="#temoignages" className="hover:text-brand-primary transition">Témoignages</a>
              <a href="#tarification" className="hover:text-brand-primary transition">Tarification</a>
              <Link href="/login" className="hover:text-brand-primary transition">Connexion</Link>
            </nav>
          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <span>© 2026 Print_Flow. Tous droits réservés.</span>
            <span className="font-bold text-slate-300 flex items-center gap-1">
              Fait avec fierté en Afrique 🌍
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
