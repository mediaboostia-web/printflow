'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Printer,
  Phone,
  Mail,
  MapPin,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Trash2,
  Image as ImageIcon,
  Layers,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowLeft
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import Dropdown from '@/components/ui/Dropdown';
import { Organization, Product, ProductMaterialType } from '@/types/domain';

const materialLabels: Record<ProductMaterialType, string> = {
  papier: 'Papier',
  textile: 'Textile',
  support_rigide: 'Support Rigide',
  autre: 'Autre',
};

interface CartLine {
  productId: string;
  format: string;
  quantity: number;
}

function getUnitPriceFcfa(product: Product, quantity: number, format: string): number {
  let base = product.unitPriceFcfa;
  if (product.priceTiers && product.priceTiers.length > 0) {
    const tier = product.priceTiers.find(t => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity));
    if (tier) base = tier.unitPriceFcfa;
  }
  const extra = product.formatOptions?.find(f => f.label === format)?.extraPriceFcfa || 0;
  return base + extra;
}

export default function PublicCataloguePage() {
  const params = useParams<{ orgId: string }>();
  const orgId = params.orgId;

  const fetchPublicCatalogue = useAppStore((state) => state.fetchPublicCatalogue);
  const submitPublicOrder = useAppStore((state) => state.submitPublicOrder);

  const [status, setStatus] = useState<'loading' | 'unavailable' | 'ready'>('loading');
  const [org, setOrg] = useState<Organization | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState<'all' | ProductMaterialType>('all');
  const [selections, setSelections] = useState<Record<string, { format: string; quantity: number }>>({});

  const [cart, setCart] = useState<CartLine[]>([]);
  const [panelView, setPanelView] = useState<'closed' | 'cart' | 'form' | 'success'>('closed');
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetchPublicCatalogue(orgId).then(({ org: fetchedOrg, products: fetchedProducts }) => {
      if (!active) return;
      if (!fetchedOrg) {
        setStatus('unavailable');
        return;
      }
      setOrg(fetchedOrg);
      setProducts(fetchedProducts);
      const initialSelections: Record<string, { format: string; quantity: number }> = {};
      fetchedProducts.forEach(p => {
        initialSelections[p.id] = { format: p.format || 'Standard', quantity: p.priceTiers?.[0]?.minQuantity || 1 };
      });
      setSelections(initialSelections);
      setStatus('ready');
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const presentMaterials = useMemo(() => {
    const set = new Set<ProductMaterialType>();
    products.forEach(p => set.add(p.materialType || 'papier'));
    return Array.from(set);
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial = materialFilter === 'all' || (p.materialType || 'papier') === materialFilter;
    return matchesSearch && matchesMaterial;
  });

  const cartDetailed = cart.map(line => {
    const product = products.find(p => p.id === line.productId);
    const unitPriceFcfa = product ? getUnitPriceFcfa(product, line.quantity, line.format) : 0;
    return {
      ...line,
      name: product?.name || 'Produit',
      materialType: product?.materialType,
      unitPriceFcfa,
      lineTotalFcfa: unitPriceFcfa * line.quantity
    };
  });

  const cartCount = cart.reduce((sum, l) => sum + l.quantity, 0);
  const cartSubtotal = cartDetailed.reduce((sum, l) => sum + l.lineTotalFcfa, 0);

  const updateSelection = (productId: string, patch: Partial<{ format: string; quantity: number }>) => {
    setSelections(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...patch }
    }));
  };

  const addToCart = (product: Product) => {
    const sel = selections[product.id] || { format: product.format || 'Standard', quantity: 1 };
    const quantity = Math.max(1, sel.quantity || 1);
    setCart(prev => {
      const existingIdx = prev.findIndex(l => l.productId === product.id && l.format === sel.format);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + quantity };
        return next;
      }
      return [...prev, { productId: product.id, format: sel.format, quantity }];
    });
    setPanelView('cart');
  };

  const updateCartLineQty = (index: number, quantity: number) => {
    setCart(prev => prev.map((l, i) => i === index ? { ...l, quantity: Math.max(1, quantity) } : l));
  };

  const removeCartLine = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!companyName.trim() || !phone.trim()) {
      setSubmitError('Le nom et le téléphone sont obligatoires.');
      return;
    }
    if (cart.length === 0) {
      setSubmitError('Votre panier est vide.');
      return;
    }

    setSubmitting(true);
    const res = await submitPublicOrder(orgId, {
      companyName: companyName.trim(),
      contactName: contactName.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cartDetailed.map(l => ({
        productId: l.productId,
        name: l.name,
        materialType: l.materialType,
        format: l.format,
        quantity: l.quantity,
        unitPriceFcfa: l.unitPriceFcfa,
        lineTotalFcfa: l.lineTotalFcfa
      }))
    });
    setSubmitting(false);

    if (res.success) {
      setOrderNumber(res.orderNumber || '');
      setPanelView('success');
      setCart([]);
    } else {
      setSubmitError(res.error || 'Une erreur est survenue. Réessayez.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4 animate-scale-pulse">
          <div className="h-10 w-40 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unavailable' || !org) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary mx-auto">
            <Printer className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-bold text-text-main">Catalogue indisponible</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Ce catalogue public n'est pas accessible actuellement. Vérifiez le lien fourni par l'imprimerie ou contactez-la directement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-main">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg-card/95 backdrop-blur border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-premium shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-text-main truncate">{org.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-text-secondary">
                {org.phone && <a href={`tel:${org.phone}`} className="flex items-center gap-1 hover:text-brand-primary transition"><Phone className="w-3 h-3" />{org.phone}</a>}
                {org.email && <a href={`mailto:${org.email}`} className="flex items-center gap-1 hover:text-brand-primary transition"><Mail className="w-3 h-3" />{org.email}</a>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-xl border border-border-subtle text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Basculer le thème"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setPanelView('cart')}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{formatFCFA(cartSubtotal)}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
          />
        </div>
        <div className="flex overflow-x-auto gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-border-subtle no-scrollbar whitespace-nowrap w-full">
          <button
            onClick={() => setMaterialFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${materialFilter === 'all' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
          >
            Tous
          </button>
          {presentMaterials.map((mt) => (
            <button
              key={mt}
              onClick={() => setMaterialFilter(mt)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${materialFilter === mt ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              {materialLabels[mt]}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-text-secondary font-medium">Aucun produit ne correspond à votre recherche.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const sel = selections[p.id] || { format: p.format || 'Standard', quantity: 1 };
              const formatChoices = p.formatOptions && p.formatOptions.length > 0 ? p.formatOptions : [{ label: p.format || 'Standard', extraPriceFcfa: 0 }];
              const unitPrice = getUnitPriceFcfa(p, sel.quantity, sel.format);

              return (
                <div key={p.id} className="bg-bg-card rounded-3xl border border-border-subtle shadow-premium overflow-hidden flex flex-col">
                  <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-border-subtle relative shrink-0">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-text-secondary opacity-50" />
                    )}
                    <span className="absolute top-3 right-3 px-3 py-1 bg-brand-primary/90 text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {materialLabels[p.materialType || 'papier']}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-text-main">{p.name}</h3>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{p.description || 'Impression professionnelle sur mesure.'}</p>
                    </div>

                    <div className="space-y-2.5">
                      {formatChoices.length > 1 ? (
                        <Dropdown
                          value={sel.format}
                          onChange={(v) => updateSelection(p.id, { format: v })}
                          options={formatChoices.map(f => ({ value: f.label, label: f.extraPriceFcfa ? `${f.label} (+${formatFCFA(f.extraPriceFcfa)})` : f.label }))}
                        />
                      ) : (
                        <div className="px-3 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs text-text-secondary">
                          Format : <span className="font-bold text-text-main">{sel.format}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 border border-border-subtle rounded-xl overflow-hidden shrink-0">
                          <button
                            type="button"
                            onClick={() => updateSelection(p.id, { quantity: Math.max(1, sel.quantity - 1) })}
                            className="p-2 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            value={sel.quantity}
                            onChange={(e) => updateSelection(p.id, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                            className="w-14 text-center text-xs font-bold bg-transparent focus:outline-none text-text-main"
                          />
                          <button
                            type="button"
                            onClick={() => updateSelection(p.id, { quantity: sel.quantity + 1 })}
                            className="p-2 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-extrabold text-brand-primary text-right">{formatFCFA(unitPrice)} <span className="text-[10px] font-medium text-text-secondary">/u</span></span>
                      </div>

                      <button
                        onClick={() => addToCart(p)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Ajouter à la commande
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-[11px] text-text-secondary">
        Catalogue propulsé par Print_Flow — les tarifs affichés sont indicatifs et confirmés par {org.name} après validation.
      </footer>

      {/* Cart / Checkout / Success panel */}
      {panelView !== 'closed' && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-md shadow-premium overflow-hidden max-h-[90vh] flex flex-col">
            {panelView === 'cart' && (
              <>
                <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 shrink-0">
                  <h3 className="text-base font-bold text-text-main">Votre commande</h3>
                  <button onClick={() => setPanelView('closed')} className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto flex-1">
                  {cartDetailed.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-10">Votre panier est vide.</p>
                  ) : (
                    cartDetailed.map((line, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-border-subtle">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-text-main truncate">{line.name}</p>
                          <p className="text-[11px] text-text-secondary">{line.format} · {formatFCFA(line.unitPriceFcfa)}/u</p>
                          <div className="flex items-center gap-1 mt-1.5 border border-border-subtle rounded-lg overflow-hidden w-fit">
                            <button onClick={() => updateCartLineQty(idx, line.quantity - 1)} className="p-1 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center text-[11px] font-bold">{line.quantity}</span>
                            <button onClick={() => updateCartLineQty(idx, line.quantity + 1)} className="p-1 text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div className="text-right shrink-0 space-y-1.5">
                          <p className="text-xs font-extrabold text-brand-primary">{formatFCFA(line.lineTotalFcfa)}</p>
                          <button onClick={() => removeCartLine(idx)} className="p-1.5 rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cartDetailed.length > 0 && (
                  <div className="px-6 py-4 border-t border-border-subtle space-y-3 shrink-0 bg-slate-50 dark:bg-slate-800/20">
                    <div className="flex justify-between text-sm font-bold text-text-main">
                      <span>Total estimé</span>
                      <span className="text-brand-primary">{formatFCFA(cartSubtotal)}</span>
                    </div>
                    <button
                      onClick={() => setPanelView('form')}
                      className="w-full py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                    >
                      Valider la commande
                    </button>
                  </div>
                )}
              </>
            )}

            {panelView === 'form' && (
              <>
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3 bg-slate-50 dark:bg-slate-800/20 shrink-0">
                  <button onClick={() => setPanelView('cart')} className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-base font-bold text-text-main">Vos coordonnées</h3>
                </div>
                <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 overflow-y-auto flex-1">
                  {submitError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom de l'entreprise / Contact *</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom du contact</label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Téléphone *</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                        className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">E-mail</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse de livraison</label>
                    <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Notes / Instructions</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition resize-none" />
                  </div>
                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-text-main">
                    <span>Total estimé</span>
                    <span className="text-brand-primary">{formatFCFA(cartSubtotal)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Envoi en cours...' : 'Envoyer la commande'}
                  </button>
                </form>
              </>
            )}

            {panelView === 'success' && (
              <div className="p-8 text-center space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-text-main">Commande transmise avec succès !</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Votre commande N° <span className="font-mono font-bold text-brand-primary">{orderNumber}</span> a bien été enregistrée par <strong>{org.name}</strong>.
                  </p>
                  <p className="text-xs text-text-secondary">
                    Notre équipe va valider votre dossier et vous recontacter directement au <span className="font-bold text-text-main">{phone}</span>.
                  </p>
                </div>
                {org.phone && (
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${org.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${org.name}, je viens de passer la commande en ligne N° ${orderNumber}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Contacter l'atelier sur WhatsApp</span>
                    </a>
                  </div>
                )}
                <button
                  onClick={() => setPanelView('closed')}
                  className="w-full py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
