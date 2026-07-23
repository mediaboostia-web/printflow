'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  Layers,
  Users,
  Check,
  Building2,
  TrendingUp,
  Clock,
  CreditCard,
  Lock,
  ChevronRight,
  HelpCircle,
  BarChart3,
  Package,
  FileCheck,
  Calculator,
  Play,
  X,
  AlertTriangle,
  ChevronLeft,
  PhoneCall,
  Plus,
  Minus,
  Workflow,
  Receipt,
  Store,
  Sparkles,
  Zap,
  Activity,
  FileX,
  TrendingDown,
  UserX,
  UserCheck,
  Eye,
  Shield
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  // Testimonials Carousel state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Accordion state for FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const testimonials = [
    {
      name: "Amadou Diallo",
      role: "Directeur Général",
      company: "Sud Print Imprimerie (Dakar, Sénégal)",
      image: "/Temoignage.jpg",
      quote: "Grâce au verrou BAT obligatoire de Print_Flow, nous avons éliminé 100% des réimpressions dues aux erreurs de fichier client. Chaque tirage lancé est validé d'avance."
    },
    {
      name: "Ibrahima Sow",
      role: "Gérant d'Atelier",
      company: "Repro Express (Bamako, Mali)",
      image: "/Temoignage (2).jpg",
      quote: "Le suivi des acomptes et la déduction automatique du reste à payer sur les factures finales nous ont permis de sécuriser notre trésorerie sans aucune contestation."
    },
    {
      name: "Marc Ouattara",
      role: "Chef de Production",
      company: "Imprimerie du Golfe (Abidjan, Côte d'Ivoire)",
      image: "/Temoignage3.jpg",
      quote: "Les fiches de production d'atelier sont parfaites : les opérateurs ont toutes les consignes exactes sans voir les marges ni la confidentialité des tarifs."
    }
  ];

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 7 jours ?",
      a: "Vous bénéficiez d'un accès immédiat à toutes les fonctionnalités principales de Print_Flow pour 1 utilisateur sans engagement et sans carte bancaire."
    },
    {
      q: "Est-ce adapté à la monnaie locale et aux taxes de notre imprimerie ?",
      a: "Absolument. Print_Flow est nativement configuré pour la monnaie FCFA avec calcul automatique de la TVA personnalisable selon le taux propre à votre établissement."
    },
    {
      q: "Comment l'acompte versé est-il déduit sur la facture ?",
      a: "Lorsqu'un acompte est enregistré sur le bon de commande, il est automatiquement reporté sur la facture finale et déduit du montant Total TTC pour afficher le Solde Dû exact."
    },
    {
      q: "Puis-je passer à la Formule Pro plus tard ?",
      a: "Oui, à tout moment depuis votre tableau de bord. La Formule Pro débloque les utilisateurs illimités, la boutique en ligne et l'historique d'audit."
    },
    {
      q: "Mes données d'imprimerie sont-elles sécurisées ?",
      a: "Chaque organisation dispose d'un accès isolé protégé par le protocole Supabase Row Level Security (RLS) et chiffrement SSL 256-bit."
    }
  ];

  // Schema.org JSON-LD for Programmatic SEO
  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Print_Flow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "14900",
      "priceCurrency": "XAF",
      "priceValidUntil": "2027-12-31"
    },
    "description": "Logiciel de gestion et facturation pour imprimeries et ateliers de reprographie en Afrique francophone. Devis, BAT, Bons de Commande, Livraisons et Encaissements."
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#090D16] text-text-main font-sans selection:bg-brand-primary selection:text-white">
      {/* Programmatic SEO JSON-LD Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
      />

      {/* Main Outer Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-20">
        
        {/* Top Header Navbar Card */}
        <header className="bg-bg-card border border-border-subtle rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-4 z-50">
          <div className="flex items-center gap-3">
            <img src="/Favicon_PrintFlow.png" alt="Logo Print_Flow" className="w-8 h-8 object-contain rounded-xl shrink-0" />
            <span className="text-xl font-extrabold tracking-tight text-text-main font-sans">
              Print<span className="text-brand-primary">_Flow</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-text-secondary font-sans" aria-label="Navigation principale">
            <a href="#comment-ca-marche" className="hover:text-brand-primary transition">Comment ça marche</a>
            <a href="#solutions" className="hover:text-brand-primary transition">Sérénité Atelier</a>
            <a href="#defis-solution" className="hover:text-brand-primary transition">Défis & Solutions</a>
            <a href="#tarifs" className="hover:text-brand-primary transition">Tarifs</a>
            <a href="#faq" className="hover:text-brand-primary transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 font-sans"
              >
                <span>Mon Espace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-text-main hover:text-brand-primary transition font-sans"
                >
                  Se connecter
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-full transition shadow-xs font-sans hover:scale-[1.03]"
                >
                  Démarrer l'essai
                </Link>
              </>
            )}
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="pt-6 pb-8 text-center space-y-8" aria-label="Présentation Print_Flow">
          
          {/* Centered Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
            <span>Essai gratuit de 7 jours pour votre imprimerie</span>
          </div>

          {/* Centered H1 Headline */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-main tracking-tight leading-[1.1] font-sans">
              Centralisez Devis, BAT & Production en un Seul Endroit
            </h1>

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl mx-auto font-sans">
              Le logiciel conçu spécifiquement pour les imprimeries et ateliers de reprographie en Afrique francophone.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="px-7 py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-full transition shadow-md flex items-center gap-2 font-sans hover:scale-[1.03]"
            >
              <span>Démarrer l'essai gratuit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#comment-ca-marche"
              className="px-6 py-3.5 bg-bg-card hover:bg-input-bg text-text-main border border-border-subtle text-xs font-bold rounded-full transition flex items-center gap-2 shadow-xs hover:scale-[1.02]"
            >
              <Play className="w-3.5 h-3.5 fill-text-main" />
              <span>Comment ça marche</span>
            </a>
          </div>

          {/* SaaS Dashboard Frame Mockup */}
          <div className="pt-6 max-w-5xl mx-auto">
            <div className="bg-bg-card p-2.5 rounded-3xl border border-border-subtle shadow-2xl overflow-hidden transform hover:scale-[1.01] transition duration-500">
              <div className="bg-input-bg rounded-2xl overflow-hidden border border-border-subtle relative">
                <div className="h-8 bg-slate-200/80 dark:bg-slate-800/80 px-4 flex items-center gap-2 border-b border-border-subtle">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-text-secondary mx-auto">Print_Flow SaaS Dashboard — Supervision Atelier</span>
                </div>
                <img
                  src="/Capture d'écran Dashboard.png"
                  alt="Aperçu Tableau de Bord Print_Flow"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>

        </section>

        {/* SECTION: COMMENT ÇA MARCHE (EXACT SCREENSHOT 1 DISPOSITION & HOVER SCALING) */}
        <section id="comment-ca-marche" className="py-10 space-y-8 text-center" aria-label="Comment ça marche">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-extrabold inline-block font-sans border border-brand-primary/20">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">
              De l'Inscription à la Rentabilité — Simplifié.
            </h2>
            <p className="text-xs text-text-secondary max-w-lg mx-auto">
              Notre processus fluide vous aide à inscrire votre atelier, suivre la fabrication et encaisser vos factures sans aucune complexité.
            </p>
          </div>

          {/* 4 Cards Layout matching Screenshot 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-left pt-4">
            
            {/* Card 01 */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.03] transition duration-300 hover:shadow-xl cursor-pointer">
              <div className="space-y-4">
                <span className="text-4xl font-black text-slate-300 dark:text-slate-700 font-sans block">01</span>
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-text-main font-sans">Inscription en 3 clics</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    Créez votre compte en quelques secondes, accédez à votre espace d'impression sans carte bancaire.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 02 (Featured Card - Middle highlighted card with header image as in screenshot 1) */}
            <div className="bg-bg-card border-2 border-brand-primary rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-md hover:scale-[1.03] transition duration-300 hover:shadow-2xl cursor-pointer">
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border-subtle aspect-16/9 bg-slate-100">
                  <img
                    src="/Capture d'écran Dashboard1.png"
                    alt="Créez votre atelier & Partagez le lien"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-text-main font-sans">Créez & Partagez la Boutique</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    Configurez vos tarifs papiers et partagez le lien de votre vitrine web avec vos clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 03 */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.03] transition duration-300 hover:shadow-xl cursor-pointer">
              <div className="space-y-4">
                <span className="text-4xl font-black text-slate-300 dark:text-slate-700 font-sans block">03</span>
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Workflow className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-text-main font-sans">Gérez & Suivez le Flux</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    Traitez vos demandes reçues en direct et suivez chaque dossier étape par étape (Calage, Impression, Façonnage).
                  </p>
                </div>
              </div>
            </div>

            {/* Card 04 */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.03] transition duration-300 hover:shadow-xl cursor-pointer">
              <div className="space-y-4">
                <span className="text-4xl font-black text-slate-300 dark:text-slate-700 font-sans block">04</span>
                <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-text-main font-sans">Facturez & Gérez vos Revenus</h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    Enregistrez les acomptes, éditez les factures finales et suivez le Solde Dû en toute sérénité.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION: SÉRÉNITÉ RETROUVÉE AVEC PRINTFLOW (EXACT SCREENSHOT 2 REPRODUCTION WITH 'SIGN IN ET LOGIN') */}
        <section id="solutions" className="py-10 space-y-8 text-left" aria-label="La Sérénité Retrouvée avec Print_Flow">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Featured Image with Overlay Badge */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-3xl overflow-hidden border border-border-subtle shadow-xl bg-slate-900 aspect-4/5 relative group hover:scale-[1.01] transition duration-500">
                <img
                  src="/Sign in et login .png"
                  alt="Sérénité Atelier Print_Flow"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                {/* Overlapping Floating Badge as in Screenshot 2 */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border-subtle rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/Temoignage.jpg" alt="" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/Temoignage (2).jpg" alt="" />
                    <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/Temoignage3.jpg" alt="" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-main">Rejoignez 50+ imprimeries</p>
                    <p className="text-[10px] text-text-secondary">Traçabilité 100% garantie</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Card Layout as in Screenshot 2 */}
            <div className="lg:col-span-7 bg-bg-card border border-border-subtle rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm text-left">
              <div className="space-y-3">
                <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-extrabold inline-block font-sans">
                  Sérénité Atelier
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans leading-tight">
                  La Sérénité Retrouvée dans votre Imprimerie
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                  Print_Flow n'est pas seulement un outil de facturation, c'est l'espace où la gestion de votre atelier prend tout son sens : traçabilité complète du devis à la livraison, zéro oubli d'acompte et visibilité totale pour vos clients.
                </p>
              </div>

              {/* Action CTA Button */}
              <div>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-full transition shadow-md inline-flex items-center gap-2 font-sans hover:scale-[1.03]"
                >
                  <span>Démarrer l'essai gratuit</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* 2 Sub-cards at Bottom as in Screenshot 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                
                <div className="bg-input-bg border border-border-subtle rounded-2xl p-4 space-y-2 hover:scale-[1.02] transition">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-text-main font-sans">Confidentialité Atelier</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Les fiches de fabrication préservent le secret de vos machines et de vos marges.
                  </p>
                </div>

                <div className="bg-input-bg border border-border-subtle rounded-2xl p-4 space-y-2 hover:scale-[1.02] transition">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-text-main font-sans">Visibilité Client</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Donnez des réponses précises et instantanées à vos clients sur l'avancement exact.
                  </p>
                </div>

              </div>
            </div>

          </div>

        </section>

        {/* SECTION: DÉFIS VS SOLUTIONS (PAIRED CARDS) */}
        <section id="defis-solution" className="py-10 space-y-8 text-left" aria-label="Défis et Solutions Imprimerie">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary font-sans">Résolution de Problèmes</span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">
              Comment les Fonctionnalités Print_Flow Résolvent vos Défis.
            </h2>
            <p className="text-xs text-text-secondary">
              Chaque défi de votre atelier est directement éliminé par une fonctionnalité dédiée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Resolution Pair 1: Devis */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Carnets papier égarés</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Module Devis</span>
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-text-main font-sans">Prise de Devis & Archivage Numérique</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Fini la perte d'historique ou les oublis de prix récurrents. Générez vos devis en PDF A4 instantanément avec calcul automatique de la TVA personnalisable et retrouvez chaque client en 1 clic.
                </p>
              </div>
            </div>

            {/* Resolution Pair 2: Acomptes & Facturation */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Litiges sur les acomptes</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Facturation & Acomptes</span>
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-text-main font-sans">Enregistrement & Déduction Automatique</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Chaque acompte perçu à la commande est verrouillé et déduit du montant Total TTC lors de la livraison. La facture finale affiche clairement le Solde Dû restant, évitant 100% des disputes d'impayés.
                </p>
              </div>
            </div>

            {/* Resolution Pair 3: Verrou BAT */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Gâchis de papier & réimpressions</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Verrou BAT</span>
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-text-main font-sans">Blocage Automatique de Production</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Aucun tirage ne peut démarrer en atelier sans la validation explicite du Bon à Tirer (BAT) par le client. Vous éliminez définitivement le gâchis de papier causé par les fichiers erronés.
                </p>
              </div>
            </div>

            {/* Resolution Pair 4: Suivi de Flux */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 shadow-xs hover:scale-[1.02] hover:border-brand-primary/40 transition duration-300">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DÉFI : Flou sur l'avancement d'atelier</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>RÉSOLU PAR : Supervision de Flux</span>
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-text-main font-sans">Traçabilité & Suivi en Temps Réel</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Suivez en direct le statut exact de chaque tirage (En attente, Sous presse, Façonnage, Prêt) et éditez des fiches de production sans divulguer le nom des machines ni les marges.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION: TARIFS */}
        <section id="tarifs" className="py-10 space-y-8 text-center" aria-label="Tarifs et Abonnements">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-primary font-sans">Transparence Tarifaire</span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">Des Tarifs Clairs et Sans Surprise.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto text-left">
            
            {/* Card 1: DÉMARRAGE */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.01] transition">
              <div className="space-y-4">
                <div className="text-xs font-black text-text-secondary uppercase tracking-wider">DÉMARRAGE</div>
                <p className="text-xs text-text-secondary">Pour tester l'outil gratuitement dans votre atelier.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-text-main font-sans">0</span>
                  <span className="text-xs text-text-secondary">/ 7 jours</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center block font-sans"
                >
                  DÉMARRER L'ESSAI GRATUIT
                </Link>

                <div className="space-y-2 text-xs text-text-secondary pt-4 border-t border-border-subtle">
                  <p className="font-extrabold text-[10px] uppercase text-text-secondary">INCLUS DANS L'ESSAI :</p>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>1 utilisateur unique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Devis & Factures TVA Configurable</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Bons de commande & Fiches atelier</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary/50">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="line-through">Boutique en ligne client</span>
                  </li>
                  <li className="flex items-center gap-2 text-text-secondary/50">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="line-through">Historique d'audit d'impression</span>
                  </li>
                </div>
              </div>
            </div>

            {/* Card 2: FORMULE PRO */}
            <div className="bg-slate-950 text-white border-2 border-brand-primary rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative hover:scale-[1.02] transition">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                LE PLUS POPULAIRE
              </div>

              <div className="space-y-4">
                <div className="text-xs font-black text-brand-primary uppercase tracking-wider">FORMULE PRO</div>
                <p className="text-xs text-slate-400">Pour les imprimeries souhaitant une traçabilité totale.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-sans">{formatFCFA(14900)}</span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition text-center block shadow-md font-sans"
                >
                  SOUSCRIRE À LA FORMULE PRO
                </Link>

                <div className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <p className="font-extrabold text-[10px] uppercase text-brand-primary">TOUT CE QUI EST INCLUS :</p>
                  <li className="flex items-center gap-2 font-bold text-white">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Collaborateurs & Personnel illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Catalogue Public Storefront</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Prise de commandes en ligne</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Historique d'audit & Journal des logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Export PDF A4 personnalisé avec logo</span>
                  </li>
                </div>
              </div>
            </div>

            {/* Card 3: MULTI-ATELIERS */}
            <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs hover:scale-[1.01] transition">
              <div className="space-y-4">
                <div className="text-xs font-black text-text-secondary uppercase tracking-wider">MULTI-ATELIERS</div>
                <p className="text-xs text-text-secondary">Pour les réseaux d'imprimeries et groupes régionaux.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-text-main font-sans">Sur Devis</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center block font-sans"
                >
                  RÉSERVER UNE DÉMO
                </Link>

                <div className="space-y-2 text-xs text-text-secondary pt-4 border-t border-border-subtle">
                  <p className="font-extrabold text-[10px] uppercase text-text-secondary">SERVICES SUR MESURE :</p>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Multi-imprimeries & RLS dédié</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Accompagnement et formation atelier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    <span>Support prioritaire 24/7</span>
                  </li>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION: TÉMOIGNAGES */}
        <section id="temoignages" className="py-10 space-y-8 text-center bg-bg-card border border-border-subtle rounded-3xl p-6 sm:p-10 shadow-xs" aria-label="Témoignages Clients">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-bold inline-block font-sans">
              Témoignages
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-text-main font-sans">
              Adopté par les imprimeries à travers l'Afrique francophone
            </h2>
            <p className="text-xs text-text-secondary">
              Découvrez comment nos utilisateurs ont sécurisé leurs acomptes et leur production.
            </p>
          </div>

          {/* Testimonial Display Slide */}
          <div className="max-w-3xl mx-auto space-y-6 pt-4">
            <div className="bg-input-bg border border-border-subtle rounded-2xl p-6 sm:p-8 space-y-4 text-left shadow-xs">
              <p className="text-sm sm:text-base italic text-text-main leading-relaxed font-sans">
                "{testimonials[activeTestimonial].quote}"
              </p>
              
              <div className="flex items-center gap-4 pt-2 border-t border-border-subtle">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-text-main font-sans">{testimonials[activeTestimonial].name}</h3>
                  <p className="text-xs text-text-secondary">{testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}</p>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                aria-label="Témoignage précédent"
                className="p-2 rounded-full bg-bg-card border border-border-subtle hover:border-brand-primary text-text-main transition cursor-pointer hover:scale-[1.05]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Aller au témoignage ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activeTestimonial ? 'bg-brand-primary w-6' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                aria-label="Témoignage suivant"
                className="p-2 rounded-full bg-bg-card border border-border-subtle hover:border-brand-primary text-text-main transition cursor-pointer hover:scale-[1.05]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </section>

        {/* SECTION: FAQ */}
        <section id="faq" className="py-10 space-y-8 text-left" aria-label="Foire Aux Questions">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column Card */}
            <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 shadow-xs">
              <img
                src="/Temoignage (2).jpg"
                alt="Support Technique Print_Flow"
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-primary"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-text-main font-sans">Réserver une démo de 15 min</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Posez vos questions directement à notre équipe avant de démarrer votre essai.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-2 shadow-xs font-sans hover:scale-[1.02]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Réserver une Démo Gratuite</span>
              </Link>
            </div>

            {/* Right Column Accordion */}
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-2xl font-black text-text-main pb-2 font-sans">Foire Aux Questions (FAQ)</h2>
              
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden transition shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-text-main hover:text-brand-primary transition cursor-pointer font-sans"
                    >
                      <span>{faq.q}</span>
                      <div className="p-1 rounded-md bg-brand-primary/10 text-brand-primary">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-text-secondary leading-relaxed border-t border-border-subtle pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="border-t border-border-subtle pt-8 pb-6 text-center text-xs text-text-secondary space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-text-main font-sans">
            <span>Print_Flow</span>
            <span>•</span>
            <span>Logiciel SaaS Imprimerie</span>
          </div>
          <p>© 2026 Print_Flow. Tous droits réservés.</p>
        </footer>

      </main>
    </div>
  );
}
