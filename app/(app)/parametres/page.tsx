'use client';

import React, { useState } from 'react';
import { 
  Building, 
  Percent, 
  Printer, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Settings,
  Edit2,
  Power,
  Shield,
  Key,
  User
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { Organization, Profile } from '@/types/domain';
import Dropdown from '@/components/ui/Dropdown';

export default function ParametresPage() {
  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const currentOrg = useAppStore((state) => state.getCurrentOrg());
  const currentProfile = useAppStore((state) => state.getCurrentProfile());
  const orgStylePreferences = useAppStore((state) => state.orgStylePreferences);
  const setOrgPreferencesStore = useAppStore((state) => state.setOrgPreferences);
  const role = currentProfile ? currentProfile.role : 'commercial';

  // Store Config Lists & Actions
  const storeTaxes = useAppStore((state) => state.taxes);
  const storeMachines = useAppStore((state) => state.machines);
  const storePartners = useAppStore((state) => state.partners);
  const storeFormats = useAppStore((state) => state.paperFormats);
  
  const updateOrgDetailsStore = useAppStore((state) => state.updateOrgDetails);
  
  const addTaxStore = useAppStore((state) => state.addTax);
  const deleteTaxStore = useAppStore((state) => state.deleteTax);
  
  const addMachineStore = useAppStore((state) => state.addMachine);
  const deleteMachineStore = useAppStore((state) => state.deleteMachine);
  
  const addPartnerStore = useAppStore((state) => state.addPartner);
  const deletePartnerStore = useAppStore((state) => state.deletePartner);
  
  const addPaperFormatStore = useAppStore((state) => state.addPaperFormat);
  const deletePaperFormatStore = useAppStore((state) => state.deletePaperFormat);
  
  // Collaborators store hooks
  const storeProfiles = useAppStore((state) => state.profiles);
  const addProfileStore = useAppStore((state) => state.addProfile);
  const deleteProfileStore = useAppStore((state) => state.deleteProfile);
  const toggleProfileActiveStore = useAppStore((state) => state.toggleProfileActive);

  // Sub-tab: 'org' (organisation), 'taxes' (taxes rates), 'shop' (atelier & formats), 'utilisateurs' (collaborateurs)
  const [activeSubTab, setActiveSubTab] = useState<'org' | 'taxes' | 'shop' | 'utilisateurs'>('org');

  // Org form
  const [orgName, setOrgName] = useState(currentOrg.name);
  const [orgAddress, setOrgAddress] = useState(currentOrg.address || '');
  const [orgPhone, setOrgPhone] = useState(currentOrg.phone || '');
  const [orgEmail, setOrgEmail] = useState(currentOrg.email || '');
  const [orgLogoBase64, setOrgLogoBase64] = useState<string>('');

  // Style preferences states
  const [prefThemeColor, setPrefThemeColor] = useState(orgStylePreferences.themeColor);
  const [prefFontFamily, setPrefFontFamily] = useState(orgStylePreferences.fontFamily);
  const [prefInvoiceTemplate, setPrefInvoiceTemplate] = useState(orgStylePreferences.invoiceTemplate);
  
  // Tax Form
  const [taxName, setTaxName] = useState('');
  const [taxRate, setTaxRate] = useState<number>(18);
  
  // Machine Form
  const [machineName, setMachineName] = useState('');
  const [machineType, setMachineType] = useState('Offset');
  
  // Partner Form
  const [partnerName, setPartnerName] = useState('');
  const [partnerService, setPartnerService] = useState('');
  
  // Format Form
  const [formatLabel, setFormatLabel] = useState('');

  // Collaborator form states
  const [collabName, setCollabName] = useState('');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabPhone, setCollabPhone] = useState('');
  const [collabRole, setCollabRole] = useState<'admin' | 'commercial' | 'chef_atelier'>('commercial');
  const [collabPassword, setCollabPassword] = useState('collaborateur2026');
  
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [selectedCollab, setSelectedCollab] = useState<Profile | null>(null);
  const [collabSuccessMessage, setCollabSuccessMessage] = useState('');
  const [collabFormError, setCollabFormError] = useState('');
  const [isSubmittingCollab, setIsSubmittingCollab] = useState(false);

  const triggerCollabToast = (msg: string) => {
    setCollabSuccessMessage(msg);
    setTimeout(() => setCollabSuccessMessage(''), 3500);
  };

  // Alerts
  const [saveSuccess, setSaveSuccess] = useState('');

  // Access check: Chef d'atelier is blocked
  if (role === 'chef_atelier') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-4 max-w-md mx-auto animate-fade-in bg-bg-card p-8 border border-border-subtle rounded-3xl shadow-premium">
        <AlertTriangle className="w-12 h-12 text-rose-500" />
        <h3 className="text-lg font-bold text-text-main">Accès Refusé</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Les configurations de l'organisation, des taxes et des ateliers d'imprimerie sont verrouillées et éditables uniquement par les administrateurs du système.
        </p>
      </div>
    );
  }

  // Handle Org Submit
  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedOrg: Organization = {
      ...currentOrg,
      name: orgName,
      address: orgAddress,
      phone: orgPhone,
      email: orgEmail,
      updatedAt: new Date().toISOString()
    } as any;
    
    updateOrgDetailsStore(updatedOrg);
    setSaveSuccess('Informations de l\'organisation enregistrées avec succès.');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrgLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add tax row
  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName.trim()) return;
    addTaxStore({ name: taxName.trim(), rate: Number(taxRate) });
    setTaxName('');
    setTaxRate(18);
  };

  // Add machine
  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineName.trim()) return;
    addMachineStore({ name: machineName.trim(), type: machineType });
    setMachineName('');
  };

  // Add partner
  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;
    addPartnerStore({ name: partnerName.trim(), service: partnerService.trim() });
    setPartnerName('');
    setPartnerService('');
  };

  // Add format
  const handleAddFormat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formatLabel.trim()) return;
    addPaperFormatStore(formatLabel.trim());
    setFormatLabel('');
  };

  // Add or edit collaborator
  const handleCollabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollabFormError('');
    if (!collabName || !collabEmail) return;

    if (selectedCollab) {
      // Edit collaborator (role, name, phone, email)
      const updated = {
        ...selectedCollab,
        fullName: collabName,
        email: collabEmail,
        phone: collabPhone,
        role: collabRole,
        updatedAt: new Date().toISOString()
      };
      useAppStore.setState(state => ({
        profiles: state.profiles.map(p => p.id === selectedCollab.id ? updated : p)
      }));
      setCollabSuccessMessage(`Collaborateur "${collabName}" mis à jour avec succès.`);
    } else {
      // Create new collaborator
      setIsSubmittingCollab(true);
      const res = await addProfileStore({
        fullName: collabName,
        email: collabEmail,
        phone: collabPhone,
        role: collabRole,
        isActive: true,
        password: collabPassword
      });
      setIsSubmittingCollab(false);

      if (!res.success) {
        setCollabFormError(res.error || 'Impossible de créer ce collaborateur.');
        return;
      }
      setCollabSuccessMessage(`Collaborateur "${collabName}" créé avec succès.`);
    }

    // Reset Form
    setCollabName('');
    setCollabEmail('');
    setCollabPhone('');
    setCollabRole('commercial');
    setCollabPassword('collaborateur2026');
    setSelectedCollab(null);
    setIsCollabModalOpen(false);

    // Auto close popup alert after 3 seconds
    setTimeout(() => {
      setCollabSuccessMessage('');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-main tracking-tight">Paramètres Généraux</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Gérez l'identité de votre imprimerie, configurez les grilles de taxes fiscales, et référencez le matériel d'impression.
        </p>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-border-subtle w-full sm:w-auto self-start inline-flex">
        <button
          onClick={() => setActiveSubTab('org')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'org' 
              ? 'bg-bg-card text-text-main shadow-sm' 
              : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Fiche Organisation</span>
        </button>
        <button
          onClick={() => setActiveSubTab('taxes')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'taxes' 
              ? 'bg-bg-card text-text-main shadow-sm' 
              : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Taxes (TVA)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('shop')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'shop' 
              ? 'bg-bg-card text-text-main shadow-sm' 
              : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Atelier & Formats</span>
        </button>
        <button
          onClick={() => setActiveSubTab('utilisateurs')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            activeSubTab === 'utilisateurs' 
              ? 'bg-bg-card text-text-main shadow-sm' 
              : 'text-text-secondary hover:text-text-main'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Collaborateurs</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* SUB-TAB 1: ORG FOLD */}
      {activeSubTab === 'org' && (
        <form onSubmit={handleOrgSubmit} className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-6 max-w-2xl animate-fade-in">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-text-main font-bold">
            <Settings className="w-5 h-5 text-brand-primary" />
            <h3>Identité de l'Établissement</h3>
          </div>

          <div className="space-y-4">
            
            {/* Logo simulation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Logo officiel d'imprimerie</label>
              <div className="flex items-center gap-4 p-4 border border-dashed border-border-subtle rounded-2xl bg-bg-base/30">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border-subtle shrink-0">
                  {orgLogoBase64 ? (
                    <img src={orgLogoBase64} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Building className="w-6 h-6 text-text-secondary opacity-40" />
                  )}
                </div>
                <div className="flex-1 w-full text-left">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-brand-primary/10 file:text-brand-primary file:cursor-pointer hover:file:bg-brand-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Org Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom de l'Organisation / Enseigne *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Téléphone standard</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orgPhone}
                    onChange={(e) => setOrgPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse Email de contact</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse Géographique (Siège)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orgAddress}
                    onChange={(e) => setOrgAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-premium"
            >
              Enregistrer les Informations
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: TAX RATES */}
      {activeSubTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start max-w-4xl animate-fade-in">
          
          {/* List array */}
          <div className="md:col-span-7 bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
            <h3 className="text-base font-bold text-text-main">Grille des Taxes (TVA éditables)</h3>
            <div className="overflow-hidden border border-border-subtle rounded-2xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary font-bold uppercase">
                    <th className="px-4 py-3">Libellé taxe</th>
                    <th className="px-4 py-3 text-right">Taux (%)</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-text-main font-semibold">
                  {storeTaxes.map(tax => (
                    <tr key={tax.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">{tax.name}</td>
                      <td className="px-4 py-3 text-right text-brand-primary">{tax.rate}%</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteTaxStore(tax.id)}
                          className="p-1 rounded text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition"
                          title="Supprimer la taxe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add form */}
          <form onSubmit={handleAddTax} className="md:col-span-5 bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
            <h3 className="text-base font-bold text-text-main">Créer un taux de TVA</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Libellé *</label>
                <input
                  type="text"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  placeholder="ex: TVA Sénégal Standard"
                  className="w-full px-3 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-text-main transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Taux (%) *</label>
                <input
                  type="number"
                  value={taxRate || ''}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  placeholder="18"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-text-main transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold py-2 rounded-full transition shadow-sm flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter le taux de TVA</span>
            </button>
          </form>

        </div>
      )}

      {/* SUB-TAB 3: ATELIER & FORMATS */}
      {activeSubTab === 'shop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* Machines Fold */}
          <div className="lg:col-span-6 bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
            <h3 className="text-base font-bold text-text-main border-b border-border-subtle pb-2">Machines & Presses Atelier</h3>
            
            <div className="overflow-hidden border border-border-subtle rounded-2xl">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary font-bold uppercase">
                    <th className="px-4 py-3">Machine</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-text-main font-semibold">
                  {storeMachines.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">{m.name}</td>
                      <td className="px-4 py-3 text-text-secondary text-[10px] uppercase font-bold">{m.type}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => deleteMachineStore(m.id)}
                          className="p-1 text-text-secondary hover:text-rose-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={handleAddMachine} className="flex gap-2 pt-2">
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="Presse Heidelberg A4..."
                className="flex-1 px-3 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none text-text-main"
                required
              />
              <div className="w-36 sm:w-40 shrink-0">
                <Dropdown
                  value={machineType}
                  onChange={setMachineType}
                  options={[
                    { value: 'Offset', label: 'Offset' },
                    { value: 'Numérique', label: 'Numérique' },
                    { value: 'Grand Format', label: 'Traceur' },
                    { value: 'Finition', label: 'Finition' },
                  ]}
                />
              </div>
              <button
                type="submit"
                className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover transition shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Formats and Partners fold */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Paper formats folder */}
            <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
              <h3 className="text-base font-bold text-text-main border-b border-border-subtle pb-2">Formats de papier standard</h3>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-2 no-scrollbar">
                {storeFormats.map(fmt => (
                  <span 
                    key={fmt} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-border-subtle text-[11px] font-bold text-text-main rounded-full"
                  >
                    <span>{fmt}</span>
                    <button 
                      onClick={() => deletePaperFormatStore(fmt)}
                      className="text-text-secondary hover:text-rose-500 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddFormat} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={formatLabel}
                  onChange={(e) => setFormatLabel(e.target.value)}
                  placeholder="Format A0 (84.1 x 118.9 cm)..."
                  className="flex-1 px-3 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none text-text-main"
                  required
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Partners folder */}
            <div className="bg-bg-card border border-border-subtle p-6 rounded-3xl shadow-premium space-y-4">
              <h3 className="text-base font-bold text-text-main border-b border-border-subtle pb-2">Prestataires & Façonniers externes</h3>
              
              <div className="overflow-hidden border border-border-subtle rounded-2xl">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/30 border-b border-border-subtle text-text-secondary font-bold uppercase">
                      <th className="px-4 py-3">Partenaire</th>
                      <th className="px-4 py-3">Sous-traitance</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-text-main font-semibold">
                    {storePartners.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3 text-text-secondary text-[10px]">{p.service}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deletePartnerStore(p.id)}
                            className="p-1 text-text-secondary hover:text-rose-500 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleAddPartner} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Nom du façonnier..."
                  className="flex-1 px-3 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none text-text-main"
                  required
                />
                <input
                  type="text"
                  value={partnerService}
                  onChange={(e) => setPartnerService(e.target.value)}
                  placeholder="ex: Dorure à chaud..."
                  className="flex-1 px-3 py-1.5 bg-input-bg border border-border-subtle rounded-xl text-xs focus:outline-none text-text-main"
                  required
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'utilisateurs' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header block with button */}
          <div className="flex justify-between items-center bg-bg-card border border-border-subtle p-4 rounded-3xl shadow-sm">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest block">Collaborateurs de l'entreprise</span>
            <button
              onClick={() => {
                setSelectedCollab(null);
                setCollabName('');
                setCollabEmail('');
                setCollabPhone('');
                setCollabRole('commercial');
                setCollabPassword('collaborateur2026');
                setIsCollabModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm animate-scale-pulse"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Collaborateur</span>
            </button>
          </div>

          {/* Success Dialog Popup */}
          {collabSuccessMessage && (
            <div className="fixed top-5 right-5 bg-[#101726] border border-border-subtle p-5 rounded-3xl shadow-premium z-50 animate-bounce text-xs font-bold flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-brand-primary animate-pulse" />
              <div className="space-y-0.5 text-white">
                <p>{collabSuccessMessage}</p>
                <p className="text-[10px] text-slate-400 font-medium">Les autorisations ont été mises à jour.</p>
              </div>
            </div>
          )}

          {/* Table list */}
          <div className="bg-bg-card border border-border-subtle rounded-3xl overflow-hidden shadow-premium">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-text-secondary text-[10px] font-bold uppercase bg-slate-50 dark:bg-slate-800/10">
                    <th className="px-6 py-4">Nom Complet</th>
                    <th className="px-6 py-4">Contacts</th>
                    <th className="px-6 py-4">Rôle</th>
                    <th className="px-6 py-4">État</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50 text-text-main font-semibold">
                  {storeProfiles.filter(p => p.organizationId === currentOrgId).map((prof) => (
                    <tr key={prof.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{prof.fullName}</span>
                          {prof.id === currentProfile.id && (
                            <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase">Moi</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary">
                        <p>{prof.email || '—'}</p>
                        <p className="text-[10px]">{prof.phone || '—'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          prof.role === 'admin' 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : prof.role === 'chef_atelier'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-cyan-500/10 text-cyan-500'
                        }`}>
                          {prof.role === 'admin' && 'Administrateur'}
                          {prof.role === 'chef_atelier' && 'Chef d\'Atelier'}
                          {prof.role === 'commercial' && 'Commercial'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                          prof.isActive 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {prof.isActive ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCollab(prof);
                              setCollabName(prof.fullName);
                              setCollabEmail(prof.email || '');
                              setCollabPhone(prof.phone || '');
                              setCollabRole(prof.role);
                              setIsCollabModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              toggleProfileActiveStore(prof.id);
                              triggerCollabToast(`État du compte "${prof.fullName}" modifié.`);
                            }}
                            disabled={prof.id === currentProfile.id}
                            className={`p-1.5 rounded-lg transition ${
                              prof.id === currentProfile.id
                                ? 'text-slate-355 dark:text-slate-800 cursor-not-allowed'
                                : 'text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10'
                            }`}
                            title={prof.isActive ? 'Désactiver' : 'Activer'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Voulez-vous supprimer le collaborateur "${prof.fullName}" ?`)) {
                                deleteProfileStore(prof.id);
                                triggerCollabToast('Collaborateur supprimé.');
                              }
                            }}
                            disabled={prof.id === currentProfile.id}
                            className={`p-1.5 rounded-lg transition ${
                              prof.id === currentProfile.id
                                ? 'text-slate-355 dark:text-slate-800 cursor-not-allowed'
                                : 'text-text-secondary hover:text-rose-600 hover:bg-rose-500/10'
                            }`}
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Collaborator Creation Modal */}
          {isCollabModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
              <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
                  <h3 className="text-base font-bold text-text-main">
                    {selectedCollab ? 'Modifier le Collaborateur' : 'Ajouter un Collaborateur'}
                  </h3>
                  <button 
                    onClick={() => setIsCollabModalOpen(false)}
                    className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleCollabSubmit} className="p-6 space-y-4">
                  {collabFormError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{collabFormError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Nom Complet *</label>
                      <input
                        type="text"
                        value={collabName}
                        onChange={(e) => setCollabName(e.target.value)}
                        placeholder="ex: Mamadou Diagne"
                        className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Adresse e-mail *</label>
                      <input
                        type="email"
                        value={collabEmail}
                        onChange={(e) => setCollabEmail(e.target.value)}
                        placeholder="m.diagne@sudprint.sn"
                        className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Téléphone</label>
                      <input
                        type="text"
                        value={collabPhone}
                        onChange={(e) => setCollabPhone(e.target.value)}
                        placeholder="+221 77..."
                        className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase block">Rôle de l'utilisateur *</label>
                      <Dropdown
                        options={[
                          { value: 'commercial', label: 'Commercial' },
                          { value: 'chef_atelier', label: 'Chef d\'Atelier' },
                          { value: 'admin', label: 'Administrateur' }
                        ]}
                        value={collabRole}
                        onChange={(val) => setCollabRole(val as any)}
                      />
                    </div>

                    {!selectedCollab && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase block">Mot de passe de connexion initial *</label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={collabPassword}
                            onChange={(e) => setCollabPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono font-semibold"
                            required
                          />
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCollabModalOpen(false)}
                      className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingCollab}
                      className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm disabled:opacity-60 disabled:cursor-wait"
                    >
                      {isSubmittingCollab ? 'Création en cours...' : 'Enregistrer'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
