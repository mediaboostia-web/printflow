'use client';

import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Eye, 
  Download, 
  MessageSquare,
  FileCheck,
  User,
  MapPin,
  Sparkles,
  Info
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import { Quote, BAT, BATVersion } from '@/types/domain';

export default function BATPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const canImportBAT = useAppStore((state) => state.canImportBAT());

  // Store lists & functions
  const storeQuotes = useAppStore((state) => state.quotes);
  const storeClients = useAppStore((state) => state.clients);
  const storeBATs = useAppStore((state) => state.bats);
  
  const addBATVersionStore = useAppStore((state) => state.addBATVersion);
  const validateBATStore = useAppStore((state) => state.validateBAT);
  const refuseBATStore = useAppStore((state) => state.refuseBAT);

  // States
  const [selectedBAT, setSelectedBAT] = useState<BAT | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [versionComment, setVersionComment] = useState('');
  const [refuseReason, setRefuseReason] = useState('');
  const [isRefuseOpen, setIsRefuseOpen] = useState(false);
  const [simulatedFileName, setSimulatedFileName] = useState('');
  const [simulatedFileSize, setSimulatedFileSize] = useState(0);
  const [simulatedFileBase64, setSimulatedFileBase64] = useState('');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quotes filter
  const orgQuotes = storeQuotes.filter(q => q.organizationId === currentOrgId);

  // Get BAT associated with a quote
  const getBATForQuote = (quoteId: string) => {
    return storeBATs.find(b => b.quoteId === quoteId);
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!canImportBAT) {
      setFormError("L'importation de documents BAT est réservée aux abonnés de la Formule PRO. Veuillez mettre à niveau.");
      return;
    }
    const isZip = file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip' || file.type === 'application/x-zip-compressed';
    if (!isZip) {
      setFormError('Seuls les fichiers .ZIP sont acceptés pour le dossier graphique.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setFormError('Le fichier ne doit pas dépasser 25 Mo.');
      return;
    }
    setSimulatedFileName(file.name);
    setSimulatedFileSize(file.size);
    setFormError('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setSimulatedFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add new BAT Version
  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBAT) return;
    if (!simulatedFileName) {
      setFormError("Veuillez téléverser un fichier graphique.");
      return;
    }
    if (!versionComment.trim()) {
      setFormError("Le commentaire de version est obligatoire.");
      return;
    }

    setActionLoading(true);

    setTimeout(() => {
      const versions = selectedBAT.versions || [];
      const newVersion: BATVersion = {
        id: `bv-${Date.now()}`,
        batId: selectedBAT.id,
        versionNumber: versions.length + 1,
        filePath: simulatedFileBase64 || `bat/${simulatedFileName}`,
        fileType: 'application/zip',
        comment: versionComment.trim(),
        uploadedBy: currentProfile.fullName,
        uploadedAt: new Date().toISOString()
      };

      addBATVersionStore(selectedBAT.id, newVersion);

      // Reset
      setSimulatedFileName('');
      setSimulatedFileSize(0);
      setSimulatedFileBase64('');
      setVersionComment('');
      setFormError('');

      // Refresh local selected BAT state
      const updatedBAT = storeBATs.find(b => b.id === selectedBAT.id);
      if (updatedBAT) {
        setSelectedBAT(updatedBAT);
      }
      setActionLoading(false);
    }, 450);
  };

  // Validate BAT
  const handleValidateBAT = () => {
    if (!selectedBAT) return;
    setActionLoading(true);
    setTimeout(() => {
      validateBATStore(selectedBAT.id, currentProfile.fullName);
      
      const updatedBAT = storeBATs.find(b => b.id === selectedBAT.id);
      if (updatedBAT) {
        setSelectedBAT(updatedBAT);
      }
      setActionLoading(false);
    }, 450);
  };

  // Refuse BAT
  const handleRefuseBAT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBAT || !refuseReason.trim()) return;
    setActionLoading(true);
    setIsRefuseOpen(false);

    setTimeout(() => {
      refuseBATStore(selectedBAT.id, refuseReason.trim());
      setRefuseReason('');
      
      const updatedBAT = storeBATs.find(b => b.id === selectedBAT.id);
      if (updatedBAT) {
        setSelectedBAT(updatedBAT);
      }
      setActionLoading(false);
    }, 450);
  };

  const getBATBadge = (status: string) => {
    switch (status) {
      case 'valide':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'refuse':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-100 dark:border-rose-900/30';
      case 'soumis':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      default:
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
    }
  };

  const getBATLabel = (status: string) => {
    switch (status) {
      case 'valide': return 'BAT Validé (Prêt Tirage)';
      case 'refuse': return 'BAT Refusé (Corrections)';
      case 'soumis': return 'BAT Soumis (Attente)';
      default: return 'En attente fichier';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Gestion des Bons à Tirer (BAT)</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Téléversez vos épreuves graphiques PDF et faites valider les BAT par vos clients avant l'impression finale.
        </p>
      </div>

      {selectedBAT ? (
        /* split screen BAT view */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left panel: File Upload and History */}
          <div className="lg:col-span-8 space-y-6">
            <button
              onClick={() => setSelectedBAT(null)}
              className="text-xs font-bold text-text-secondary hover:text-brand-primary flex items-center gap-1"
            >
              ← Retourner au tableau
            </button>

            {/* Simulated Drag & Drop Zone */}
            <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
              <h3 className="text-base font-bold text-text-main">Téléverser une Nouvelle Version</h3>
              
              {!canImportBAT ? (
                <div className="border border-border-subtle rounded-2xl p-6 bg-slate-50 dark:bg-slate-800/10 text-center space-y-4">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-text-main">Fonctionnalité de Chargement Verrouillée</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      L'importation de fichiers graphiques (.ZIP) pour le Bon à Tirer est réservée aux abonnés de la <strong className="text-brand-primary">Formule PRO</strong>.
                    </p>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed">
                    Votre formule d'abonnement actuelle ne prend pas en charge cette fonctionnalité. Veuillez mettre à niveau votre compte depuis le tableau de bord.
                  </p>
                </div>
              ) : selectedBAT.status === 'valide' ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>Le BAT est d'ores et déjà validé. Aucune autre version n'est requise.</span>
                </div>
              ) : (
                <form onSubmit={handleAddVersion} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Drag-drop box */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center ${
                      dragActive
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-border-subtle hover:border-brand-primary bg-bg-base/30'
                    }`}
                  >
                    <Upload className="w-10 h-10 text-text-secondary opacity-60" />
                    {simulatedFileName ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-text-main">{simulatedFileName}</p>
                        <p className="text-[10px] text-brand-primary font-bold">
                          Fichier chargé localement {simulatedFileSize > 0 && `(${(simulatedFileSize / (1024 * 1024)).toFixed(1)} Mo)`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-text-main">
                          Glissez-déposez votre dossier graphique ici ou <span className="text-brand-primary hover:underline">parcourez vos fichiers</span>
                        </p>
                        <p className="text-[10px] text-text-secondary">Format accepté : .ZIP uniquement — jusqu'à 25 Mo</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip,application/zip,application/x-zip-compressed"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Format/size info banner */}
                  <div className="flex items-start gap-2 text-[10px] text-text-secondary bg-slate-50 dark:bg-slate-800/30 border border-border-subtle rounded-xl p-3">
                    <Info className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" />
                    <span>Seuls les fichiers compressés au format <strong className="text-text-main">.ZIP</strong> sont acceptés pour le dossier graphique, jusqu'à <strong className="text-text-main">25 Mo</strong>.</span>
                  </div>

                  {/* Comment */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Description des Modifications / Version *</label>
                    <input
                      type="text"
                      value={versionComment}
                      onChange={(e) => setVersionComment(e.target.value)}
                      placeholder="ex: Première maquette avec charte graphique, Modification typo page 2..."
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold py-2.5 rounded-full shadow-premium transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Soumettre cette version au client</span>
                  </button>

                </form>
              )}
            </div>

            {/* Version list History */}
            <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
              <h3 className="text-base font-bold text-text-main">Historique des versions éditées</h3>
              <div className="space-y-3">
                {selectedBAT.versions && selectedBAT.versions.length > 0 ? (
                  selectedBAT.versions.map((ver) => (
                    <div key={ver.id} className="p-4 rounded-2xl border border-border-subtle bg-bg-base/30 flex flex-col sm:flex-row justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-text-main">
                            V{ver.versionNumber}
                          </span>
                          <span className="text-xs text-text-secondary">
                            Soumis par <span className="font-semibold text-text-main">{ver.uploadedBy}</span> le {new Date(ver.uploadedAt).toLocaleDateString('fr-FR')} à {new Date(ver.uploadedAt).toLocaleTimeString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-text-main flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ver.comment}</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {ver.filePath.startsWith('data:') ? (
                          <a
                            href={ver.filePath}
                            download={`BAT-${selectedBAT.id}-V${ver.versionNumber}.zip`}
                            className="flex items-center gap-1 text-[10px] font-bold text-brand-primary border border-brand-primary/20 bg-brand-primary/5 hover:bg-brand-primary/10 rounded-full px-3 py-1.5 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Télécharger</span>
                          </a>
                        ) : (
                          <span
                            title="Archive volumineuse — non conservée localement dans cette phase de démonstration"
                            className="flex items-center gap-1 text-[10px] font-bold text-text-secondary border border-border-subtle bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 cursor-not-allowed"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Indisponible</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-secondary text-center py-6">Aucune maquette soumise à cette date.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right panel: Details and actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* BAT status box */}
            <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium text-center space-y-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Statut Général du BAT</p>
              <div className="flex justify-center">
                <span className={`px-4 py-1.5 rounded-full border font-bold text-sm ${getBATBadge(selectedBAT.status)}`}>
                  {getBATLabel(selectedBAT.status)}
                </span>
              </div>

              {selectedBAT.status !== 'valide' && (
                <div className="pt-4 border-t border-border-subtle space-y-2">
                  <button
                    onClick={handleValidateBAT}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-full transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approuver & Valider le BAT</span>
                  </button>
                  <button
                    onClick={() => setIsRefuseOpen(true)}
                    disabled={actionLoading}
                    className="w-full bg-rose-600/10 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-500/20 text-xs font-bold py-2 rounded-full transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Refuser / Demander Corrections</span>
                  </button>
                </div>
              )}
            </div>

            {/* Production instructions panel */}
            {(() => {
              const quote = storeQuotes.find(q => q.id === selectedBAT.quoteId);
              const client = quote ? storeClients.find(c => c.id === quote.clientId) : null;
              const firstItem = quote?.items?.[0];
              return (
                <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
                  <h3 className="text-base font-bold text-text-main border-b border-border-subtle pb-2">Informations Techniques</h3>
                  
                  {/* Client info */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Client</p>
                    <p className="text-sm font-semibold text-text-main">{client?.companyName}</p>
                    <p className="text-xs text-text-secondary">{client?.contactName}</p>
                  </div>

                  {/* Paper specs */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Support Papier d'origine</p>
                    <p className="text-sm font-semibold text-text-main">{firstItem?.paperSnapshot || 'Standard'}</p>
                  </div>

                  {/* Finishing specs */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Façonnage & Finition</p>
                    <p className="text-sm font-semibold text-text-main">{firstItem?.finishingSnapshot || 'Massicot standard'}</p>
                  </div>

                  {/* Price info */}
                  <div className="space-y-1">
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Devis d'origine</p>
                    <p className="text-sm font-semibold text-text-main">{quote?.quoteNumber}</p>
                    <p className="text-xs font-bold text-brand-primary">{formatFCFA(quote?.totalFcfa || 0)} TTC</p>
                  </div>
                </div>
              );
            })()}

          </div>

        </div>
      ) : (
        /* Standard Table List View representing access controls */
        <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-main">
              <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-4 sm:px-6 py-4">N° Devis</th>
                  <th className="px-4 sm:px-6 py-4">Client</th>
                  <th className="px-4 sm:px-6 py-4">Option BAT</th>
                  <th className="px-4 sm:px-6 py-4">Statut Devis</th>
                  <th className="px-4 sm:px-6 py-4">Statut BAT</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Accès Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {orgQuotes.length > 0 ? (
                  orgQuotes.map((q) => {
                    const client = storeClients.find(c => c.id === q.clientId);
                    const bat = getBATForQuote(q.id);
                    
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-bold">
                          {q.quoteNumber}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-semibold">
                          {client?.companyName || 'Client Inconnu'}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            bat 
                              ? 'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30' 
                              : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
                          }`}>
                            {bat ? 'Exige un BAT' : 'Sans BAT'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-bold ${q.status === 'valide' ? 'text-emerald-500' : q.status === 'refuse' ? 'text-rose-500' : 'text-amber-500'}`}>
                            {q.status === 'valide' ? 'Validé (Signé)' : q.status === 'refuse' ? 'Refusé' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          {bat ? (
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${getBATBadge(bat.status)}`}>
                              {getBATLabel(bat.status)}
                            </span>
                          ) : (
                            <span className="text-xs text-text-secondary italic">Exemption</span>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                          {(() => {
                            if (!bat) {
                              return <span className="text-xs text-emerald-500 font-semibold flex items-center justify-center gap-1"><FileCheck className="w-3.5 h-3.5" /> Prêt production</span>;
                            }
                            if (q.status !== 'valide') {
                              return (
                                <span className="text-xs text-text-secondary flex items-center justify-center gap-1.5 opacity-60">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Verrou Devis
                                </span>
                              );
                            }
                            return (
                              <button
                                onClick={() => setSelectedBAT(bat)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover px-4 py-1.5 rounded-full transition shadow-sm"
                              >
                                <span>Gérer le BAT</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-secondary font-medium">
                      Aucun devis enregistré.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refuse Reason Dialog Modal */}
      {isRefuseOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main text-center">Motif de refus du BAT</h3>
            
            <form onSubmit={handleRefuseBAT} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Motifs / Corrections demandées *</label>
                <textarea
                  rows={3}
                  value={refuseReason}
                  onChange={(e) => setRefuseReason(e.target.value)}
                  placeholder="ex: Le logo est légèrement décalé à gauche, Textes de bas de page tronqués..."
                  className="w-full px-3 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition resize-none"
                  required
                />
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRefuseOpen(false)}
                  className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
                >
                  Valider le refus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
