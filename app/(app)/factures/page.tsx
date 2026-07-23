'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Receipt, 
  Printer, 
  Download,
  DollarSign,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  MapPin,
  Calendar,
  Layers,
  Unlock
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import { downloadElementAsPdf } from '@/lib/utils/pdf';
import { Invoice } from '@/types/domain';
import Dropdown from '@/components/ui/Dropdown';

export default function FacturesPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const orgStylePreferences = useAppStore((state) => state.orgStylePreferences);
  const role = currentProfile ? currentProfile.role : 'commercial';

  // Store States
  const storeInvoices = useAppStore((state) => state.invoices);
  const storeClients = useAppStore((state) => state.clients);
  const storeQuotes = useAppStore((state) => state.quotes);
  
  const recordPaymentStore = useAppStore((state) => state.recordPayment);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'especes' | 'cheque' | 'mobile_money'>('especes');
  const [paymentNote, setPaymentNote] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Access check: Chef d'atelier is blocked
  if (role === 'chef_atelier') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-4 max-w-md mx-auto animate-fade-in bg-bg-card p-8 border border-border-subtle rounded-3xl shadow-premium">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h3 className="text-lg font-bold text-text-main">Accès Refusé</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Les informations de facturation, paiements et chiffre d'affaires sont confidentielles et réservées aux administrateurs et commerciaux.
        </p>
      </div>
    );
  }

  // Filter invoices list
  const filteredInvoices = storeInvoices
    .filter(i => i.organizationId === currentOrgId && !i.isDeleted)
    .filter(i => {
      const q = searchQuery.toLowerCase();
      const client = storeClients.find(c => c.id === i.clientId);
      return (
        i.invoiceNumber.toLowerCase().includes(q) ||
        (client && client.companyName.toLowerCase().includes(q))
      );
    });

  // Handle active invoice selection
  const activeInvoice = selectedInvoice || filteredInvoices[0] || null;

  // Generates a real PDF client-side (html2canvas + jsPDF) — no print dialog involved
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownload = async () => {
    if (!activeInvoice || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadElementAsPdf('print-invoice-area', `Facture-${activeInvoice.invoiceNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle local print triggering
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Add Payment
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice || paymentAmount <= 0) return;

    const remaining = activeInvoice.totalFcfa - activeInvoice.amountPaidFcfa;
    if (paymentAmount > remaining) {
      alert("Le montant saisi dépasse le solde restant à payer.");
      return;
    }

    recordPaymentStore(activeInvoice.id, paymentAmount, paymentMethod, paymentNote.trim() || undefined);

    setIsPaymentOpen(false);
    setPaymentAmount(0);
    setPaymentMethod('especes');
    setPaymentNote('');

    // Refresh selected invoice state from the just-updated store
    const refreshed = useAppStore.getState().invoices.find(i => i.id === activeInvoice.id);
    if (refreshed) {
      setSelectedInvoice(refreshed);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'soldee':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'partiellement_payee':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default:
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'soldee': return 'Facture Soldée';
      case 'partiellement_payee': return 'Acompte Versé';
      default: return 'En attente acompte';
    }
  };

  return (
    <div className="print-page-root space-y-6">
      {/* CSS print style to print only the A4 preview box */}
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-invoice-area, #print-invoice-area * {
            visibility: visible;
          }
          /*
            Unlike devis/commandes (rendered inside a fixed fullscreen modal, which
            already escapes the page layout entirely), the facture preview is rendered
            inline inside this page's own two-column grid. Without neutralizing that
            grid/column wrapper chain the same way globals.css neutralizes .app-shell*,
            #print-invoice-area's absolute positioning anchors to wherever this grid
            naturally sits in the page flow — printing a mostly blank page with the
            invoice offset down instead of starting at the top.
          */
          .print-page-root,
          .print-page-grid,
          .print-page-col {
            position: static !important;
            display: block !important;
            height: auto !important;
            max-height: none !important;
            width: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-invoice-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            padding: 0;
            margin: 0;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          #print-invoice-area table,
          #print-invoice-area tr,
          #print-invoice-area .print-totals-block {
            page-break-inside: avoid;
          }
          /* Hide everything that isn't the printable invoice itself */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Title */}
      <div className="no-print">
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Facturation & Comptabilité</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Suivez les factures émises, enregistrez les encaissements (chèques, espèces, mobile money) et imprimez les pièces de caisse.
        </p>
      </div>

      {/* Split screen layout: List on Left (7 cols), A4 Preview on Right (5 cols) */}
      <div className="print-page-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left side list */}
        <div className="no-print lg:col-span-6 space-y-6">
          
          {/* Search bar */}
          <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium flex items-center">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par n° de facture, entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
              />
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-text-main">
                <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="px-4 sm:px-6 py-4">N° Facture</th>
                    <th className="px-4 sm:px-6 py-4">Client</th>
                    <th className="px-4 sm:px-6 py-4 text-right">Total TTC</th>
                    <th className="px-4 sm:px-6 py-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => {
                      const client = storeClients.find(c => c.id === inv.clientId);
                      const isSelected = activeInvoice?.id === inv.id;
                      
                      return (
                        <tr 
                          key={inv.id} 
                          onClick={() => setSelectedInvoice(inv)}
                          className={`cursor-pointer transition duration-150 ${
                            isSelected 
                              ? 'bg-brand-primary/10 border-l-4 border-brand-primary' 
                              : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-slate-400" />
                              <span>{inv.invoiceNumber}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold">
                            {client?.companyName || 'Inconnu'}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-extrabold text-brand-primary">
                            {formatFCFA(inv.totalFcfa)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getStatusBadge(inv.status)}`}>
                              {getStatusLabel(inv.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-secondary font-medium">
                        Aucune facture émise.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right side A4 Preview */}
        <div className="print-page-col lg:col-span-6 space-y-4">

          {activeInvoice ? (
            <>
              {/* Preview controls */}
              <div className="no-print flex justify-between items-center bg-bg-card border border-border-subtle p-3 rounded-2xl shadow-premium">
                <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                  <Layers className="w-4.5 h-4.5 text-brand-primary" />
                  Prévisualisation A4 Facture
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPaymentOpen(true)}
                    disabled={activeInvoice.status === 'soldee'}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1 shadow-sm ${
                      activeInvoice.status === 'soldee'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-border-subtle'
                        : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Enregistrer Paiement</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary transition flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-text-secondary transition flex items-center gap-1 disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isDownloading ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-text-secondary border-t-transparent animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloading ? 'Génération...' : 'Télécharger'}</span>
                  </button>
                </div>
              </div>
               {/* A4 sheet mock */}
              {(() => {
                const fontClass = 
                  orgStylePreferences.fontFamily === 'serif' ? 'font-serif' :
                  orgStylePreferences.fontFamily === 'mono' ? 'font-mono' :
                  'font-sans';

                const accentText = 
                  orgStylePreferences.themeColor === 'cyan' ? 'text-cyan-600' :
                  orgStylePreferences.themeColor === 'violet' ? 'text-violet-600' :
                  orgStylePreferences.themeColor === 'amber' ? 'text-amber-600' :
                  'text-emerald-600'; // Default emerald

                const accentBg = 
                  orgStylePreferences.themeColor === 'cyan' ? 'bg-cyan-600 text-white' :
                  orgStylePreferences.themeColor === 'violet' ? 'bg-violet-600 text-white' :
                  orgStylePreferences.themeColor === 'amber' ? 'bg-amber-600 text-slate-900' :
                  'bg-emerald-600 text-white';

                const templateBorder = 
                  orgStylePreferences.invoiceTemplate === 'tech' ? 'border-4 border-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.1)]' :
                  orgStylePreferences.invoiceTemplate === 'classic' ? 'border border-slate-300' :
                  'border-t-8 border-t-emerald-600 dark:border-t-emerald-500 border border-slate-200';

                return (
                  <div
                    id="print-invoice-area"
                    className={`bg-white text-slate-800 p-8 rounded-3xl shadow-premium w-full ${fontClass} ${templateBorder}`}
                  >
                    <div>
                      {/* Header Row */}
                      {orgStylePreferences.invoiceTemplate === 'classic' ? (
                        <div className="flex justify-between items-center pb-4 mb-5 -mx-8 -mt-8 px-8 pt-8 border-b border-slate-200 bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                              {currentOrg.name.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-sm font-bold text-slate-900">{currentOrg.name}</h2>
                              <p className="text-[9px] text-slate-500">{currentOrg.address}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <h3 className="text-sm font-bold text-slate-900">FACTURE</h3>
                            <p className="text-xs font-bold text-slate-800">{activeInvoice.invoiceNumber}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap justify-between items-start gap-4 pb-5 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <img src="/Logo_Print_Flow.png" alt="Print_Flow" className="h-10 w-auto object-contain shrink-0" />
                            <div className="space-y-0.5">
                              <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">{currentOrg.name}</h2>
                              <p className="text-[9px] text-slate-500">{currentOrg.address || 'Plateau, Dakar'}</p>
                              <p className="text-[9px] text-slate-500">Tél: {currentOrg.phone || '+221 33 800 00 00'}</p>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <h3 className="text-xs font-bold text-slate-400 tracking-wider">FACTURE</h3>
                            <p className={`text-sm font-extrabold ${accentText}`}>{activeInvoice.invoiceNumber}</p>
                            <p className="text-[9px] text-slate-500">Date: {new Date(activeInvoice.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      )}

                      {/* Client and billing row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 text-xs border-b border-slate-100">
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Facturé à :</p>
                          <p className="font-bold text-slate-900">
                            {storeClients.find(c => c.id === activeInvoice.clientId)?.companyName || 'Client Inconnu'}
                          </p>
                          <p className="text-slate-500">
                            {storeClients.find(c => c.id === activeInvoice.clientId)?.address || '-'}
                          </p>
                          <p className="text-slate-500">
                            {storeClients.find(c => c.id === activeInvoice.clientId)?.phone || '-'}
                          </p>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Détails dossier :</p>
                          <p className="text-slate-500">Dossier technique: {activeInvoice.batId}</p>
                          <p className="text-slate-500">Réf Devis: {storeQuotes.find(q => q.id === activeInvoice.quoteId)?.quoteNumber}</p>
                          <p className="text-slate-500 font-medium">Facturé par: {activeInvoice.createdBy}</p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <table className="w-full text-left text-xs my-4 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-300 text-slate-400 text-[10px] font-bold uppercase">
                            <th className="py-2">Description du tirage</th>
                            <th className="py-2 text-right">Quantité</th>
                            <th className="py-2 text-right">P.U. HT</th>
                            <th className="py-2 text-right">Montant HT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeInvoice.items?.map((item) => (
                            <tr key={item.id} className="text-slate-700">
                              <td className="py-2.5 font-medium">{item.description}</td>
                              <td className="py-2.5 text-right">{item.quantity.toLocaleString()}</td>
                              <td className="py-2.5 text-right">{item.unitPriceFcfa.toLocaleString()} FCFA</td>
                              <td className="py-2.5 text-right font-bold text-slate-900">{(item.quantity * item.unitPriceFcfa).toLocaleString()} FCFA</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Subtotals & Pay information */}
                    <div className="print-totals-block border-t border-slate-200 pt-4 mt-2">
                      <div className="flex flex-wrap justify-between items-stretch gap-4">

                        {/* Payment details / bank stamp */}
                        <div className="text-[9px] text-slate-400 space-y-1 max-w-full sm:max-w-[200px] flex flex-col justify-end">
                          <p className="font-bold text-slate-600">MODES DE RÈGLEMENT :</p>
                          <p>Virement bancaire, chèque ou Orange Money.</p>
                          <p>Merci pour votre confiance !</p>
                        </div>

                        {/* Math sums */}
                        <div className="space-y-1.5 text-right w-full sm:w-64 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Total HT :</span>
                            <span>{activeInvoice.subtotalFcfa.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>TVA ({activeInvoice.items?.[0]?.vatRate || 18}%) :</span>
                            <span>{activeInvoice.vatAmountFcfa.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-300 pt-1.5 text-slate-900 font-extrabold text-sm">
                            <span>TOTAL TTC :</span>
                            <span className={accentText}>{activeInvoice.totalFcfa.toLocaleString()} FCFA</span>
                          </div>

                          {/* Payment amounts & deposit deduction */}
                          <div className="border-t border-dashed border-slate-200 pt-1.5 space-y-1 text-[11px] text-slate-500">
                            <div className="flex justify-between">
                              <span>Acompte / Versé :</span>
                              <span className="text-slate-800 font-bold">{activeInvoice.amountPaidFcfa.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-rose-600 font-bold text-xs">
                              <span>Solde Dû (Reste à payer) :</span>
                              <span>{(activeInvoice.totalFcfa - activeInvoice.amountPaidFcfa).toLocaleString()} FCFA</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="bg-bg-card border border-border-subtle p-8 rounded-3xl text-center text-text-secondary text-xs">
              Sélectionnez une facture pour visualiser sa maquette A4.
            </div>
          )}
        </div>

        </div>

      {/* Record Payment Dialog */}
      {isPaymentOpen && activeInvoice && (() => {
        const remaining = activeInvoice.totalFcfa - activeInvoice.amountPaidFcfa;
        return (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
            <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300">

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-main leading-tight">Enregistrer un Règlement</h3>
                    <p className="text-[10px] text-text-secondary">Facture {activeInvoice.invoiceNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentOpen(false)}
                  className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="p-6 space-y-5">
                {/* Balance summary card */}
                <div className="rounded-2xl border border-border-subtle bg-bg-base/60 dark:bg-slate-800/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Solde restant</span>
                    <span className="text-lg font-extrabold text-rose-500">{formatFCFA(remaining)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle text-xs">
                    <div>
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Total TTC</p>
                      <p className="font-bold text-text-main mt-0.5">{formatFCFA(activeInvoice.totalFcfa)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Déjà payé</p>
                      <p className="font-bold text-text-main mt-0.5">{formatFCFA(activeInvoice.amountPaidFcfa)}</p>
                    </div>
                  </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Montant du versement *</label>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(remaining)}
                      className="text-[10px] font-bold text-brand-primary hover:underline"
                    >
                      Solde total
                    </button>
                  </div>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      placeholder="ex: 500000"
                      min={1}
                      max={remaining}
                      className="w-full pl-9 pr-16 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                      required
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary">FCFA</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Mode de règlement *</label>
                  <Dropdown
                    value={paymentMethod}
                    onChange={(val) => setPaymentMethod(val as 'especes' | 'cheque' | 'mobile_money')}
                    options={[
                      { value: 'especes', label: 'Espèces' },
                      { value: 'cheque', label: 'Chèque' },
                      { value: 'mobile_money', label: 'Mobile Money' },
                    ]}
                  />
                </div>

                {/* Optional note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Référence / Note</label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="ex: Chèque Ecobank N° 847291"
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPaymentOpen(false)}
                    className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirmer le paiement</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
