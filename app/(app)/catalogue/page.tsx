'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Grid,
  List as ListIcon,
  Upload,
  AlertCircle,
  FileText as FormatIcon,
  Check,
  Globe,
  Copy,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
  Power
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import Dropdown from '@/components/ui/Dropdown';
import SuccessModal from '@/components/ui/SuccessModal';
import { Product, ProductFormatOption, ProductMaterialType } from '@/types/domain';

const categories = ['Impression Numérique', 'Impression Offset', 'Grand Format', 'Finition / Découpe', 'Goodies / Gadgets'];

const materialTypes: { value: ProductMaterialType; label: string }[] = [
  { value: 'papier', label: 'Papier' },
  { value: 'textile', label: 'Textile' },
  { value: 'support_rigide', label: 'Support Rigide (Grand Format)' },
  { value: 'autre', label: 'Autre' },
];

export default function CataloguePage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const allProducts = useAppStore((state) => state.products);
  const addProduct = useAppStore((state) => state.addProduct);
  const editProduct = useAppStore((state) => state.editProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);
  const canUsePublicCatalogue = useAppStore((state) => state.canUsePublicCatalogue());
  const toggleCatalogueEnabled = useAppStore((state) => state.toggleCatalogueEnabled);

  const products = allProducts.filter(p => p.organizationId === currentOrgId);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Public catalogue link panel
  const [origin, setOrigin] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Impression Numérique');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<ProductMaterialType>('papier');
  const [paperType, setPaperType] = useState('');
  const [grammageG, setGrammageG] = useState<number | ''>('');
  const [format, setFormat] = useState('');
  const [additionalFormats, setAdditionalFormats] = useState<ProductFormatOption[]>([]);
  const [finishing, setFinishing] = useState('');
  const [unitPriceFcfa, setUnitPriceFcfa] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const publicUrl = `${origin}/catalogue/${currentOrgId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    triggerToast('Lien du catalogue copié !');
  };

  // Handle Search and Category Filter
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.format || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const materialLabel = (mt?: ProductMaterialType) => materialTypes.find(m => m.value === mt)?.label || 'Papier';

  // Handle image upload and conversion to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('La taille de la photo ne doit pas dépasser 2 Mo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Form Modal (Add / Edit)
  const openFormModal = (product: Product | null = null) => {
    setSelectedProduct(product);
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setDescription(product.description || '');
      setMaterialType(product.materialType || 'papier');
      setPaperType(product.paperType || '');
      setGrammageG(product.grammageG ?? '');
      setFormat(product.format || '');
      setAdditionalFormats((product.formatOptions || []).slice(1));
      setFinishing(product.finishing || '');
      setUnitPriceFcfa(product.unitPriceFcfa);
      setPhotoUrl(product.photoUrl || '');
    } else {
      setName('');
      setCategory('Impression Numérique');
      setDescription('');
      setMaterialType('papier');
      setPaperType('');
      setGrammageG('');
      setFormat('');
      setAdditionalFormats([]);
      setFinishing('');
      setUnitPriceFcfa(0);
      setPhotoUrl('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const addFormatRow = () => {
    setAdditionalFormats([...additionalFormats, { label: '', extraPriceFcfa: 0 }]);
  };

  const updateFormatRow = (index: number, field: 'label' | 'extraPriceFcfa', value: string) => {
    setAdditionalFormats(rows => rows.map((row, i) => {
      if (i !== index) return row;
      return field === 'label' ? { ...row, label: value } : { ...row, extraPriceFcfa: Number(value) || 0 };
    }));
  };

  const removeFormatRow = (index: number) => {
    setAdditionalFormats(rows => rows.filter((_, i) => i !== index));
  };

  // Handle submit Add/Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Le nom du produit ou service est obligatoire.');
      return;
    }
    if (!format.trim()) {
      setFormError('Le format principal est obligatoire.');
      return;
    }
    if (unitPriceFcfa <= 0) {
      setFormError('Le prix unitaire doit être supérieur à 0 FCFA.');
      return;
    }

    const cleanedExtras = additionalFormats.filter(f => f.label.trim());
    const formatOptions: ProductFormatOption[] = [
      { label: format.trim(), extraPriceFcfa: 0 },
      ...cleanedExtras.map(f => ({ label: f.label.trim(), extraPriceFcfa: f.extraPriceFcfa || 0 }))
    ];

    const payload = {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      materialType,
      paperType: paperType.trim() || undefined,
      grammageG: grammageG === '' ? undefined : Number(grammageG),
      format: format.trim(),
      formatOptions,
      finishing: finishing.trim() || undefined,
      photoUrl: photoUrl || undefined,
      unitPriceFcfa: Number(unitPriceFcfa),
      vatRate: selectedProduct?.vatRate ?? 18,
      isActive: true,
      priceTiers: selectedProduct?.priceTiers
    };

    setLoading(true);
    setIsModalOpen(false);

    setTimeout(() => {
      if (selectedProduct) {
        editProduct({ ...selectedProduct, ...payload });
      } else {
        addProduct(payload);
        setSuccessMessage(`"${name}" a été ajouté au catalogue.`);
        setIsSuccessOpen(true);
      }
      setLoading(false);
    }, 400);
  };

  // Open Delete Confirm
  const openDeleteConfirm = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  // Handle Delete
  const handleDelete = () => {
    if (!selectedProduct) return;
    setLoading(true);
    setIsDeleteConfirmOpen(false);

    setTimeout(() => {
      deleteProduct(selectedProduct.id);
      setSelectedProduct(null);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-premium z-50 text-xs font-bold flex items-center gap-2 text-white animate-fade-in">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Catalogue d'Impression</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Configurez et proposez vos fiches techniques de tirages, formats de papier, textile, supports rigides et tarifs.
          </p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center justify-center gap-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-full shadow-premium transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un produit</span>
        </button>
      </div>

      {/* Public Catalogue Link Panel (Formule Pro) */}
      {canUsePublicCatalogue ? (
        <div className="bg-bg-card border border-border-subtle rounded-3xl p-6 shadow-premium space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main">Catalogue Public en Ligne</h3>
                <p className="text-xs text-text-secondary">Partagez ce lien pour que vos clients externes commandent directement.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                toggleCatalogueEnabled();
                triggerToast(currentOrg?.catalogueEnabled !== false ? 'Boutique en ligne fermée.' : 'Boutique en ligne ouverte !');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm border cursor-pointer shrink-0 ${
                currentOrg?.catalogueEnabled !== false
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{currentOrg?.catalogueEnabled !== false ? 'Boutique Ouverte' : 'Boutique Fermée'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0 px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs font-mono text-text-secondary truncate">
              {publicUrl}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-main hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </button>
              <a
                href={`/catalogue/${currentOrgId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-primary/10 text-brand-primary text-xs font-bold hover:bg-brand-primary/20 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Aperçu</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-bg-card border border-dashed border-border-subtle rounded-3xl p-6 shadow-premium flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-text-main">Catalogue Public en Ligne — Fonctionnalité Pro</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Obtenez un lien public pour recevoir des commandes clients directement dans votre tableau de bord. Réservé à la Formule Pro — contactez votre administrateur Print_Flow pour l'activer.
            </p>
          </div>
        </div>
      )}

      {/* Filters, View Toggle and Search */}
      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, format, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-border-subtle shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-bg-card text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
              title="Vue en Grille"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-bg-card text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
              title="Vue en Tableau"
            >
              <ListIcon className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-border-subtle no-scrollbar whitespace-nowrap w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${selectedCategory === 'all' ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${selectedCategory === cat ? 'bg-bg-card text-text-main shadow-sm' : 'text-text-secondary hover:text-text-main'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main content display (Grid / List views) */}
      {loading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "bg-bg-card border border-border-subtle rounded-3xl p-6 space-y-4 animate-scale-pulse"}>
          {viewMode === 'grid' ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="bg-bg-card rounded-3xl border border-border-subtle overflow-hidden h-[380px] animate-scale-pulse flex flex-col justify-between p-6">
                <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-24 self-end mt-4"></div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6"></div>
              {[1, 2, 3].map(n => (
                <div key={n} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* GRID MODE */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-bg-card rounded-3xl border border-border-subtle shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                  >
                    <div className="w-full h-40 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-border-subtle shrink-0">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-text-secondary opacity-60">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">Pas de photo</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-text-main text-[10px] font-bold rounded-full border border-border-subtle shadow-sm uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="absolute top-3 right-3 px-3 py-1 bg-brand-primary/90 text-white text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {materialLabel(p.materialType)}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-text-main group-hover:text-brand-primary transition">
                          {p.name}
                        </h3>
                        <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                          {p.description || 'Aucune description disponible pour ce produit technique.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-text-secondary flex items-center gap-1">
                            <FormatIcon className="w-3.5 h-3.5" />
                            Format{p.formatOptions && p.formatOptions.length > 1 ? 's' : ''} :
                          </span>
                          <span className="font-bold text-text-main text-right">
                            {p.formatOptions && p.formatOptions.length > 1
                              ? `${p.format} +${p.formatOptions.length - 1}`
                              : p.format}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-text-secondary">Prix Unitaire :</span>
                          <span className="text-base font-extrabold text-brand-primary">
                            {formatFCFA(p.unitPriceFcfa)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => openFormModal(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border-subtle text-[11px] font-bold text-text-secondary hover:text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(p)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-border-subtle text-[11px] font-bold text-text-secondary hover:text-rose-600 hover:border-rose-500/40 hover:bg-rose-500/5 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-text-secondary font-medium">
                  Aucun produit dans le catalogue.
                </div>
              )}
            </div>
          )}

          {/* LIST MODE (TABLE VIEW) */}
          {viewMode === 'list' && (
            <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-text-main">
                  <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-4 sm:px-6 py-4">Image</th>
                      <th className="px-4 sm:px-6 py-4">Désignation</th>
                      <th className="px-4 sm:px-6 py-4">Support</th>
                      <th className="px-4 sm:px-6 py-4">Format</th>
                      <th className="px-4 sm:px-6 py-4 text-right">Tarif Unitaire</th>
                      <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                          <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                              {p.photoUrl ? (
                                <img src={p.photoUrl} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-text-secondary opacity-40" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold text-text-main">
                            {p.name}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full border border-border-subtle bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-text-secondary uppercase">
                              {materialLabel(p.materialType)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-medium text-text-secondary">
                            {p.format}{p.formatOptions && p.formatOptions.length > 1 ? ` (+${p.formatOptions.length - 1})` : ''}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-extrabold text-brand-primary">
                            {formatFCFA(p.unitPriceFcfa)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openFormModal(p)}
                                className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteConfirm(p)}
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
                          Aucun produit trouvé.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-lg shadow-premium overflow-hidden transform scale-100 transition duration-300">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-base font-bold text-text-main">
                {selectedProduct ? 'Modifier le Produit' : 'Créer une Fiche Produit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Photo du Produit</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-dashed border-border-subtle rounded-2xl bg-bg-base/30">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border-subtle shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-text-secondary opacity-45" />
                      )}
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border-subtle rounded-full text-xs font-bold text-text-main bg-bg-card hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Téléverser la photo</span>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Désignation *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Flyers Premium Satiné, Affiche Événementielle..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Catégorie *</label>
                    <Dropdown
                      value={category}
                      onChange={setCategory}
                      options={categories.map(cat => ({ value: cat, label: cat }))}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Prix Unitaire (FCFA) *</label>
                    <input
                      type="number"
                      value={unitPriceFcfa || ''}
                      onChange={(e) => setUnitPriceFcfa(Number(e.target.value))}
                      placeholder="ex: 450"
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                      required
                    />
                  </div>
                </div>

                {/* Material Type + contextual fields */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-border-subtle">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Type de Support *</label>
                  <Dropdown
                    value={materialType}
                    onChange={(v) => setMaterialType(v as ProductMaterialType)}
                    options={materialTypes.map(m => ({ value: m.value, label: m.label }))}
                  />

                  {materialType !== 'autre' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                          {materialType === 'support_rigide' ? 'Matériau' : materialType === 'textile' ? 'Matière textile' : 'Type de papier'}
                        </label>
                        <input
                          type="text"
                          value={paperType}
                          onChange={(e) => setPaperType(e.target.value)}
                          placeholder={materialType === 'support_rigide' ? 'ex: PVC, Dibond, Forex...' : materialType === 'textile' ? 'ex: Polyester Tendu...' : 'ex: Couché Brillant...'}
                          className="w-full px-3.5 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                          {materialType === 'support_rigide' ? 'Épaisseur / Grammage' : 'Grammage (g/m²)'}
                        </label>
                        <input
                          type="number"
                          value={grammageG}
                          onChange={(e) => setGrammageG(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="ex: 135"
                          className="w-full px-3.5 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Finition</label>
                    <input
                      type="text"
                      value={finishing}
                      onChange={(e) => setFinishing(e.target.value)}
                      placeholder="ex: Massicotage, Œillets, Pelliculage..."
                      className="w-full px-3.5 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>
                </div>

                {/* Formats */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-border-subtle">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Format Principal *</label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="ex: A4, 60x160 cm, 1x1 m..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-text-secondary flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      Proposez d'autres tailles/formats avec un supplément de prix optionnel.
                    </p>
                    <button
                      type="button"
                      onClick={addFormatRow}
                      className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      Ajouter un format
                    </button>
                  </div>

                  {additionalFormats.length > 0 && (
                    <div className="space-y-2 animate-fade-in">
                      {additionalFormats.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => updateFormatRow(idx, 'label', e.target.value)}
                            placeholder="ex: 80x200 cm"
                            className="flex-1 min-w-0 px-3 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                          />
                          <input
                            type="number"
                            value={row.extraPriceFcfa ?? 0}
                            onChange={(e) => updateFormatRow(idx, 'extraPriceFcfa', e.target.value)}
                            placeholder="Supplément"
                            className="w-28 shrink-0 px-3 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                          />
                          <button
                            type="button"
                            onClick={() => removeFormatRow(idx)}
                            className="p-2 rounded-xl text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 transition shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Description / Notes techniques</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Saisissez les instructions relatives au papier, grammage..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition resize-none"
                  />
                </div>
              </div>

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
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  {selectedProduct ? 'Sauvegarder' : 'Créer la fiche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 p-6 space-y-4">
            <div className="text-rose-500 flex justify-center">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-text-main">Confirmer la suppression</h3>
              <p className="text-xs text-text-secondary">
                Voulez-vous supprimer le produit <span className="font-bold text-text-main">{selectedProduct?.name}</span> ? Cette opération est définitive.
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
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        title="Produit ajouté avec succès"
        message={successMessage}
      />
    </div>
  );
}
