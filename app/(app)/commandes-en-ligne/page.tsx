'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import { OnlineOrder } from '@/types/domain';

const statusMeta: Record<OnlineOrder['status'], { label: string; classes: string }> = {
  nouvelle: { label: 'Nouvelle', classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  en_traitement: { label: 'En traitement', classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  convertie: { label: 'Convertie', classes: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  rejetee: { label: 'Rejetée', classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
};

export default function CommandesEnLignePage() {
  const router = useRouter();
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const canUsePublicCatalogue = useAppStore((state) => state.canUsePublicCatalogue());
  const onlineOrders = useAppStore((state) => state.onlineOrders);
  const clients = useAppStore((state) => state.clients);
  const updateOnlineOrderStatus = useAppStore((state) => state.updateOnlineOrderStatus);
  const convertOnlineOrderToQuote = useAppStore((state) => state.convertOnlineOrderToQuote);

  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const orders = onlineOrders
    .filter(o => o.organizationId === currentOrgId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getClient = (clientId: string) => clients.find(c => c.id === clientId);

  const countByStatus = (status: OnlineOrder['status']) => orders.filter(o => o.status === status).length;

  const handleConvert = (order: OnlineOrder) => {
    convertOnlineOrderToQuote(order.id);
    triggerToast(`Devis créé depuis la commande ${order.orderNumber}.`);
    setSelectedOrder(null);
    router.push('/devis');
  };

  const handleReject = (order: OnlineOrder) => {
    if (!confirm(`Rejeter la commande ${order.orderNumber} ?`)) return;
    updateOnlineOrderStatus(order.id, 'rejetee');
    triggerToast(`Commande ${order.orderNumber} rejetée.`);
    setSelectedOrder(null);
  };

  const handleMarkProcessing = (order: OnlineOrder) => {
    updateOnlineOrderStatus(order.id, 'en_traitement');
    triggerToast(`Commande ${order.orderNumber} marquée en traitement.`);
    setSelectedOrder(prev => (prev && prev.id === order.id ? { ...prev, status: 'en_traitement' } : prev));
  };

  if (!canUsePublicCatalogue) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Commandes en ligne</h1>
          <p className="text-text-secondary text-sm mt-0.5">Commandes soumises par vos clients externes via le catalogue public.</p>
        </div>
        <div className="bg-bg-card border border-dashed border-border-subtle rounded-3xl p-10 shadow-premium flex flex-col items-center text-center gap-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-text-secondary">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-text-main">Fonctionnalité réservée à la Formule Pro</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Passez à la Formule Pro pour obtenir un lien de catalogue public et recevoir automatiquement les commandes de vos clients externes ici, dans votre tableau de bord. Contactez votre administrateur Print_Flow pour l'activer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-premium z-50 text-xs font-bold flex items-center gap-2 text-white animate-fade-in">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Commandes en ligne</h1>
        <p className="text-text-secondary text-sm mt-0.5">Commandes soumises par vos clients externes via votre catalogue public.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-bg-card border border-border-subtle p-5 space-y-2 shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] transition">
          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
            <Globe className="w-4.5 h-4.5" />
          </div>
          <p className="text-2xl font-bold text-text-main">{countByStatus('nouvelle')}</p>
          <p className="text-xs text-text-secondary">Nouvelles commandes</p>
        </div>
        <div className="rounded-3xl bg-bg-card border border-border-subtle p-5 space-y-2 shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] transition">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Clock className="w-4.5 h-4.5" />
          </div>
          <p className="text-2xl font-bold text-text-main">{countByStatus('en_traitement')}</p>
          <p className="text-xs text-text-secondary">En traitement</p>
        </div>
        <div className="rounded-3xl bg-bg-card border border-border-subtle p-5 space-y-2 shadow-premium hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] transition">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600">
            <PackageCheck className="w-4.5 h-4.5" />
          </div>
          <p className="text-2xl font-bold text-text-main">{countByStatus('convertie')}</p>
          <p className="text-xs text-text-secondary">Converties en devis</p>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-bg-card border border-border-subtle rounded-3xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-text-main">
            <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="px-4 sm:px-6 py-4">Référence</th>
                <th className="px-4 sm:px-6 py-4">Date</th>
                <th className="px-4 sm:px-6 py-4">Client</th>
                <th className="px-4 sm:px-6 py-4">Articles</th>
                <th className="px-4 sm:px-6 py-4 text-right">Total estimé</th>
                <th className="px-4 sm:px-6 py-4">Statut</th>
                <th className="px-4 sm:px-6 py-4 text-center">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const client = getClient(order.clientId);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-text-main">{order.orderNumber}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-text-main text-xs">{client?.companyName || '—'}</p>
                        <p className="text-[10px] text-text-secondary">{client?.phone}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-secondary text-xs">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right font-extrabold text-brand-primary">
                        {formatFCFA(order.subtotalFcfa)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusMeta[order.status].classes}`}>
                          {statusMeta[order.status].label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-text-secondary font-medium">
                    Aucune commande en ligne pour le moment. Partagez votre lien de catalogue depuis la page Catalogue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-lg shadow-premium overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20 shrink-0">
              <div>
                <h3 className="text-base font-bold text-text-main font-mono">{selectedOrder.orderNumber}</h3>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statusMeta[selectedOrder.status].classes}`}>
                  {statusMeta[selectedOrder.status].label}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Client info */}
              {(() => {
                const client = getClient(selectedOrder.clientId);
                return (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-border-subtle space-y-1.5">
                    <p className="text-sm font-bold text-text-main">{client?.companyName || 'Client inconnu'}</p>
                    {client?.contactName && <p className="text-xs text-text-secondary">{client.contactName}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-text-secondary">
                      {client?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
                      {client?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.email}</span>}
                      {client?.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{client.address}</span>}
                    </div>
                  </div>
                );
              })()}

              {/* Items */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Articles commandés</label>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/40 border border-border-subtle rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-text-main truncate">{item.name}</p>
                        <p className="text-text-secondary">{item.format} · Qté {item.quantity}</p>
                      </div>
                      <span className="font-bold text-brand-primary shrink-0">{formatFCFA(item.lineTotalFcfa)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-1 pt-1 text-sm font-bold text-text-main">
                  <span>Total estimé</span>
                  <span className="text-brand-primary">{formatFCFA(selectedOrder.subtotalFcfa)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-border-subtle space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Notes du client
                  </label>
                  <p className="text-xs text-text-main leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.status === 'convertie' && (
                <div className="p-3.5 bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/50 rounded-2xl flex items-center gap-2.5 text-cyan-700 dark:text-cyan-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cette commande a déjà été convertie en devis.</span>
                </div>
              )}
              {selectedOrder.status === 'rejetee' && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Cette commande a été rejetée.</span>
                </div>
              )}
            </div>

            {selectedOrder.status !== 'convertie' && selectedOrder.status !== 'rejetee' && (
              <div className="px-6 py-4 border-t border-border-subtle flex flex-wrap justify-end gap-2 shrink-0 bg-slate-50 dark:bg-slate-800/20">
                <button
                  onClick={() => handleReject(selectedOrder)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-500/30 text-rose-600 text-xs font-bold hover:bg-rose-500/10 transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Rejeter
                </button>
                {selectedOrder.status === 'nouvelle' && (
                  <button
                    onClick={() => handleMarkProcessing(selectedOrder)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-amber-500/30 text-amber-600 text-xs font-bold hover:bg-amber-500/10 transition"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Marquer en traitement
                  </button>
                )}
                <button
                  onClick={() => handleConvert(selectedOrder)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  Convertir en Devis
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
