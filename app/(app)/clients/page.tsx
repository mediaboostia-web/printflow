'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  User, 
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { mockClients } from '@/lib/mock/data';
import { Client } from '@/types/domain';
import SuccessModal from '@/components/ui/SuccessModal';

export default function ClientsPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const allClients = useAppStore((state) => state.clients);
  const addClientStore = useAppStore((state) => state.addClient);
  const editClientStore = useAppStore((state) => state.editClient);
  const deleteClientStore = useAppStore((state) => state.deleteClient);

  // Filter clients by org
  const clients = allClients.filter(c => c.organizationId === currentOrgId);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  // Handle Search
  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase();
    return (
      client.companyName.toLowerCase().includes(searchLower) ||
      (client.contactName && client.contactName.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
      (client.address && client.address.toLowerCase().includes(searchLower))
    );
  });

  // Open Add/Edit Modal
  const openFormModal = (client: Client | null = null) => {
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
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Form Submit (Add/Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setFormError('Le nom de l\'entreprise est obligatoire.');
      return;
    }

    setIsModalOpen(false);

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
        createdBy: currentProfile?.fullName || 'Commercial',
        source: 'interne'
      });
      setIsSuccessOpen(true);
    }
  };

  // Open Delete Confirmation
  const openDeleteConfirm = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteConfirmOpen(true);
  };

  // Handle Delete
  const handleDelete = () => {
    if (!selectedClient) return;
    deleteClientStore(selectedClient.id);
    setSelectedClient(null);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-main tracking-tight">Gestion des Clients</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Gérez la base de données clients de votre imprimerie, coordonnez les coordonnées et planifiez les facturations.
          </p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center justify-center gap-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded-full shadow-premium transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un client</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-bg-card border border-border-subtle p-4 rounded-2xl shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, contact, téléphone ou adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
          />
        </div>
        <div className="text-xs text-text-secondary font-semibold shrink-0">
          {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} enregistré{filteredClients.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Main Grid / Table Content */}
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
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex justify-between items-center py-2">
                  <div className="space-y-2 w-1/3">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2"></div>
                  </div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-main">
              <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                <tr>
                  <th className="px-4 sm:px-6 py-4">Client / Entreprise</th>
                  <th className="px-4 sm:px-6 py-4">Contact Principal</th>
                  <th className="px-4 sm:px-6 py-4">Téléphone</th>
                  <th className="px-4 sm:px-6 py-4">Adresse / Siège</th>
                  <th className="px-4 sm:px-6 py-4">Email</th>
                  <th className="px-4 sm:px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition duration-150">
                      {/* Company Name */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                            <Building className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-text-main">{client.companyName}</p>
                            <p className="text-[10px] text-text-secondary">Ref: {client.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main">
                        <div className="flex items-center gap-1.5 font-medium">
                          <User className="w-3.5 h-3.5 text-text-secondary" />
                          {client.contactName || 'Non spécifié'}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main">
                        {client.phone ? (
                          <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 font-semibold text-brand-primary hover:underline">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {client.phone}
                          </a>
                        ) : (
                          <span className="text-text-secondary text-xs">Non spécifié</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                          <span className="truncate max-w-[200px]">{client.address || 'Non spécifié'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-main">
                        {client.email ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                            <span>{client.email}</span>
                          </div>
                        ) : (
                          <span className="text-text-secondary text-xs">Non spécifié</span>
                        )}
                      </td>

                      {/* CRUD Actions */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openFormModal(client)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 border border-transparent hover:border-brand-primary/20 transition"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(client)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                            title="Supprimer"
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
                      Aucun client trouvé pour cette recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Form Modal (Add / Edit Client) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-lg shadow-premium overflow-hidden transform scale-100 transition duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-base font-bold text-text-main">
                {selectedClient ? 'Modifier le Client' : 'Ajouter un Nouveau Client'}
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
              {formError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom de l'Entreprise *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ex: SENELEC, Sonatel, CFAO..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />
                </div>

                {/* Contact Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom du Contact Principal</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="ex: Amadou Mbacke, Awa Diop..."
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Numéro de Téléphone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="ex: +221 77 123 45 67"
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: contact@societe.sn"
                      className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Siège Social / Quartier</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ex: Rue 12, Plateau, Dakar, Sénégal"
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
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  {selectedClient ? 'Sauvegarder' : 'Ajouter le client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300 p-6 space-y-4">
            <div className="text-rose-500 flex justify-center">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-text-main">Confirmer la suppression</h3>
              <p className="text-xs text-text-secondary">
                Êtes-vous sûr de vouloir supprimer le client <span className="font-bold text-text-main">{selectedClient?.companyName}</span> ? Cette action est irréversible.
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
        title="Client ajouté avec succès"
        message={`"${companyName}" a été ajouté à votre base clients.`}
      />
    </div>
  );
}
