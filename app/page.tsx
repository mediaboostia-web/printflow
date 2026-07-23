'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ChevronLeft,
  PhoneCall,
  Plus,
  Minus
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
      name: "Fatou Diop",
      role: "Gérante d'Atelier",
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
      q: "Est-ce adapté aux tarifs d'impression en FCFA / XAF ?",
      a: "Absolument. Print_Flow est nativement configuré pour la monnaie FCFA / XAF avec gestion de la TVA 18% et des formats A4/A3/A2/Banderoles."
    },
    {
      q: "Comment l'acompte versé est-il déduit sur la facture ?",
      a: "Lorsqu'un acompte est enregistré sur le bon de commande, il est automatiquement reporté sur la facture finale et déduit du montant Total TTC pour afficher le Solde Dû exact."
    },
    {
      q: "Puis-je passer à la Formule Pro plus tard ?",
      a: "Oui, à tout moment depuis votre tableau de bord. La Formule Pro à 14 900 XAF/mois débloque les utilisateurs illimités, la boutique en ligne et l'historique d'audit."
    },
    {
      q: "Mes données d'imprimerie sont-elles sécurisées ?",
      a: "Chaque organisation dispose d'un accès isolé protégé par le protocole Supabase Row Level Security (RLS) et chiffrement SSL 256-bit."
    }
  ];

  // Schema.org JSON-LD for Programmatic SEO
  const jsonLd = {
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
    <div className="min-h-screen bg-[#F5F2F9] text-[#1E162B] font-sans selection:bg-purple-700 selection:text-white">
      {/* Programmatic SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Outer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-16">
        
        {/* Top Header Navbar Card */}
        <header className="bg-white/95 backdrop-blur-md border border-purple-100/80 rounded-2xl px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-4 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              P
            </div>
            <span className="text-xl font-extrabold tracking-tight text-purple-950 font-sans">
              Print<span className="text-purple-700">_Flow</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 font-sans">
            <a href="#defis-solution" className="hover:text-purple-700 transition">Défis & Solution</a>
            <a href="#fonctionnalites" className="hover:text-purple-700 transition">Fonctionnalités</a>
            <a href="#tarifs" className="hover:text-purple-700 transition">Tarifs</a>
            <a href="#temoignages" className="hover:text-purple-700 transition">Témoignages</a>
            <a href="#faq" className="hover:text-purple-700 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-2 font-sans"
              >
                <span>Mon Espace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-purple-950 hover:text-purple-700 transition font-sans"
                >
                  Se connecter
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-full transition shadow-xs font-sans"
                >
                  Démarrer l'essai
                </Link>
              </>
            )}
          </div>
        </header>

        {/* SECTION 1: HERO (Bork Agent Style Reference 5) */}
        <section className="pt-6 pb-8 text-center space-y-8">
          
          {/* Centered Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-purple-700 animate-pulse" />
            <span>Essai gratuit de 7 jours pour votre imprimerie</span>
          </div>

          {/* Centered H1 Headline */}
          <div className="max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-purple-950 tracking-tight leading-[1.1] font-sans">
              Centralisez Devis, BAT & Production en un Seul Endroit
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto font-sans">
              Le logiciel conçu spécifiquement pour les imprimeries et ateliers de reprographie en Afrique francophone (Sénégal, Mali, Côte d'Ivoire, Gabon).
            </p>
          </div>

          {/* Centered Action Input / Form Pill */}
          <div className="max-w-md mx-auto flex items-center bg-white border border-purple-200 rounded-full p-1.5 shadow-sm">
            <input
              type="text"
              readOnly
              value="Saisissez votre e-mail pour démarrer..."
              className="w-full pl-4 text-xs text-slate-400 bg-transparent outline-none cursor-pointer"
              onClick={() => router.push('/login')}
            />
            <Link
              href="/login"
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-full transition shrink-0 flex items-center gap-2 font-sans"
            >
              <span>Essai gratuit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* SaaS Dashboard Frame Mockup (Ref 5: Scrolls / Floats into view) */}
          <div className="pt-6 max-w-5xl mx-auto">
            <div className="bg-white p-2.5 rounded-3xl border border-purple-200/80 shadow-2xl overflow-hidden transform hover:-translate-y-1 transition duration-500">
              <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative">
                {/* Window Control Dots */}
                <div className="h-8 bg-slate-200/80 px-4 flex items-center gap-2 border-b border-slate-300/60">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold text-slate-500 mx-auto">Print_Flow SaaS Dashboard — Supervision Atelier</span>
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

        {/* SECTION 2: DEFIS VS SOLUTIONS */}
        <section id="defis-solution" className="py-10 space-y-8 text-left">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 font-sans">Réalité du Terrain</span>
            <h2 className="text-2xl sm:text-4xl font-black text-purple-950 font-sans">
              Des Défis Quotidiens aux Solutions Numériques.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Column 1: Les Défis */}
            <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-950 font-sans">Les Défis en Atelier</h3>
                  <p className="text-xs text-rose-700/80">Problèmes récurrents sans outil centralisé</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-sans">Carnets papier et devis perdus</strong>
                    <span className="text-slate-600">Impossibilité de retrouver l'historique d'un client récurrent ou le prix appliqué au tirage précédent.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-sans">Acomptes non enregistrés & litiges</strong>
                    <span className="text-slate-600">Disputes lors de la livraison finale faute de preuve écrite du versement initial.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-sans">Gâchis de papier sur fichiers non validés</strong>
                    <span className="text-slate-600">Impression lancée sans Bon à Tirer (BAT) validé, générant des réimpressions coûteuses.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 2: La Solution Print_Flow */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center gap-3 border-b border-purple-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-purple-950 font-sans">La Solution Print_Flow</h3>
                  <p className="text-xs text-purple-700/80">Traçabilité et sérénité financière 100%</p>
                </div>
              </div>

              <ul className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start gap-3 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                  <Check className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-950 block font-sans">Devis HT & TVA 18% instantanés</strong>
                    <span className="text-slate-600">Calcul automatique selon le grammage, le papier et les options de façonnage avec PDF A4.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                  <Check className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-950 block font-sans">Déduction automatique de l'acompte</strong>
                    <span className="text-slate-600">L'acompte saisi est automatiquement sous-traité du total TTC sur la facture pour afficher le Solde Dû exact.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 bg-purple-50/50 p-3 rounded-2xl border border-purple-100">
                  <Check className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-purple-950 block font-sans">Verrou BAT obligatoire</strong>
                    <span className="text-slate-600">Aucune commande ne peut passer en production sans validation explicite du Bon à Tirer client.</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </section>

        {/* SECTION 3: FONCTIONNALITÉS (Reference 1: 5 Cards Layout with Hover Effects, NO Gradients) */}
        <section id="fonctionnalites" className="py-10 space-y-8 text-center">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 font-sans">Plateforme Complète</span>
            <h2 className="text-2xl sm:text-4xl font-black text-purple-950 font-sans">
              Tout ce dont votre imprimerie a besoin. Sans la complexité.
            </h2>
            <p className="text-xs text-slate-600">
              Conçu pour simplifier la vie des commerciaux, des chefs d'atelier et des gérants.
            </p>
          </div>

          {/* 5 Cards Grid Layout inspired by Reference 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-left">
            
            {/* Left Column (2 Stacked Cards) */}
            <div className="space-y-6">
              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition duration-300 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-purple-950 font-sans">Prise de Devis Express</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Générez des devis personnalisés avec TVA 18%, options de finitions et aperçu A4 imprimable en un clic.
                </p>
              </div>

              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition duration-300 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-purple-950 font-sans">Verrou & Validation BAT</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Téléversement des épreuves (.ZIP), gestion des versions et verrouillage automatique avant le lancement de presse.
                </p>
              </div>
            </div>

            {/* Center Featured Card (SaaS Screen Mockup) */}
            <div className="bg-purple-700 text-white rounded-3xl p-6 shadow-md hover:-translate-y-1 transition duration-300 flex flex-col justify-between h-full min-h-[380px] border border-purple-800">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white font-sans">Supervision d'Atelier en Temps Réel</h3>
                <p className="text-xs text-purple-100 leading-relaxed font-sans">
                  Visualisez le statut de chaque commande : En attente, Sous presse, Façonnage ou Prêt à livrer.
                </p>
              </div>

              <div className="pt-4">
                <div className="bg-white p-2 rounded-2xl shadow-inner border border-purple-600 overflow-hidden">
                  <img
                    src="/Capture d'écran Dashboard.png"
                    alt="Ecran SAAS Print_Flow"
                    className="w-full h-auto rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (2 Stacked Cards) */}
            <div className="space-y-6">
              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition duration-300 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-purple-950 font-sans">Gestion des Acomptes & Impayés</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Enregistrez les paiements partiels et affichez clairement le Solde Dû restant sur la facture finale.
                </p>
              </div>

              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition duration-300 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-purple-950 font-sans">Bons de Production Confidentiels</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Fiches ateliers imprimables sans le nom des machines pour garantir la confidentialité client.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 4: PRICING (Reference 2: Solo, Studio, Scale Cards with Bullet Checkmarks) */}
        <section id="tarifs" className="py-10 space-y-8 text-center">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 font-sans">Transparence Tarifaire</span>
            <h2 className="text-2xl sm:text-4xl font-black text-purple-950 font-sans">Des Tarifs Clairs et Sans Surprise.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto text-left">
            
            {/* Card 1: DÉMARRAGE (Essai 7 Jours) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">DÉMARRAGE</div>
                <p className="text-xs text-slate-500">Pour tester l'outil gratuitement dans votre atelier.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 font-sans">0 XAF</span>
                  <span className="text-xs text-slate-500">/ 7 jours</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center block font-sans"
                >
                  DÉMARRER L'ESSAI GRATUIT
                </Link>

                <div className="space-y-2 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <p className="font-extrabold text-[10px] uppercase text-slate-400">INCLUS DANS L'ESSAI :</p>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>1 utilisateur unique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>Devis & Factures TVA 18%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>Bons de commande & Fiches atelier</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="line-through">Boutique en ligne client</span>
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="line-through">Historique d'audit d'impression</span>
                  </li>
                </div>
              </div>
            </div>

            {/* Card 2: FORMULE PRO (High-Contrast Dark Featured Card Ref 2) */}
            <div className="bg-slate-950 text-white border-2 border-purple-600 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-purple-700 text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                LE PLUS POPULAIRE
              </div>

              <div className="space-y-4">
                <div className="text-xs font-black text-purple-400 uppercase tracking-wider">FORMULE PRO</div>
                <p className="text-xs text-slate-400">Pour les imprimeries souhaitant une traçabilité totale.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-sans">14 900 XAF</span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition text-center block shadow-md font-sans"
                >
                  SOUSCRIRE À LA FORMULE PRO
                </Link>

                <div className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <p className="font-extrabold text-[10px] uppercase text-purple-400">TOUT CE QUI EST INCLUS :</p>
                  <li className="flex items-center gap-2 font-bold text-white">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Collaborateurs & Personnel illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Catalogue Public Storefront</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Prise de commandes en ligne</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Historique d'audit & Journal des logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Export PDF A4 personnalisé avec logo</span>
                  </li>
                </div>
              </div>
            </div>

            {/* Card 3: RÉSEAU / MULTI-ATELIERS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">MULTI-ATELIERS</div>
                <p className="text-xs text-slate-500">Pour les réseaux d'imprimeries et groupes régionaux.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 font-sans">Sur Devis</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition text-center block font-sans"
                >
                  RÉSERVER UNE DÉMO
                </Link>

                <div className="space-y-2 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <p className="font-extrabold text-[10px] uppercase text-slate-400">SERVICES SUR MESURE :</p>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>Multi-imprimeries & RLS dédié</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>Accompagnement et formation atelier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>Support prioritaire 24/7</span>
                  </li>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* SECTION 5: TÉMOIGNAGES (Reference 3: Slider / Carousel with Avatars) */}
        <section id="temoignages" className="py-10 space-y-8 text-center bg-white border border-purple-100 rounded-3xl p-6 sm:p-10 shadow-xs">
          
          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-bold inline-block font-sans">
              Témoignages
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-purple-950 font-sans">
              Adopté par les imprimeries à travers l'Afrique francophone
            </h2>
            <p className="text-xs text-slate-600">
              Découvrez comment nos utilisateurs ont sécurisé leurs acomptes et leur production.
            </p>
          </div>

          {/* Testimonial Display Slide */}
          <div className="max-w-3xl mx-auto space-y-6 pt-4">
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 sm:p-8 space-y-4 text-left">
              <p className="text-sm sm:text-base italic text-purple-950 leading-relaxed font-sans">
                "{testimonials[activeTestimonial].quote}"
              </p>
              
              <div className="flex items-center gap-4 pt-2 border-t border-purple-200/60">
                <img
                  src={testimonials[activeTestimonial].image}
                  alt={testimonials[activeTestimonial].name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-700 shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-purple-950 font-sans">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-xs text-slate-500">{testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}</p>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="p-2 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activeTestimonial ? 'bg-purple-700 w-6' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveTestimonial((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                className="p-2 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </section>

        {/* SECTION 6: FAQ (Reference 4: Left Call Card + Right Accordion) */}
        <section id="faq" className="py-10 space-y-8 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column Card (Ref 4: Book a Call Card) */}
            <div className="lg:col-span-4 bg-white border border-purple-100 rounded-3xl p-6 space-y-4 shadow-xs">
              <img
                src="/Temoignage (2).jpg"
                alt="Support Technique"
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-700"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-purple-950 font-sans">Réserver une démo de 15 min</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Posez vos questions directement à notre équipe avant de démarrer votre essai.
                </p>
              </div>

              <Link
                href="/login"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition text-center flex items-center justify-center gap-2 shadow-xs font-sans"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Réserver une Démo Gratuite</span>
              </Link>
            </div>

            {/* Right Column Accordion (Ref 4: FAQ Accordions) */}
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-2xl font-black text-purple-950 pb-2 font-sans">Foire Aux Questions (FAQ)</h2>
              
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-purple-100 rounded-2xl overflow-hidden transition shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left font-bold text-sm text-purple-950 hover:text-purple-700 transition cursor-pointer font-sans"
                    >
                      <span>{faq.q}</span>
                      <div className="p-1 rounded-md bg-purple-50 text-purple-700">
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-purple-50 pt-3">
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
        <footer className="border-t border-purple-200/60 pt-8 pb-6 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-2 font-bold text-purple-950 font-sans">
            <span>Print_Flow</span>
            <span>•</span>
            <span>Logiciel SaaS Imprimerie FCFA / XAF</span>
          </div>
          <p>© 2026 Print_Flow. Tous droits réservés.</p>
        </footer>

      </div>
    </div>
  );
}
