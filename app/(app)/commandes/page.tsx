'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Briefcase, 
  AlertTriangle, 
  Printer,
  CheckCircle2,
  ChevronRight,
  FileText,
  AlertCircle,
  Download,
  Eye,
  Lock
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import { downloadElementAsPdf } from '@/lib/utils/pdf';
import { PurchaseOrder } from '@/types/domain';
import Dropdown from '@/components/ui/Dropdown';

export default function CommandesPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  
  // Store States
  const storeClients = useAppStore((state) => state.clients);
  const storeQuotes = useAppStore((state) => state.quotes);
  const storeBATs = useAppStore((state) => state.bats);
  const storePOs = useAppStore((state) => state.pos);
  const storeMachines = useAppStore((state) => state.machines);
  
  const addPOStore = useAppStore((state) => state.addPO);
  const updatePOStatusStore = useAppStore((state) => state.updatePOStatus);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFicheModalOpen, setIsFicheModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  // Form states
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [machineSetup, setMachineSetup] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<PurchaseOrder['status']>('en_attente_production');
  const [depositAmountFcfa, setDepositAmountFcfa] = useState<number>(0);
  
  const [formError, setFormError] = useState('');
  const [batLockActive, setBatLockActive] = useState(false);

  // Load first machine setup on mount
  useEffect(() => {
    if (storeMachines.length > 0 && !machineSetup) {
      setMachineSetup(storeMachines[0].name);
    }
  }, [storeMachines, machineSetup]);

  // Filter quotes belonging to this org that are validated
  const validatedQuotes = storeQuotes.filter(q => q.organizationId === currentOrgId && q.status === 'valide');

  // Filter PO list
  const filteredPOs = storePOs
    .filter(po => po.organizationId === currentOrgId)
    .filter(po => {
      const searchLower = searchQuery.toLowerCase();
      const quote = storeQuotes.find(q => q.id === po.quoteId);
      const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
      return (
        po.orderNumber.toLowerCase().includes(searchLower) ||
        (quote && quote.quoteNumber.toLowerCase().includes(searchLower)) ||
        (client && client.companyName.toLowerCase().includes(searchLower)) ||
        po.machineSetup?.toLowerCase().includes(searchLower)
      );
    });

  // Watch selected quote to check BAT lock
  useEffect(() => {
    if (!selectedQuoteId) {
      setBatLockActive(false);
      setFormError('');
      return;
    }
    
    // Check if quote has a BAT linked in the store
    const linkedBAT = storeBATs.find(b => b.quoteId === selectedQuoteId);
    
    if (linkedBAT) {
      // Devis requires BAT: Check validation
      if (linkedBAT.status !== 'valide') {
        setBatLockActive(true);
        setFormError("VERROU BAT ACTIF : Impossible de générer un Bon de Production. Le Bon à Tirer (BAT) lié à ce devis n'a pas été validé par le client (Statut actuel: " + linkedBAT.status.toUpperCase() + ").");
      } else {
        setBatLockActive(false);
        setFormError('');
      }
    } else {
      // Devis doesn't require BAT: Directly allowed
      setBatLockActive(false);
      setFormError('');
    }
  }, [selectedQuoteId, storeBATs]);

  // Open Form Modal
  const openFormModal = (po: PurchaseOrder | null = null) => {
    setSelectedPO(po);
    if (po) {
      setSelectedQuoteId(po.quoteId);
      setMachineSetup(po.machineSetup || '');
      // Find instruction in notes or item snapshot description
      setInstructions('');
      setStatus(po.status);
      setDepositAmountFcfa(po.depositAmountFcfa || 0);
    } else {
      const firstQuote = validatedQuotes[0]?.id || '';
      setSelectedQuoteId(firstQuote);
      setMachineSetup(storeMachines[0]?.name || 'Presse Offset Heidelberg');
      setInstructions('');
      setStatus('en_attente_production');
      setDepositAmountFcfa(0);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit PO
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batLockActive) {
      return; // Locked
    }

    setLoading(true);
    setIsModalOpen(false);

    setTimeout(() => {
      const quote = storeQuotes.find(q => q.id === selectedQuoteId);
      const linkedBAT = storeBATs.find(b => b.quoteId === selectedQuoteId);

      if (selectedPO) {
        // Edit PO: update status, machine, notes in store
        const updatedPOs = storePOs.map(p => {
          if (p.id === selectedPO.id) {
            return {
              ...p,
              status,
              machineSetup,
              depositAmountFcfa,
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        });
        useAppStore.setState({ pos: updatedPOs });
      } else {
        // Create PO
        const newPO: PurchaseOrder = {
          id: `po-${Date.now()}`,
          organizationId: currentOrgId,
          orderNumber: `BP-2026-0${storePOs.length + 1}`,
          quoteId: selectedQuoteId,
          batId: linkedBAT?.id || 'direct-po',
          status,
          machineSetup,
          depositAmountFcfa,
          createdBy: currentProfile.fullName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: quote?.items?.map(qi => ({
            id: `poi-${Date.now()}-${qi.id}`,
            purchaseOrderId: `po-${Date.now()}`,
            quoteItemId: qi.id,
            description: qi.descriptionSnapshot,
            finishing: qi.finishingSnapshot || '',
            quantity: qi.quantity,
            sortOrder: qi.sortOrder
          }))
        };
        addPOStore(newPO);
      }
      setLoading(false);
    }, 450);
  };

  // Open Delete Confirm
  const openDeleteConfirm = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDeleteConfirmOpen(true);
  };

  // Handle Delete
  const handleDelete = () => {
    if (!selectedPO) return;
    setLoading(true);
    setIsDeleteConfirmOpen(false);

    setTimeout(() => {
      const filtered = storePOs.filter(p => p.id !== selectedPO.id);
      useAppStore.setState({ pos: filtered });
      setSelectedPO(null);
      setLoading(false);
    }, 450);
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'termine':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'en_cours_impression':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default:
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'termine': return 'Production terminée';
      case 'en_cours_impression': return 'Sous presse';
      default: return 'En attente production';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Suivi des Commandes Atelier (Bons de Production)</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Supervisez les ordres d'impression de l'atelier de presse. Le verrou BAT assure la conformité technique du workflow.
          </p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center justify-center gap-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-full shadow-premium transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Lancer une Production</span>
        </button>
      </div>

      {/* Filters Search Bar */}
      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par n° de bon, client, machine, devis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
          />
        </div>
        <div className="text-xs text-text-secondary font-semibold shrink-0">
          {filteredPOs.length} bon{filteredPOs.length > 1 ? 's' : ''} de production actif{filteredPOs.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden relative min-h-[200px]">
        {loading ? (
          // Component Scale Loading Skeleton
          <div className="p-6 space-y-4 animate-scale-pulse">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2].map((n) => (
                <div key={n} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-main">
              <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-4 sm:px-6 py-4">N° Bon Production</th>
                  <th className="px-4 sm:px-6 py-4">Client / Entreprise</th>
                  <th className="px-4 sm:px-6 py-4">Réf. Devis</th>
                  <th className="px-4 sm:px-6 py-4">Machine assignée</th>
                  <th className="px-4 sm:px-6 py-4">Volume total</th>
                  <th className="px-4 sm:px-6 py-4">Statut production</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredPOs.length > 0 ? (
                  filteredPOs.map((po) => {
                    const quote = storeQuotes.find(q => q.id === po.quoteId);
                    const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
                    const itemsCount = po.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                    
                    return (
                      <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                        {/* PO Number */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold text-text-main">
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>{po.orderNumber}</span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main font-semibold">
                          {client?.companyName || po.id}
                        </td>

                        {/* Quote Ref */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary font-medium">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{quote?.quoteNumber || '-'}</span>
                          </div>
                        </td>

                        {/* Machine */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main">
                          <div className="flex items-center gap-1.5">
                            <Printer className="w-3.5 h-3.5 text-text-secondary" />
                            <span className="font-semibold text-xs">{po.machineSetup}</span>
                          </div>
                        </td>

                        {/* Items count */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main font-bold">
                          {itemsCount.toLocaleString()} tirages
                        </td>

                        {/* Status */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadge(po.status)}`}>
                            {getStatusLabel(po.status)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPO(po);
                                setIsFicheModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                              title="Voir la Fiche Commande Client"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {po.status === 'termine' ? (
                              <span className="p-1.5 rounded-lg text-slate-400 bg-slate-100 dark:bg-slate-800 border border-border-subtle cursor-not-allowed flex items-center gap-1 text-[11px] font-semibold" title="Commande terminée & livrée : Modification verrouillée">
                                <Lock className="w-3.5 h-3.5" />
                                Verrouillée
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => openFormModal(po)}
                                  className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(po)}
                                  className="p-1.5 rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 transition"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary font-medium">
                      Aucun bon de production en cours.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic PO creation Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-lg shadow-premium overflow-hidden transform scale-100 transition duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-base font-bold text-text-main">
                {selectedPO ? 'Modifier le Bon de Production' : 'Lancer un Bon de Production'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* BAT Lock block */}
              {formError && (
                <div className="p-4 border rounded-2xl flex gap-3 text-xs font-semibold leading-relaxed bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-450 animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Devis selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Devis Client Associé *</label>
                  {selectedPO ? (
                    <input
                      type="text"
                      value={storeQuotes.find(q => q.id === selectedPO.quoteId)?.quoteNumber || ''}
                      disabled
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-border-subtle rounded-xl text-sm text-text-secondary cursor-not-allowed"
                    />
                  ) : (
                    <Dropdown
                      options={validatedQuotes.map(q => {
                        const hasBAT = storeBATs.find(b => b.quoteId === q.id);
                        const isBATValide = hasBAT?.status === 'valide';
                        const suffix = hasBAT 
                          ? (isBATValide ? ' (BAT Validé ✅)' : ` (Verrou BAT - ${hasBAT.status.toUpperCase()} ⚠️)`)
                          : ' (Sans BAT ✅)';
                        return {
                          value: q.id,
                          label: `${q.quoteNumber} - ${q.totalFcfa.toLocaleString()} FCFA ${suffix}`
                        };
                      })}
                      value={selectedQuoteId}
                      onChange={(val) => setSelectedQuoteId(val)}
                      placeholder="Sélectionner un Devis..."
                    />
                  )}
                </div>

                {/* Machine Assignment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Machine / Presse de tirage *</label>
                  <Dropdown
                    options={storeMachines.map(m => ({ value: m.name, label: `${m.name} (${m.type})` }))}
                    value={machineSetup}
                    onChange={(val) => setMachineSetup(val)}
                    placeholder="Sélectionner une machine..."
                  />
                </div>

                {/* Production status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Statut du tirage *</label>
                  <Dropdown
                    options={[
                      { value: 'en_attente_production', label: 'En attente production' },
                      { value: 'en_cours_impression', label: 'Sous presse' },
                      { value: 'termine', label: 'Production terminée' }
                    ]}
                    value={status}
                    onChange={(val) => setStatus(val as any)}
                  />
                </div>

                {/* Deposit / Acompte */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Acompte Versé (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={depositAmountFcfa || ''}
                    onChange={(e) => setDepositAmountFcfa(Number(e.target.value))}
                    placeholder="ex: 200000"
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                  {(() => {
                    const quote = storeQuotes.find(q => q.id === selectedQuoteId);
                    if (!quote) return null;
                    return (
                      <p className="text-[10px] text-text-secondary">
                        Total devis : {formatFCFA(quote.totalFcfa)} — Solde restant après acompte : {formatFCFA(Math.max(quote.totalFcfa - (depositAmountFcfa || 0), 0))}
                      </p>
                    );
                  })()}
                </div>

                {/* Technical Instructions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Instructions d'atelier</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="ex: Séchage rapide, Rainage précis, Pliage..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition resize-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={batLockActive}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition shadow-sm ${
                    batLockActive 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-border-subtle' 
                      : 'bg-brand-primary hover:bg-brand-primary-hover text-white'
                  }`}
                >
                  {selectedPO ? 'Sauvegarder' : 'Lancer la production'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Print styles for Fiche Commande Client */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-fiche-area, #print-fiche-area * {
            visibility: visible;
          }
          /* Neutralize the modal's fixed/max-height/overflow ancestors — otherwise they
             clip the printable area even though it's absolutely positioned. */
          .print-modal-backdrop,
          .print-modal-panel,
          .print-modal-scroll {
            position: static !important;
            display: block !important;
            inset: auto !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: none !important;
            box-shadow: none !important;
          }
          #print-fiche-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            padding: 0;
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
          #print-fiche-area table,
          #print-fiche-area tr {
            page-break-inside: avoid;
          }
          /* Hide interactive controls when printing */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Fiche Commande Client Modal */}
      {isFicheModalOpen && selectedPO && (() => {
        const quote = storeQuotes.find(q => q.id === selectedPO.quoteId);
        const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
        const currentOrg = useAppStore.getState().getCurrentOrg();
        
        return (
          <div className="print-modal-backdrop fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
            <div className="print-modal-panel bg-bg-card border border-border-subtle rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-premium overflow-hidden flex flex-col transform scale-100 transition duration-300">

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 no-print shrink-0">
                <h3 className="text-base font-bold text-text-main">
                  Fiche Commande Client • {selectedPO.orderNumber}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="p-2 rounded-xl text-text-secondary hover:text-brand-primary border border-border-subtle bg-bg-card transition shadow-sm flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (isDownloading) return;
                      setIsDownloading(true);
                      try {
                        await downloadElementAsPdf('print-fiche-area', `Commande-${selectedPO.orderNumber}.pdf`);
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    disabled={isDownloading}
                    className="p-2 rounded-xl text-text-secondary hover:text-brand-primary border border-border-subtle bg-bg-card transition shadow-sm flex items-center gap-1 text-[11px] font-bold disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isDownloading ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-text-secondary border-t-transparent animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloading ? 'Génération...' : 'Télécharger'}</span>
                  </button>
                  <button 
                    onClick={() => setIsFicheModalOpen(false)}
                    className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Area - NO MACHINE MENTIONED */}
              <div className="print-modal-scroll overflow-y-auto">
              <div
                id="print-fiche-area"
                className="p-8 bg-white text-slate-800 space-y-5 select-none"
                style={{ fontFamily: 'sans-serif' }}
              >
                {/* Org header row */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-5 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <img src="/Logo_Print_Flow.png" alt="Print_Flow" className="h-10 w-auto object-contain shrink-0" />
                    <div className="space-y-0.5">
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{currentOrg.name}</h2>
                      <p className="text-[10px] text-slate-500">{currentOrg.address || 'Plateau, Dakar'}</p>
                      <p className="text-[10px] text-slate-500">Tél: {currentOrg.phone || '+221 33 800 00 00'}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <h3 className="text-sm font-bold text-slate-400 tracking-wider">FICHE COMMANDE</h3>
                    <p className="text-base font-extrabold text-brand-primary">{selectedPO.orderNumber}</p>
                    <p className="text-[9px] text-slate-500">Émise le: {new Date(selectedPO.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {/* Client info & quote ref */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 text-xs border-b border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Destinataire / Client :</p>
                    <p className="font-bold text-slate-900">{client?.companyName}</p>
                    <p className="text-slate-500">{client?.address || '-'}</p>
                    <p className="text-slate-500">{client?.phone || '-'}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Réf. Devis associé :</p>
                    <p className="text-slate-700 font-semibold">{quote?.quoteNumber}</p>
                    <p className="text-slate-500">BAT lié: {selectedPO.batId}</p>
                    <p className="text-slate-500">Responsable dossier: {selectedPO.createdBy}</p>
                    {!!selectedPO.depositAmountFcfa && (
                      <p className="text-emerald-600 font-bold">Acompte versé: {formatFCFA(selectedPO.depositAmountFcfa)}</p>
                    )}
                  </div>
                </div>

                {/* Items list - NO machine used details */}
                <div className="space-y-3">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Détails des prestations commandées :</p>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-400 text-[10px] font-bold uppercase">
                        <th className="py-2">Prestation / Support</th>
                        <th className="py-2">Finition / Façonnage</th>
                        <th className="py-2 text-right">Quantité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedPO.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 font-semibold">{item.description}</td>
                          <td className="py-3">{item.finishing || 'Standard'}</td>
                          <td className="py-3 text-right font-extrabold text-slate-900">{item.quantity.toLocaleString()} ex.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Terms / Signatures */}
                <div className="border-t border-slate-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] text-slate-400">
                  <div>
                    <p className="font-bold text-slate-600 uppercase">Conditions de livraison :</p>
                    <p className="mt-1">Le client certifie conforme les quantités et caractéristiques techniques présentées sur cette fiche.</p>
                  </div>
                  <div className="text-right space-y-8 sm:space-y-12">
                    <p className="font-bold text-slate-600 uppercase">Bon pour accord (Signature & Cachet) :</p>
                    <div className="border-b border-slate-200 w-32 ml-auto" />
                  </div>
                </div>

              </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/10 no-print shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFicheModalOpen(false)}
                  className="px-5 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                >
                  Fermer
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 p-6 space-y-4">
            <div className="text-rose-500 flex justify-center">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-text-main">Annuler le bon de production</h3>
              <p className="text-xs text-text-secondary">
                Voulez-vous annuler et supprimer le bon de production <span className="font-bold text-text-main">{selectedPO?.orderNumber}</span> ?
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
