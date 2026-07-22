'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  FilePlus,
  Percent,
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  Eye,
  Printer,
  Download,
  Clock
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import { downloadElementAsPdf } from '@/lib/utils/pdf';
import { Client, Quote, QuoteItem, BAT, Product } from '@/types/domain';
import { mockProducts } from '@/lib/mock/data';
import Dropdown from '@/components/ui/Dropdown';
import SuccessModal from '@/components/ui/SuccessModal';

export default function DevisPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  
  // Store States
  const storeClients = useAppStore((state) => state.clients);
  const storeQuotes = useAppStore((state) => state.quotes);
  const storeTaxes = useAppStore((state) => state.taxes);
  const addClientStore = useAppStore((state) => state.addClient);
  const editClientStore = useAppStore((state) => state.editClient);
  const deleteClientStore = useAppStore((state) => state.deleteClient);
  const addQuoteStore = useAppStore((state) => state.addQuote);
  const editQuoteStore = useAppStore((state) => state.editQuote);
  const updateQuoteStatusStore = useAppStore((state) => state.updateQuoteStatus);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());

  // Tab state: 'list' (devis list), 'create' (quote creation), 'clients' (client database)
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'clients'>('list');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Clients search query
  const [clientSearch, setClientSearch] = useState('');

  // Skeletons pulse loading
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleteClientOpen, setIsDeleteClientOpen] = useState(false);

  // Client Form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [clientFormError, setClientFormError] = useState('');

  // Quote Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [requiresBAT, setRequiresBAT] = useState(false);
  const [notes, setNotes] = useState('');
  const [globalVatRate, setGlobalVatRate] = useState<number>(18);
  const [quoteItems, setQuoteItems] = useState<{
    productId: string;
    description: string;
    paperType: string;
    finishing: string;
    quantity: number;
    unitPriceFcfa: number;
    vatRate: number;
  }[]>([
    { productId: '', description: '', paperType: '', finishing: '', quantity: 100, unitPriceFcfa: 0, vatRate: 18 }
  ]);
  const [quoteFormError, setQuoteFormError] = useState('');
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Preview / print / download
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewQuoteId, setPreviewQuoteId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Success confirmation
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter lists by organization boundary
  const filteredClients = storeClients
    .filter(c => c.organizationId === currentOrgId)
    .filter(c => {
      const q = clientSearch.toLowerCase();
      return c.companyName.toLowerCase().includes(q) || 
             (c.contactName && c.contactName.toLowerCase().includes(q)) || 
             (c.phone && c.phone.includes(q));
    });

  const filteredQuotes = storeQuotes
    .filter(q => q.organizationId === currentOrgId)
    .filter(q => {
      const query = searchQuery.toLowerCase();
      const client = storeClients.find(c => c.id === q.clientId);
      return q.quoteNumber.toLowerCase().includes(query) || 
             (client && client.companyName.toLowerCase().includes(query));
    });

  const storeProducts = useAppStore((state) => state.products);
  const orgProducts = storeProducts.filter(p => p.organizationId === currentOrgId && p.isActive !== false);

  const getProductUnitPrice = (product: Product, quantity: number): number => {
    if (product.priceTiers && product.priceTiers.length > 0) {
      const matchingTier = product.priceTiers.find(
        t => quantity >= t.minQuantity && (t.maxQuantity === undefined || t.maxQuantity === null || quantity <= t.maxQuantity)
      );
      if (matchingTier) {
        return Number(matchingTier.unitPriceFcfa);
      }
    }
    return Number(product.unitPriceFcfa);
  };

  // Quote Item changes with Automatic Catalog Product Detection & Tier Pricing
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...quoteItems];
    const currentItem = newItems[index];

    if (field === 'productId') {
      const product = orgProducts.find(p => p.id === value);
      if (product) {
        const qty = currentItem.quantity || 100;
        const unitPrice = getProductUnitPrice(product, qty);
        const paperStr = product.paperType
          ? `${product.paperType}${product.grammageG ? ` ${product.grammageG}g` : ''}`
          : '';
        newItems[index] = {
          ...currentItem,
          productId: product.id,
          description: `${product.name}${product.format ? ` (${product.format})` : ''}${product.description ? ` - ${product.description}` : ''}`,
          paperType: paperStr,
          finishing: product.finishing || '',
          unitPriceFcfa: unitPrice,
          quantity: qty,
          vatRate: globalVatRate
        };
      } else {
        newItems[index] = {
          ...currentItem,
          productId: ''
        };
      }
    } else if (field === 'description') {
      const typedText = String(value);
      newItems[index] = { ...currentItem, description: typedText };

      // Auto-detect matching product from catalog if not manually linked yet
      if (typedText.trim().length >= 2) {
        const searchLower = typedText.trim().toLowerCase();
        const matched = orgProducts.find(p => 
          p.name.toLowerCase() === searchLower ||
          p.name.toLowerCase().includes(searchLower) ||
          searchLower.includes(p.name.toLowerCase())
        );
        if (matched) {
          const qty = currentItem.quantity || 100;
          const unitPrice = getProductUnitPrice(matched, qty);
          const paperStr = matched.paperType
            ? `${matched.paperType}${matched.grammageG ? ` ${matched.grammageG}g` : ''}`
            : '';
          newItems[index] = {
            ...newItems[index],
            productId: matched.id,
            paperType: currentItem.paperType || paperStr,
            finishing: currentItem.finishing || matched.finishing || '',
            unitPriceFcfa: currentItem.unitPriceFcfa > 0 ? currentItem.unitPriceFcfa : unitPrice
          };
        }
      }
    } else if (field === 'quantity') {
      const newQty = Number(value);
      newItems[index] = { ...currentItem, quantity: newQty };
      if (currentItem.productId) {
        const product = orgProducts.find(p => p.id === currentItem.productId);
        if (product) {
          newItems[index].unitPriceFcfa = getProductUnitPrice(product, newQty);
        }
      }
    } else {
      newItems[index] = {
        ...currentItem,
        [field]: value
      };
    }

    setQuoteItems(newItems);
  };

  // Add/Remove Item Row
  const addQuoteItemRow = () => {
    setQuoteItems([...quoteItems, { productId: '', description: '', paperType: '', finishing: '', quantity: 100, unitPriceFcfa: 0, vatRate: 18 }]);
  };

  const removeQuoteItemRow = (index: number) => {
    if (quoteItems.length === 1) return;
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  // Client CRUD submit
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setClientFormError("Nom de l'entreprise requis");
      return;
    }

    setActionLoading(true);
    setIsClientModalOpen(false);

    setTimeout(() => {
      if (selectedClient) {
        editClientStore({
          ...selectedClient,
          companyName,
          contactName,
          phone,
          email,
          address,
          updatedAt: new Date().toISOString()
        });
      } else {
        addClientStore({
          companyName,
          contactName,
          phone,
          email,
          address,
          createdBy: currentProfile?.fullName || 'Commercial'
        });
        setSuccessTitle('Client ajouté avec succès');
        setSuccessMessage(`"${companyName}" a été ajouté à votre base clients.`);
        setIsSuccessOpen(true);
      }
      setActionLoading(false);
    }, 450);
  };

  // Open Client Modal
  const openClientModal = (client: Client | null = null) => {
    setSelectedClient(client);
    if (client) {
      setCompanyName(client.companyName);
      setContactName(client.contactName || '');
      setPhone(client.phone || '');
      setEmail(client.email || '');
      setAddress(client.address || '');
    } else {
      setCompanyName('');
      setContactName('');
      setPhone('');
      setEmail('');
      setAddress('');
    }
    setClientFormError('');
    setIsClientModalOpen(true);
  };

  // Delete Client
  const handleDeleteClient = () => {
    if (!selectedClient) return;
    setActionLoading(true);
    setIsDeleteClientOpen(false);
    setTimeout(() => {
      deleteClientStore(selectedClient.id);
      setSelectedClient(null);
      setActionLoading(false);
    }, 450);
  };

  // Form Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    quoteItems.forEach(item => {
      subtotal += item.quantity * item.unitPriceFcfa;
    });
    const vatAmount = subtotal * (globalVatRate / 100);
    return {
      subtotal,
      vatAmount,
      total: subtotal + vatAmount
    };
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  // Quote Submission
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      setQuoteFormError('Veuillez sélectionner un client.');
      return;
    }
    if (quoteItems.some(item => !item.description || item.unitPriceFcfa <= 0 || item.quantity <= 0)) {
      setQuoteFormError('Veuillez remplir correctement toutes les lignes du devis.');
      return;
    }

    setActionLoading(true);

    setTimeout(() => {
      if (editingQuoteId) {
        // Edit existing quote in place — keep number, creator, creation date and status
        const original = storeQuotes.find(q => q.id === editingQuoteId);
        if (original) {
          const updatedQuote: Quote = {
            ...original,
            clientId: selectedClientId,
            subtotalFcfa: subtotal,
            vatAmountFcfa: vatAmount,
            totalFcfa: total,
            notes,
            updatedAt: new Date().toISOString(),
            items: quoteItems.map((item, idx) => ({
              id: `qi-${Date.now()}-${idx}`,
              quoteId: editingQuoteId,
              productId: item.productId || undefined,
              descriptionSnapshot: item.description,
              paperSnapshot: item.paperType || undefined,
              finishingSnapshot: item.finishing || undefined,
              quantity: Number(item.quantity),
              unitPriceFcfa: Number(item.unitPriceFcfa),
              vatRate: globalVatRate,
              lineTotalFcfa: Number(item.quantity * item.unitPriceFcfa),
              sortOrder: idx
            }))
          };
          editQuoteStore(updatedQuote);
        }

        setEditingQuoteId(null);
      } else {
        const newQuoteId = `quote-${Date.now()}`;
        const newQuoteNumber = `DEV-2026-0${storeQuotes.length + 1}`;

        const newQuote: Quote = {
          id: newQuoteId,
          organizationId: currentOrgId,
          quoteNumber: newQuoteNumber,
          clientId: selectedClientId,
          status: 'en_attente',
          subtotalFcfa: subtotal,
          vatAmountFcfa: vatAmount,
          totalFcfa: total,
          notes,
          createdBy: currentProfile.fullName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: quoteItems.map((item, idx) => ({
            id: `qi-${Date.now()}-${idx}`,
            quoteId: newQuoteId,
            productId: item.productId || undefined,
            descriptionSnapshot: item.description,
            paperSnapshot: item.paperType || undefined,
            finishingSnapshot: item.finishing || undefined,
            quantity: Number(item.quantity),
            unitPriceFcfa: Number(item.unitPriceFcfa),
            vatRate: globalVatRate,
            lineTotalFcfa: Number(item.quantity * item.unitPriceFcfa),
            sortOrder: idx
          }))
        };

        // Add to store
        addQuoteStore(newQuote);

        // Logical hook: If requiresBAT, create BAT object in Zustand store
        if (requiresBAT) {
          const newBAT: BAT = {
            id: `bat-${Date.now()}`,
            organizationId: currentOrgId,
            quoteId: newQuoteId,
            status: 'en_attente',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            versions: []
          };
          // Add BAT directly into state store
          useAppStore.setState(state => ({ bats: [newBAT, ...state.bats] }));
        }

        setSuccessTitle('Devis créé avec succès');
        setSuccessMessage(`${newQuoteNumber} a été généré et enregistré.`);
        setIsSuccessOpen(true);
      }

      // Reset
      setSelectedClientId('');
      setRequiresBAT(false);
      setNotes('');
      setQuoteItems([{ productId: '', description: '', paperType: '', finishing: '', quantity: 100, unitPriceFcfa: 0, vatRate: 18 }]);

      setActiveTab('list');
      setActionLoading(false);
    }, 500);
  };

  // Open a quote for editing (pending quotes only)
  const openEditQuote = (q: Quote) => {
    setEditingQuoteId(q.id);
    setSelectedClientId(q.clientId);
    setNotes(q.notes || '');
    setGlobalVatRate(q.items?.[0]?.vatRate || 18);
    setQuoteItems(
      (q.items || []).map(item => ({
        productId: item.productId || '',
        description: item.descriptionSnapshot,
        paperType: item.paperSnapshot || '',
        finishing: item.finishingSnapshot || '',
        quantity: item.quantity,
        unitPriceFcfa: item.unitPriceFcfa,
        vatRate: item.vatRate
      }))
    );
    setQuoteFormError('');
    setActiveTab('create');
  };

  // Open the A4 preview / print / download modal
  const openPreview = (quoteId: string) => {
    setPreviewQuoteId(quoteId);
    setIsPreviewOpen(true);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Generates a real PDF client-side (html2canvas + jsPDF) — no print dialog involved
  const handleDownload = async () => {
    const quote = storeQuotes.find(q => q.id === previewQuoteId);
    if (!quote || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadElementAsPdf('print-quote-area', `Devis-${quote.quoteNumber}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'valide':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'refuse':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-100 dark:border-rose-900/30';
      default:
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    }
  };

  const hasBATLinked = (quoteId: string) => {
    const storeBATs = useAppStore.getState().bats;
    return storeBATs.some(b => b.quoteId === quoteId);
  };

  return (
    <div className="space-y-6">

      {/* CSS print style to print only the A4 preview box */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          #print-quote-area, #print-quote-area * {
            visibility: visible;
          }
          .no-print, header, aside, nav, button, select, input {
            display: none !important;
          }
          .print-modal-backdrop,
          .print-modal-panel,
          .print-modal-scroll {
            position: static !important;
            display: block !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
          #print-quote-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10mm 12mm !important;
            box-sizing: border-box !important;
            background: white !important;
            color: black !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            z-index: 999999 !important;
          }
          #print-quote-area table,
          #print-quote-area tr,
          #print-quote-area .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-border-subtle w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'list' 
                ? 'bg-bg-card text-text-main shadow-sm' 
                : 'text-text-secondary hover:text-text-main'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Tableau des Devis</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('create');
              // Auto prefill first client if available
              const clientsForOrg = storeClients.filter(c => c.organizationId === currentOrgId);
              if (clientsForOrg.length > 0 && !selectedClientId) {
                setSelectedClientId(clientsForOrg[0].id);
              }
            }}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'create' 
                ? 'bg-bg-card text-text-main shadow-sm' 
                : 'text-text-secondary hover:text-text-main'
            }`}
          >
            <FilePlus className="w-4 h-4" />
            <span>Créer un Devis</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 sm:flex-initial px-5 py-2 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'clients' 
                ? 'bg-bg-card text-text-main shadow-sm' 
                : 'text-text-secondary hover:text-text-main'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Base Clients</span>
          </button>
        </div>
      </div>

      {/* Main Sections */}
      {actionLoading ? (
        // Component Scale Loading Skeletons
        <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 animate-scale-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map(n => (
            <div key={n} className="flex justify-between items-center py-3 border-b border-border-subtle">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: LIST DEVIS */}
          {activeTab === 'list' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher un devis, un client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>
                <div className="text-xs text-text-secondary font-semibold shrink-0">
                  {filteredQuotes.length} devis émis
                </div>
              </div>

              <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-text-main">
                    <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      <tr>
                        <th className="px-4 sm:px-6 py-4">N° Devis</th>
                        <th className="px-4 sm:px-6 py-4">Client / Entreprise</th>
                        <th className="px-4 sm:px-6 py-4">Créé le</th>
                        <th className="px-4 sm:px-6 py-4">Option BAT</th>
                        <th className="px-4 sm:px-6 py-4 text-right">Montant TTC</th>
                        <th className="px-4 sm:px-6 py-4">Statut</th>
                        <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {filteredQuotes.length > 0 ? (
                        filteredQuotes.map((q) => {
                          const client = storeClients.find(c => c.id === q.clientId);
                          const needsBAT = hasBATLinked(q.id);
                          return (
                            <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold text-text-main">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  <span>{q.quoteNumber}</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold">
                                {client?.companyName || 'Client Inconnu'}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs">
                                {new Date(q.createdAt).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  needsBAT 
                                    ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-900/30' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-text-secondary border-border-subtle'
                                }`}>
                                  {needsBAT ? 'Nécessite BAT' : 'Sans BAT'}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-extrabold text-brand-primary">
                                {formatFCFA(q.totalFcfa)}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadge(q.status)}`}>
                                  {q.status === 'valide' ? 'Accepté' : q.status === 'refuse' ? 'Refusé' : 'En attente'}
                                </span>
                              </td>
                              {/* Actions columns */}
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => openPreview(q.id)}
                                    title="Aperçu / Imprimer / Télécharger"
                                    className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  {q.status === 'en_attente' && (
                                    <>
                                      <button
                                        onClick={() => openEditQuote(q)}
                                        title="Modifier le devis"
                                        className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => updateQuoteStatusStore(q.id, 'valide')}
                                        className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-bold transition border border-emerald-500/20"
                                      >
                                        Accepter
                                      </button>
                                      <button
                                        onClick={() => updateQuoteStatusStore(q.id, 'refuse')}
                                        className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-450 hover:text-white font-bold transition border border-rose-500/20"
                                      >
                                        Refuser
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
                            Aucun devis enregistré.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE DEVIS */}
          {activeTab === 'create' && (
            <form onSubmit={handleQuoteSubmit} className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-6 max-w-4xl mx-auto animate-fade-in">
              <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-text-main font-bold">
                <Calculator className="w-5 h-5 text-brand-primary" />
                <h3>{editingQuoteId ? 'Modifier le Devis' : "Formulaire d'Établissement de Devis"}</h3>
              </div>

              {quoteFormError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{quoteFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Client Select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Client Associé *</label>
                  <Dropdown
                    options={storeClients.filter(c => c.organizationId === currentOrgId).map(c => ({
                      value: c.id,
                      label: `${c.companyName} (${c.contactName || 'Pas de contact'})`
                    }))}
                    value={selectedClientId}
                    onChange={(val) => setSelectedClientId(val)}
                    placeholder="Choisir un client..."
                  />
                </div>

                {/* BAT Toggle option — locked once the quote already exists */}
                {!editingQuoteId && (
                  <div className="flex items-center justify-between sm:justify-start sm:gap-4 pt-6">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">BAT Obligatoire :</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requiresBAT}
                        onChange={(e) => setRequiresBAT(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                      <span className="ml-3 text-xs font-bold text-text-main">
                        {requiresBAT ? 'Oui, exige un BAT' : 'Non, impression directe'}
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Dynamic Quote Items grid rows */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Lignes du devis (Articles)</label>
                  <button
                    type="button"
                    onClick={addQuoteItemRow}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Ajouter une ligne</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {quoteItems.map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800/20 border border-border-subtle rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end relative">
                      
                      {/* Product Selector */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Fiche Produit (Modèle)</label>
                        <Dropdown
                          options={[
                            { value: '', label: '-- Personnalisé --' },
                            ...orgProducts.map(p => ({ value: p.id, label: `${p.name} (${p.format})` }))
                          ]}
                          value={item.productId}
                          onChange={(val) => handleItemChange(index, 'productId', val)}
                        />
                      </div>

                      {/* Description Snapshot */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Description / Support *</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Description de la prestation..."
                          className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-main transition"
                          required
                        />
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Quantité *</label>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          placeholder="100"
                          min="1"
                          className="w-full px-3 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-main transition font-bold"
                          required
                        />
                      </div>

                      {/* Unit Price FCFA */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">P.U. (FCFA) *</label>
                        <input
                          type="number"
                          value={item.unitPriceFcfa || ''}
                          onChange={(e) => handleItemChange(index, 'unitPriceFcfa', Number(e.target.value))}
                          placeholder="P.U."
                          min="1"
                          className="w-full px-3 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary text-text-main transition font-bold"
                          required
                        />
                      </div>

                      {/* Row Delete Button */}
                      <div className="md:col-span-1 flex justify-center pb-1">
                        <button
                          type="button"
                          onClick={() => removeQuoteItemRow(index)}
                          disabled={quoteItems.length === 1}
                          className={`p-2.5 rounded-xl transition ${
                            quoteItems.length === 1 
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                              : 'text-text-secondary hover:text-rose-600 hover:bg-rose-500/10'
                          }`}
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Auto-detected Product Badge */}
                      {item.productId && (
                        <div className="md:col-span-12 flex items-center gap-1.5 pt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            Produit du catalogue identifié : <strong>{orgProducts.find(p => p.id === item.productId)?.name}</strong> — Tarif auto-ajusté : <strong>{formatFCFA(item.unitPriceFcfa)}</strong> / unité
                          </span>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Global Tax selector grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Notes */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Notes & Conditions Spéciales</label>
                  <textarea
                    rows={2.5}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes imprimées sur le devis (délais de livraison, acompte de 30% requis, validité de l'offre)..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition resize-none"
                  />
                </div>

                {/* Global Tax Selector */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Taux de TVA Global *</label>
                  <Dropdown
                    options={storeTaxes.map(t => ({ value: t.rate, label: `${t.name} (${t.rate}%)` }))}
                    value={globalVatRate}
                    onChange={(val) => setGlobalVatRate(Number(val))}
                  />
                  <p className="text-[10px] text-text-secondary mt-1">Appliqué directement sur le total HT cumulé.</p>
                </div>
              </div>

              {/* Real-time sum display */}
              <div className="p-5 bg-bg-base border border-border-subtle rounded-2xl flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-6 text-center md:text-left">
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-text-secondary font-bold uppercase tracking-wider truncate">Sous-Total HT</p>
                    <p className="text-sm sm:text-base font-bold text-text-main mt-0.5 truncate">{formatFCFA(subtotal)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] text-text-secondary font-bold uppercase tracking-wider truncate">Montant Taxes</p>
                    <p className="text-sm sm:text-base font-bold text-text-main mt-0.5 truncate">{formatFCFA(vatAmount)}</p>
                  </div>
                  <div className="min-w-0 sm:border-l sm:border-border-subtle sm:pl-6">
                    <p className="text-[9px] sm:text-[10px] text-text-secondary font-bold uppercase tracking-wider truncate">Total TTC</p>
                    <p className="text-base sm:text-lg font-extrabold text-brand-primary mt-0.5 truncate">{formatFCFA(total)}</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuoteId(null);
                      setSelectedClientId('');
                      setNotes('');
                      setRequiresBAT(false);
                      setQuoteItems([{ productId: '', description: '', paperType: '', finishing: '', quantity: 100, unitPriceFcfa: 0, vatRate: 18 }]);
                      setActiveTab('list');
                    }}
                    className="px-5 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
                  >
                    {editingQuoteId ? 'Sauvegarder les Modifications' : 'Générer et Enregistrer le Devis'}
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* TAB 3: BASE CLIENTS */}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md w-full">
                  <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher par entreprise, contact, numéro..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>
                <button
                  onClick={() => openClientModal(null)}
                  className="flex items-center justify-center gap-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded-full shadow-premium transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Client</span>
                </button>
              </div>

              <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-text-main">
                    <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                      <tr>
                        <th className="px-4 sm:px-6 py-4">Nom de l'Entreprise</th>
                        <th className="px-4 sm:px-6 py-4">Contact</th>
                        <th className="px-4 sm:px-6 py-4">Numéro</th>
                        <th className="px-4 sm:px-6 py-4">Adresse / Siège</th>
                        <th className="px-4 sm:px-6 py-4">Email</th>
                        <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-slate-400" />
                                <span>{c.companyName}</span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main font-medium">
                              {c.contactName || '-'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-brand-primary font-semibold">
                              {c.phone || '-'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs">
                              {c.address || '-'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs">
                              {c.email || '-'}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openClientModal(c)}
                                  className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setSelectedClient(c); setIsDeleteClientOpen(true); }}
                                  className="p-1.5 rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-text-secondary font-medium">
                            Aucun client enregistré.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Client Add/Edit Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-lg shadow-premium overflow-hidden transform scale-100 transition duration-300">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-base font-bold text-text-main">
                {selectedClient ? 'Modifier le Client' : 'Ajouter un Nouveau Client'}
              </h3>
              <button 
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              {clientFormError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                  <XCircle className="w-4 h-4" />
                  <span>{clientFormError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom de l'Entreprise *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="SENELEC, Sonatel..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Contact Principal</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="M. Diallo..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Numéro de Téléphone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 77..."
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@mail.com"
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Quartier / Siège</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dakar, Sénégal..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition"
                >
                  {selectedClient ? 'Sauvegarder' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Client Confirmation */}
      {isDeleteClientOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 p-6 space-y-4">
            <div className="text-rose-500 flex justify-center">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-text-main">Supprimer le client</h3>
              <p className="text-xs text-text-secondary">
                Voulez-vous supprimer le client <span className="font-bold text-text-main">{selectedClient?.companyName}</span> ?
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteClientOpen(false)}
                className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteClient}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Preview / Print / Download Modal */}
      {isPreviewOpen && previewQuoteId && (() => {
        const previewQuote = storeQuotes.find(q => q.id === previewQuoteId);
        if (!previewQuote) return null;
        const previewClient = storeClients.find(c => c.id === previewQuote.clientId);

        return (
          <div className="print-modal-backdrop fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
            <div className="print-modal-panel bg-bg-card border border-border-subtle rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-premium overflow-hidden flex flex-col transform scale-100 transition duration-300">

              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 no-print shrink-0">
                <h3 className="text-base font-bold text-text-main">
                  Devis {previewQuote.quoteNumber}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-2 rounded-xl text-text-secondary hover:text-brand-primary border border-border-subtle bg-bg-card transition shadow-sm flex items-center gap-1 text-[11px] font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Imprimer</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="p-2 rounded-xl text-text-secondary hover:text-brand-primary border border-border-subtle bg-bg-card transition shadow-sm flex items-center gap-1 text-[11px] font-bold disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isDownloading ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-text-secondary border-t-transparent animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{isDownloading ? 'Génération...' : 'Télécharger'}</span>
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable A4 preview area */}
              <div className="print-modal-scroll overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/40">
                <div
                  id="print-quote-area"
                  className="bg-white text-slate-900 p-8 sm:p-10 w-full max-w-[210mm] mx-auto border border-slate-200 shadow-md rounded-none print:border-none print:shadow-none print:p-0 font-sans"
                >
                  {/* TOP BRANDING & DEVIS HEADER */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                    {/* Left: Organization Logo / Name & Details */}
                    <div className="space-y-2 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-3">
                        <img src="/Logo_Print_Flow.png" alt="Print_Flow" className="h-10 w-auto object-contain shrink-0" />
                        <div>
                          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-tight">
                            {currentOrg.name}
                          </h2>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Impression & Travaux Graphiques</p>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-100">
                        <p><span className="font-semibold text-slate-800">Adresse :</span> {currentOrg.address || 'Dakar, Sénégal'}</p>
                        <p><span className="font-semibold text-slate-800">Téléphone :</span> {currentOrg.phone || '+221 33 800 00 00'}</p>
                        {currentOrg.email && <p><span className="font-semibold text-slate-800">Email :</span> {currentOrg.email}</p>}
                      </div>
                    </div>

                    {/* Right: DEVIS Title & Metadata */}
                    <div className="text-right space-y-1">
                      <div className="inline-block bg-slate-900 text-white px-3.5 py-1 rounded text-xs font-black uppercase tracking-widest mb-1">
                        DEVIS DE PRESTATION
                      </div>
                      <p className="text-base font-black text-slate-900 tracking-tight">
                        N° {previewQuote.quoteNumber}
                      </p>
                      <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                        <p><span className="font-semibold text-slate-800">Date d'émission :</span> {new Date(previewQuote.createdAt).toLocaleDateString('fr-FR')}</p>
                        <p><span className="font-semibold text-slate-800">Validité :</span> 30 jours</p>
                        <p><span className="font-semibold text-slate-800">Établi par :</span> {previewQuote.createdBy}</p>
                      </div>
                    </div>
                  </div>

                  {/* CLIENT & STATUS CARDS */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {/* Client Info Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-1.5">
                        DESTINATAIRE / CLIENT
                      </p>
                      <p className="text-xs font-black text-slate-900">{previewClient?.companyName || 'Client Inconnu'}</p>
                      {previewClient?.contactName && <p className="text-[11px] text-slate-700"><span className="font-semibold">Contact :</span> {previewClient.contactName}</p>}
                      {previewClient?.address && <p className="text-[11px] text-slate-700"><span className="font-semibold">Adresse :</span> {previewClient.address}</p>}
                      {previewClient?.phone && <p className="text-[11px] text-slate-700"><span className="font-semibold">Tél :</span> {previewClient.phone}</p>}
                    </div>

                    {/* Order & BAT Requirements Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 mb-1.5">
                          CONDITIONS DE PRODUCTION
                        </p>
                        <div className="text-[11px] text-slate-700 space-y-1">
                          <p><span className="font-semibold">Option BAT :</span> {hasBATLinked(previewQuote.id) ? 'Exigé (Validation requise)' : 'Non requis (Impression directe)'}</p>
                          <p><span className="font-semibold">Statut du devis :</span> <span className="font-bold uppercase text-slate-900">{previewQuote.status === 'valide' ? 'Validé / Accepté' : previewQuote.status === 'refuse' ? 'Refusé' : 'En Attente de Validation'}</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TABLE OF ITEMS */}
                  <div className="mb-5 overflow-hidden rounded border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                          <th className="py-2 px-3 w-10 text-center border-r border-slate-800">N°</th>
                          <th className="py-2 px-4 border-r border-slate-800">Désignation & Caractéristiques</th>
                          <th className="py-2 px-3 text-center w-16 border-r border-slate-800">Qte</th>
                          <th className="py-2 px-3 text-right w-28 border-r border-slate-800">P.U. HT (FCFA)</th>
                          <th className="py-2 px-3 text-right w-32">Total HT (FCFA)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {previewQuote.items?.map((item, idx) => (
                          <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                            <td className="py-2.5 px-4 border-r border-slate-200 space-y-0.5">
                              <p className="font-bold text-slate-900 text-xs">{item.descriptionSnapshot}</p>
                              {(item.paperSnapshot || item.finishingSnapshot) && (
                                <p className="text-[10px] text-slate-600">
                                  {item.paperSnapshot && <span>Papier : {item.paperSnapshot}</span>}
                                  {item.paperSnapshot && item.finishingSnapshot && <span> • </span>}
                                  {item.finishingSnapshot && <span>Finition : {item.finishingSnapshot}</span>}
                                </p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900 border-r border-slate-200">{item.quantity.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-slate-700 border-r border-slate-200">{item.unitPriceFcfa.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{item.lineTotalFcfa.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* LOWER SECTION: TERMS & TOTALS */}
                  <div className="grid grid-cols-12 gap-4 items-start mb-5">
                    {/* Left: Terms and Conditions Box */}
                    <div className="col-span-7 bg-slate-50 border border-slate-200 rounded p-3 space-y-1">
                      <p className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1">
                        NOTES & CONDITIONS DE RÈGLEMENT
                      </p>
                      <p className="text-[10px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {previewQuote.notes || 'Devis valable 30 jours à compter de sa date d\'émission. Acompte de 50% à la commande, solde restant à la livraison.'}
                      </p>
                    </div>

                    {/* Right: Totals Summary Box */}
                    <div className="col-span-5 border border-slate-900 rounded overflow-hidden">
                      <div className="bg-slate-900 text-white px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest text-center">
                        RÉCAPITULATIF FINANCIER
                      </div>
                      <div className="p-3 space-y-1.5 text-xs bg-white">
                        <div className="flex justify-between text-slate-700">
                          <span>Montant Total HT :</span>
                          <span className="font-bold">{previewQuote.subtotalFcfa.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>TVA ({previewQuote.items?.[0]?.vatRate || 18}%) :</span>
                          <span className="font-bold">{previewQuote.vatAmountFcfa.toLocaleString()} FCFA</span>
                        </div>
                        <div className="border-t-2 border-slate-900 pt-1.5 flex justify-between items-center text-slate-900">
                          <span className="font-black text-xs uppercase">TOTAL TTC :</span>
                          <span className="font-black text-sm text-slate-900">{previewQuote.totalFcfa.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="border-t border-slate-300 pt-3 text-center text-[9px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700">{currentOrg.name} — Tous travaux d'impression & d'édition</p>
                    <p>Merci pour votre confiance. En cas d'accord, merci de nous retourner ce devis daté et signé avec la mention "Bon pour accord".</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <SuccessModal
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title={successTitle}
        message={successMessage}
      />
    </div>
  );
}
