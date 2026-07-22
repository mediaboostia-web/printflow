'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  X, 
  Truck, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Calendar,
  Briefcase,
  Printer,
  Download,
  Eye
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { DeliveryNote } from '@/types/domain';
import Dropdown from '@/components/ui/Dropdown';
import { downloadElementAsPdf } from '@/lib/utils/pdf';

export default function LivraisonsPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const currentProfile = useAppStore((state) => state.getCurrentProfile());

  // Store States
  const storeClients = useAppStore((state) => state.clients);
  const storeQuotes = useAppStore((state) => state.quotes);
  const storePOs = useAppStore((state) => state.pos);
  const storeDeliveries = useAppStore((state) => state.deliveries);

  const addDeliveryStore = useAppStore((state) => state.addDelivery);
  const updateDeliveryStatusStore = useAppStore((state) => state.updateDeliveryStatus);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryNote | null>(null);

  // Form states
  const [selectedPOId, setSelectedPOId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveredTo, setDeliveredTo] = useState('');
  const [quantityReady, setQuantityReady] = useState<number>(100);
  const [formError, setFormError] = useState('');

  // Finished POs for selection
  const finishedPOs = storePOs.filter(po =>
    po.organizationId === currentOrgId &&
    po.status === 'termine' &&
    !storeDeliveries.some(d => d.purchaseOrderId === po.id)
  );

  // Status badges
  const getStatusBadge = (status: DeliveryNote['status']) => {
    switch (status) {
      case 'pret_expedition':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'livre':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: DeliveryNote['status']) => {
    switch (status) {
      case 'pret_expedition':
        return 'Prêt à l\'expédition';
      case 'livre':
        return 'Livré & Confirmé';
      default:
        return status;
    }
  };

  // Load client address on PO select
  const handlePOSelect = (poId: string) => {
    setSelectedPOId(poId);
    const po = storePOs.find(p => p.id === poId);
    const quote = po ? storeQuotes.find(q => q.id === po.quoteId) : null;
    const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
    
    if (client) {
      setDeliveryAddress(client.address || '');
      setDeliveredTo(client.contactName || '');
    }

    if (po && po.items && po.items.length > 0) {
      setQuantityReady(po.items[0].quantity);
    }
  };

  // Filter deliveries list
  const filteredDeliveries = storeDeliveries
    .filter(d => d.organizationId === currentOrgId)
    .filter(d => {
      const q = searchQuery.toLowerCase();
      const po = storePOs.find(p => p.id === d.purchaseOrderId);
      const quote = po ? storeQuotes.find(qu => qu.id === po.quoteId) : null;
      const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
      
      return (
        d.deliveryNumber.toLowerCase().includes(q) ||
        (client && client.companyName.toLowerCase().includes(q)) ||
        (d.deliveredTo && d.deliveredTo.toLowerCase().includes(q))
      );
    });

  // Submit delivery note
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPOId) {
      setFormError('Veuillez sélectionner un bon de production terminé.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError('L\'adresse de livraison est requise.');
      return;
    }

    const linkedPO = storePOs.find(p => p.id === selectedPOId);
    const linkedQuote = linkedPO ? storeQuotes.find(q => q.id === linkedPO.quoteId) : null;

    const newDelivery: DeliveryNote = {
      id: `del-${Date.now()}`,
      organizationId: currentOrgId,
      deliveryNumber: `BL-2026-0${storeDeliveries.length + 1}`,
      purchaseOrderId: selectedPOId,
      status: 'pret_expedition',
      deliveredTo: deliveredTo.trim() || undefined,
      createdBy: currentProfile.fullName,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `deli-${Date.now()}`,
          deliveryNoteId: `del-${Date.now()}`,
          description: linkedQuote?.items?.[0]?.descriptionSnapshot || 'Tirages Imprimerie',
          quantityReady: quantityReady || 100
        }
      ]
    };

    addDeliveryStore(newDelivery);
    setIsModalOpen(false);
    setSelectedPOId('');
    setDeliveryAddress('');
    setDeliveredTo('');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Bons de Livraison (BL)</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Suivi des départs d'atelier, récépissés de livraison et déclenchement automatique des factures.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-full shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Bon de Livraison</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un N° BL, client..."
            className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
          />
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-sm overflow-hidden relative min-h-[200px]">
        {loading ? (
          <div className="p-6 space-y-4 animate-scale-pulse">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12" />
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex justify-between items-center py-2 border-b border-border-subtle">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-main">
              <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-4 sm:px-6 py-4">N° Bon Livraison</th>
                  <th className="px-4 sm:px-6 py-4">Client / Entreprise</th>
                  <th className="px-4 sm:px-6 py-4">Réf. Production</th>
                  <th className="px-4 sm:px-6 py-4">Quantité Expédiée</th>
                  <th className="px-4 sm:px-6 py-4">Créé le</th>
                  <th className="px-4 sm:px-6 py-4">Statut BL</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredDeliveries.length > 0 ? (
                  filteredDeliveries.map((del) => {
                    const po = storePOs.find(p => p.id === del.purchaseOrderId);
                    const quote = po ? storeQuotes.find(q => q.id === po.quoteId) : null;
                    const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
                    const qtyDelivered = del.items?.[0]?.quantityReady || 0;
                    
                    return (
                      <tr key={del.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold text-text-main">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span>{del.deliveryNumber}</span>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main font-semibold">
                          {client?.companyName || 'Client Inconnu'}
                        </td>

                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary font-medium">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>{po?.orderNumber || '-'}</span>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main font-bold">
                          {qtyDelivered.toLocaleString()} ex.
                        </td>

                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(del.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadge(del.status)}`}>
                            {getStatusLabel(del.status)}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedDelivery(del);
                                setIsPreviewModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-full border border-border-subtle hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-text-main flex items-center gap-1 transition shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5 text-brand-primary" />
                              <span>Aperçu A4</span>
                            </button>

                            {del.status === 'pret_expedition' ? (
                              <button
                                onClick={() => updateDeliveryStatusStore(del.id, 'livre')}
                                className="text-xs px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                              >
                                Marquer Livré
                              </button>
                            ) : (
                              <span className="text-xs text-text-secondary font-semibold italic flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Livré
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-text-secondary font-medium">
                      Aucun bon de livraison généré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-2xl w-full max-w-lg shadow-xl overflow-hidden transform scale-100 transition duration-300">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-base font-bold text-text-main">
                Créer un Bon de Livraison
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {finishedPOs.length === 0 ? (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50 text-amber-800 text-xs flex gap-2.5 font-medium leading-relaxed">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                  <span>
                    Aucune commande de production n'est actuellement finalisée en atelier (`termine`).
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Commande Terminée à Livrer *</label>
                    <Dropdown
                      value={selectedPOId}
                      onChange={handlePOSelect}
                      options={finishedPOs.map(po => {
                        const quote = storeQuotes.find(q => q.id === po.quoteId);
                        const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
                        return {
                          value: po.id,
                          label: `${po.orderNumber} - ${client?.companyName} (${quote?.quoteNumber})`,
                        };
                      })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Quantité expédiée *</label>
                    <input
                      type="number"
                      value={quantityReady || ''}
                      onChange={(e) => setQuantityReady(Number(e.target.value))}
                      placeholder="100"
                      className="w-full px-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Contact Destinataire</label>
                    <input
                      type="text"
                      value={deliveredTo}
                      onChange={(e) => setDeliveredTo(e.target.value)}
                      placeholder="M. Abdoulaye Diallo..."
                      className="w-full px-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse de Livraison *</label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Adresse physique du destinataire..."
                      className="w-full px-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition resize-none"
                      required
                    />
                  </div>
                </div>
              )}

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
                  disabled={finishedPOs.length === 0}
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  Créer le Bon de Livraison
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Preview A4 Modal */}
      {isPreviewModalOpen && selectedDelivery && (() => {
        const po = storePOs.find(p => p.id === selectedDelivery.purchaseOrderId);
        const quote = po ? storeQuotes.find(q => q.id === po.quoteId) : null;
        const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;

        return (
          <div className="print-modal-backdrop fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
            <div className="print-modal-panel bg-bg-card border border-border-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 no-print shrink-0">
                <h3 className="text-base font-bold text-text-main">
                  Aperçu Bon de Livraison • {selectedDelivery.deliveryNumber}
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
                        await downloadElementAsPdf('print-delivery-area', `BL-${selectedDelivery.deliveryNumber}.pdf`);
                      } finally {
                        setIsDownloading(false);
                      }
                    }}
                    disabled={isDownloading}
                    className="p-2 rounded-xl text-text-secondary hover:text-brand-primary border border-border-subtle bg-bg-card transition shadow-sm flex items-center gap-1 text-[11px] font-bold disabled:opacity-60"
                  >
                    {isDownloading ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>{isDownloading ? 'Génération...' : 'Télécharger'}</span>
                  </button>
                  <button 
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Area */}
              <div className="print-modal-scroll overflow-y-auto p-4 sm:p-6">
                <div
                  id="print-delivery-area"
                  className="bg-white text-slate-900 p-8 w-full max-w-[210mm] mx-auto border border-slate-200 space-y-6"
                >
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                    <div className="flex items-center gap-3">
                      <img src="/Logo_Print_Flow.png" alt="Print_Flow" className="h-10 w-auto object-contain" />
                      <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase">{currentOrg.name}</h2>
                        <p className="text-[10px] text-slate-500">{currentOrg.address || 'Dakar, Sénégal'}</p>
                        <p className="text-[10px] text-slate-500">Tél: {currentOrg.phone || '+221 33 800 00 00'}</p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="inline-block bg-slate-900 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-widest">
                        BON DE LIVRAISON
                      </div>
                      <p className="text-base font-black text-slate-900">{selectedDelivery.deliveryNumber}</p>
                      <p className="text-[11px] text-slate-600">Date: {new Date(selectedDelivery.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest border-b pb-1 mb-1">DESTINATAIRE</p>
                      <p className="text-xs font-black text-slate-900">{client?.companyName || 'Client'}</p>
                      <p className="text-[11px] text-slate-700">Contact: {selectedDelivery.deliveredTo || client?.contactName || 'N/A'}</p>
                      <p className="text-[11px] text-slate-700">Adresse: {client?.address || 'Adresse d\'expedition'}</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest border-b pb-1 mb-1">RÉFÉRENCES TIRAGE</p>
                      <p className="text-[11px] text-slate-700">Réf Production: <span className="font-bold">{po?.orderNumber || '-'}</span></p>
                      <p className="text-[11px] text-slate-700">Statut BL: <span className="font-bold uppercase">{selectedDelivery.status}</span></p>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-900 text-white font-extrabold text-[10px] uppercase">
                        <th className="py-2 px-3 w-10 text-center border-r border-slate-800">N°</th>
                        <th className="py-2 px-4 border-r border-slate-800">Désignation des Travaux Livrés</th>
                        <th className="py-2 px-3 text-center w-28">Quantité Expédiée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      <tr>
                        <td className="py-3 px-3 text-center font-bold border-r">1</td>
                        <td className="py-3 px-4 border-r font-bold text-slate-900">
                          {selectedDelivery.items?.[0]?.description || quote?.items?.[0]?.descriptionSnapshot || 'Tirages Imprimerie'}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-slate-900 text-sm">
                          {(selectedDelivery.items?.[0]?.quantityReady || 100).toLocaleString()} ex.
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200">
                    <div className="border border-slate-200 rounded p-4 h-28 space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Visa Chauffeur / Livreur</p>
                      <p className="text-[10px] text-slate-400 italic pt-6">Signature & Date</p>
                    </div>
                    <div className="border border-slate-200 rounded p-4 h-28 space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Réception Client (Bon pour Réception)</p>
                      <p className="text-[10px] text-slate-400 italic pt-6">Nom, Tampon & Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-delivery-area, #print-delivery-area * {
            visibility: visible;
          }
          .no-print {
            display: none !important;
          }
          #print-delivery-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            width: 100% !important;
            padding: 10mm 12mm !important;
            box-sizing: border-box !important;
            background: white !important;
            color: black !important;
            border: none !important;
            z-index: 999999 !important;
          }
        }
      `}</style>
    </div>
  );
}
