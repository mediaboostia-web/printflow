'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Play, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Smartphone,
  Video,
  FileCheck
} from 'lucide-react';

const tutorials = [
  {
    id: 1,
    title: 'Comprendre le verrou BAT',
    description: 'Tutoriel vidéo expliquant pourquoi la production est bloquée tant que le BAT client n\'est pas validé.',
    type: 'video',
    duration: '3 min',
    category: 'Flux Métier'
  },
  {
    id: 2,
    title: 'Émettre son premier devis',
    description: 'Guide pas à pas pour configurer un client, ajouter des prestations du catalogue et calculer la TVA.',
    type: 'guide',
    duration: '5 min de lecture',
    category: 'Commercial'
  },
  {
    id: 3,
    title: 'Gestion des livraisons & Factures',
    description: 'Comment la livraison d\'un bon de production génère automatiquement la facture correspondante.',
    type: 'guide',
    duration: '4 min de lecture',
    category: 'Comptabilité'
  },
  {
    id: 4,
    title: 'Configuration de l\'atelier',
    description: 'Tutoriel sur l\'ajout de taxes locales, de machines de presse (Offset/Numérique) et de formats dans les paramètres.',
    type: 'video',
    duration: '2 min',
    category: 'Paramètres'
  }
];

const faqItems = [
  {
    id: 'faq-1',
    question: 'Pourquoi le bouton "Lancer la production" est-il bloqué sur un devis ?',
    answer: 'Si le devis a été configuré avec l\'option "Nécessite un BAT", le verrou BAT bloque l\'impression en atelier tant que le Bon à Tirer correspondant n\'est pas approuvé ("Validé") par le client ou un administrateur sur la page BAT.'
  },
  {
    id: 'faq-2',
    question: 'Comment générer une facture pour un client ?',
    answer: 'Les factures sont automatiquement générées par le système lorsque vous déclarez un Bon de Livraison comme "Livré" à l\'adresse du client. Le dossier passe alors en facturation avec les montants indexés du devis.'
  },
  {
    id: 'faq-3',
    question: 'Puis-je ajouter un format personnalisé qui n\'est pas dans le catalogue ?',
    answer: 'Oui ! Sur la page Catalogue ou Devis, vous pouvez choisir "Format personnalisé". Le système indexera automatiquement ce format en base et le proposera pour toutes les fiches produits suivantes.'
  },
  {
    id: 'faq-4',
    question: 'Comment modifier les informations de l\'organisation imprimées sur la facture A4 ?',
    answer: 'Naviguez vers l\'onglet Paramètres (Fiche Organisation). Vous pourrez y éditer le nom, le téléphone standard, l\'email de facturation, l\'adresse géographique et téléverser le logo officiel.'
  }
];

export default function AidePage() {
  // State to hold open FAQ accordions
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    if (openFAQId === id) {
      setOpenFAQId(null);
    } else {
      setOpenFAQId(id);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Centre d'aide & Documentation</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Consultez les tutoriels, configurez les flux d'ateliers et trouvez des réponses rapides sur le fonctionnement de Print_Flow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Tutorials and FAQs */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tutorials grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-primary" />
              Tutoriels et Guides Pratiques
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tutorials.map(t => (
                <div 
                  key={t.id}
                  className="bg-bg-card border border-border-subtle p-5 rounded-3xl shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.05)] transition duration-300 flex flex-col justify-between h-44 group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      <span>{t.category}</span>
                      <span className="flex items-center gap-1">
                        {t.type === 'video' ? <Video className="w-3.5 h-3.5 text-brand-primary" /> : <FileCheck className="w-3.5 h-3.5 text-brand-primary" />}
                        {t.duration}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-text-main group-hover:text-brand-primary transition">
                      {t.title}
                    </h4>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <button className="text-[10px] font-extrabold text-brand-primary hover:underline self-start flex items-center gap-1">
                    {t.type === 'video' ? <Play className="w-3 h-3 fill-brand-primary" /> : null}
                    <span>{t.type === 'video' ? 'Visionner la vidéo' : 'Lire le guide'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Accordions */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-primary" />
              Foire Aux Questions (FAQ)
            </h3>

            <div className="space-y-2">
              {faqItems.map(faq => {
                const isOpen = openFAQId === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-5 py-4 flex justify-between items-center text-left text-xs font-bold text-text-main hover:bg-slate-50 dark:hover:bg-slate-800/20 transition gap-4"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-brand-primary" /> : <ChevronDown className="w-4 h-4 shrink-0 text-text-secondary" />}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 border-t border-border-subtle/40 text-xs text-text-secondary leading-relaxed bg-bg-base/30 animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Contact & Support */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-main flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-brand-primary" />
                Support Officiel
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Notre équipe est disponible du Lundi au Vendredi pour vous aider dans l'intégration de vos ateliers.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border-subtle text-xs">
              <div className="flex gap-3">
                <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                <div>
                  <p className="font-bold text-text-main">Téléphone Support</p>
                  <p className="text-text-secondary mt-0.5">+221 77 824 00 00</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                <div>
                  <p className="font-bold text-text-main">Email Support</p>
                  <p className="text-text-secondary mt-0.5">support@printflow.africa</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                <div>
                  <p className="font-bold text-text-main">Bureau Sénégal</p>
                  <p className="text-text-secondary mt-0.5">Rue Mermoz, Dakar, Sénégal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
