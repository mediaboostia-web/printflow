'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bell, 
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Settings,
  LogOut,
  X,
  Mail,
  Phone,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '@/lib/state/store';
import { formatFCFA } from '@/lib/utils/money';
import Dropdown from '@/components/ui/Dropdown';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const currentProfileId = useAppStore((state) => state.currentProfileId);
  const profiles = useAppStore((state) => state.profiles);
  const currentProfile = React.useMemo(
    () => profiles.find((p) => p.id === currentProfileId) || profiles[0],
    [profiles, currentProfileId]
  );
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const updateProfileStore = useAppStore((state) => state.updateProfile);
  const changePasswordStore = useAppStore((state) => state.changePassword);
  const logout = useAppStore((state) => state.logout);

  // Time & Date State
  const [dateTime, setDateTime] = useState<Date | null>(null);

  // Dropdown & Modal States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Profile Form States
  const [fullName, setFullName] = useState(currentProfile?.fullName || '');
  const [email, setEmail] = useState(currentProfile?.email || 'contact@imprimerie.sn');
  const [phone, setPhone] = useState(currentProfile?.phone || '');
  const [role, setRole] = useState(currentProfile?.role || 'commercial');
  const [newPassword, setNewPassword] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setDateTime(new Date());
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date: Date | null) => {
    if (!date) return '';
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    const dateStr = date.toLocaleDateString('fr-FR', dateOptions);
    const timeStr = date.toLocaleTimeString('fr-FR', timeOptions);
    return `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} • ${timeStr}`;
  };

  const getActiveTabName = () => {
    const parts = pathname.split('/').filter(p => p);
    if (parts.length === 0) return 'Tableau de bord';
    
    const lastPart = parts[parts.length - 1];
    if (lastPart === 'dashboard') return 'Tableau de bord';
    if (lastPart === 'clients') return 'Clients';
    if (lastPart === 'catalogue') return 'Catalogue';
    if (lastPart === 'devis') return 'Devis';
    if (lastPart === 'bat') return 'Bons à Tirer (BAT)';
    if (lastPart === 'commandes') return 'Commandes';
    if (lastPart === 'factures') return 'Factures & Règl.';
    if (lastPart === 'historique') return 'Historique';
    if (lastPart === 'commandes-en-ligne') return 'Commandes en ligne';
    if (lastPart === 'livraisons') return 'Livraisons';
    if (lastPart === 'parametres') return 'Paramètres';
    if (lastPart === 'aide') return 'Centre d\'aide';
    return lastPart;
  };

  const activeTabName = getActiveTabName();

  // Handle Edit profile submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Le nom complet est requis.');
      return;
    }

    if (newPassword.trim()) {
      changePasswordStore(currentProfile.id, newPassword.trim()).then((res) => {
        if (!res.success) {
          setFormError(res.error || 'Erreur lors du changement de mot de passe.');
        } else {
          setNewPassword('');
        }
      });
    }

    updateProfileStore({
      ...currentProfile,
      fullName: fullName.trim(),
      email,
      phone,
      role
    } as any);

    setIsEditModalOpen(false);
  };

  const currentOrgId = useAppStore((state) => state.currentOrgId);
  const onlineOrders = useAppStore((state) => state.onlineOrders);
  const activeCurrency = useAppStore((state) => state.activeCurrency || 'FCFA');
  const setCurrency = useAppStore((state) => state.setCurrency);
  const pendingOnlineOrders = React.useMemo(
    () => onlineOrders.filter((o) => o.organizationId === currentOrgId && (o.status === 'nouvelle' || o.status === 'en_traitement')),
    [onlineOrders, currentOrgId]
  );
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="h-16 bg-bg-card border-b border-border-subtle px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-all duration-300">
      
      {/* Left side: Sidebar Toggle & Active Tab Title */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm border border-border-subtle bg-bg-card shrink-0"
          title={isSidebarCollapsed ? "Développer" : "Réduire"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4 text-text-main" /> : <ChevronLeft className="w-4 h-4 text-text-main" />}
        </button>

        <h2 className="text-base sm:text-lg font-bold text-text-main tracking-tight whitespace-nowrap overflow-hidden text-ellipsis capitalize">
          {activeTabName}
        </h2>
      </div>

      {/* Right side: Utilities, Theme Switcher & DateTime */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 relative">
        
        {/* Live Date/Time */}
        {dateTime && (
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-text-secondary bg-slate-100 dark:bg-slate-800/80 border border-border-subtle px-3 py-2 rounded-full transition shadow-sm">
            <Clock className="w-3.5 h-3.5 text-brand-primary" />
            <span>{formatDateTime(dateTime)}</span>
          </div>
        )}

        {/* Multi-Currency Selector */}
        <div className="hidden sm:block">
          <Dropdown
            value={activeCurrency}
            options={[
              { value: 'FCFA', label: 'FCFA (XOF)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'USD', label: 'USD ($)' },
              { value: 'MAD', label: 'MAD (Dirham)' },
              { value: 'GNF', label: 'GNF (Franc G.)' }
            ]}
            onChange={(val) => setCurrency(val as any)}
            className="w-32"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 md:p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-border-subtle bg-bg-card transition shadow-sm"
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-500" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />
          )}
        </button>

        {/* Mobile-only logout (profile popover, the usual way to log out, is hidden below sm) */}
        <button
          onClick={() => {
            if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
              logout();
              router.push('/login');
            }
          }}
          className="sm:hidden p-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-border-subtle bg-bg-card transition shadow-sm"
          title="Se déconnecter"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Popover */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-border-subtle bg-bg-card transition shadow-sm relative"
            title="Notifications des commandes en ligne"
          >
            <Bell className="w-4.5 h-4.5 text-text-secondary" />
            {pendingOnlineOrders.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4 px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {pendingOnlineOrders.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-bg-card border border-border-subtle shadow-premium p-3.5 z-50 animate-fade-in text-left">
                <div className="flex items-center justify-between px-1 pb-2 border-b border-border-subtle mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-text-main">
                    <Bell className="w-4 h-4 text-brand-primary" />
                    <span>Commandes Boutique ({pendingOnlineOrders.length})</span>
                  </div>
                </div>

                {pendingOnlineOrders.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                    {pendingOnlineOrders.map((o) => (
                      <div key={o.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-border-subtle flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between font-bold text-text-main">
                          <span>{o.orderNumber}</span>
                          <span className="text-brand-primary">{formatFCFA(o.subtotalFcfa)}</span>
                        </div>
                        <p className="text-[11px] text-text-secondary">Nouveau client boutique • {o.items?.length || 1} article(s)</p>
                        <button
                          onClick={() => {
                            setIsNotifOpen(false);
                            router.push('/commandes-en-ligne');
                          }}
                          className="mt-1 text-[11px] font-bold text-brand-primary hover:underline text-left"
                        >
                          Traiter la commande &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-text-secondary font-medium">
                    Aucune nouvelle commande en ligne.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block w-px h-6 bg-border-subtle mx-1" />

        {/* Profile Avatar trigger */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="hidden sm:flex w-8 h-8 md:w-9 md:h-9 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 items-center justify-center font-bold text-sm ring-2 ring-slate-100 dark:ring-slate-800/80 uppercase hover:scale-105 transition cursor-pointer"
            title="Mon Profil"
          >
            {currentProfile?.fullName?.charAt(0) || 'U'}
          </button>

          {/* Popover dropdown menu */}
          {isProfileOpen && (
            <>
              {/* Overlay back-click handler */}
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-bg-card border border-border-subtle shadow-premium p-2.5 z-50 animate-fade-in text-left">
                <div className="px-3.5 py-3 border-b border-border-subtle mb-1.5">
                  <p className="text-sm font-bold text-text-main truncate">{currentProfile?.fullName}</p>
                  <p className="text-[10px] text-text-secondary capitalize truncate">{currentProfile?.role}</p>
                </div>
                
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setFullName(currentProfile.fullName);
                    setEmail(currentProfile.email || 'contact@imprimerie.sn');
                    setPhone(currentProfile.phone || '');
                    setRole(currentProfile.role);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800/40 transition"
                >
                  <User className="w-4 h-4" />
                  <span>Modifier le profil</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800/40 transition border-t border-border-subtle/40 mt-1.5 pt-2"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-500">Se déconnecter</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Edit Profile Form Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-bg-card border border-border-subtle rounded-3xl w-full max-w-sm shadow-premium overflow-hidden transform scale-100 transition duration-300">
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <h3 className="text-base font-bold text-text-main">
                Modifier mon Profil
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-700 dark:text-rose-450 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Nom Complet *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Adresse Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Téléphone portable</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                    />
                  </div>
                </div>

                {/* Password Change */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Modifier le mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Laisser vide pour ne pas modifier"
                    className="w-full px-4 py-2.5 bg-input-bg border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition"
                  />
                </div>

                {/* Role select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Rôle *</label>
                  <Dropdown
                    value={role}
                    onChange={(val) => setRole(val as any)}
                    options={[
                      { value: 'admin', label: 'Administrateur' },
                      { value: 'commercial', label: 'Commercial' },
                      { value: 'chef_atelier', label: "Chef d'Atelier" },
                    ]}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-border-subtle hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-text-secondary transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold transition shadow-sm"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
