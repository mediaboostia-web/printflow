'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  mockProfiles,
  mockOrganizations,
  mockClients,
  mockProducts,
  allQuotes,
  allBATs,
  allPOs,
  allInvoices,
  allPayments,
  mockCredentials,
  mockSuperAdmin
} from '@/lib/mock/data';
import {
  Profile,
  Organization,
  Client,
  Product,
  ProductPriceTier,
  Quote,
  BAT,
  PurchaseOrder,
  Invoice,
  Payment,
  PaymentMethod,
  DeliveryNote,
  OnlineOrder,
  AuditLog
} from '@/types/domain';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Creates a brand-new Supabase Auth user (e.g. a Super Admin provisioning an
// org admin, or an admin adding a colleague) without hijacking the CALLER's
// own active session. `supabase.auth.signUp` normally also switches the
// client's current session to the newly created user — this snapshots the
// caller's session first and restores it right after, which is the standard
// anon-key-only workaround for "create a user for someone else" (the
// alternative, `supabase.auth.admin.createUser`, needs the service_role key,
// which this project intentionally does not have).
async function createAuthUserPreservingSession(email: string, password: string): Promise<{ userId: string | null; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { userId: null, error: 'Supabase non configuré.' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const previousSession = sessionData.session;

  const { data, error } = await supabase.auth.signUp({ email: email.trim().toLowerCase(), password });

  if (previousSession) {
    await supabase.auth.setSession({
      access_token: previousSession.access_token,
      refresh_token: previousSession.refresh_token
    });
  }

  if (error || !data.user) {
    return { userId: null, error: error?.message || "Impossible de créer le compte utilisateur." };
  }

  return { userId: data.user.id };
}

// Default configuration details matching parameters
const defaultTaxes = [
  { id: 'tax-1', name: 'TVA Sénégal Standard', rate: 18 },
  { id: 'tax-2', name: 'TVA Exonérée / Export', rate: 0 },
  { id: 'tax-3', name: 'TVA Hors-champ', rate: 0 }
];

const defaultMachines = [
  { id: 'm-1', name: 'Presse Offset Heidelberg Speedmaster', type: 'Offset' },
  { id: 'm-2', name: 'Xerox Versant 180 Press', type: 'Numérique' },
  { id: 'm-3', name: 'Traceur Roland TrueVIS SG2-640', type: 'Grand Format' },
  { id: 'm-4', name: 'Massicot Polar 92 ED', type: 'Finition / Découpe' }
];

const defaultPartners = [
  { id: 'p-1', name: 'Express Plastification Dakar', service: 'Pelliculage & Vernis' },
  { id: 'p-2', name: 'Mali Packaging S.A.', service: 'Façonnage Cartonnage' }
];

const defaultPaperFormats = [
  'A4 (21 x 29.7 cm)',
  'A3 (29.7 x 42 cm)',
  'A5 (14.8 x 21 cm)',
  'A6 (10.5 x 14.8 cm)',
  'Roll-up (85 x 200 cm)',
  'Bâche 2x1m',
  'Carte de visite (8.5 x 5.4 cm)',
  'Enveloppe DL (11 x 22 cm)'
];

export interface OrgStylePreferences {
  themeColor: 'emerald' | 'cyan' | 'violet' | 'amber';
  fontFamily: 'system' | 'serif' | 'mono';
  invoiceTemplate: 'modern' | 'tech' | 'classic';
}

interface AppState {
  // Active Profile & Session State
  currentOrgId: string;
  currentProfileId: string;
  isSidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  activeCurrency: 'FCFA' | 'EUR' | 'USD' | 'MAD' | 'GNF';
  setCurrency: (code: 'FCFA' | 'EUR' | 'USD' | 'MAD' | 'GNF') => void;
  orgStylePreferences: OrgStylePreferences;
  setOrgPreferences: (prefs: Partial<OrgStylePreferences>) => void;

  // Auth — backed by real Supabase Auth (auth.users), sessions live in cookies
  // via lib/supabaseClient.ts's createBrowserClient, not just in this persisted flag.
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  superAdminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Domain Lists (Reactive Mock DB)
  organizations: Organization[];
  profiles: Profile[];
  superadmins: { id: string; fullName: string; email: string; password?: string; authUserId?: string; createdAt: string }[];
  clients: Client[];
  products: Product[];
  quotes: Quote[];
  bats: BAT[];
  pos: PurchaseOrder[];
  deliveries: DeliveryNote[];
  invoices: Invoice[];
  payments: Payment[];
  onlineOrders: OnlineOrder[];
  subscriptionPlans: { id: string; name: string; priceFcfa: number; billingCycle: '7_days' | 'monthly' | '6_months' | '12_months'; description: string }[];
  availableTemplates: { id: string; name: string }[];
  auditLogs: AuditLog[];

  // App Settings
  taxes: { id: string; name: string; rate: number }[];
  machines: { id: string; name: string; type: string }[];
  partners: { id: string; name: string; service: string }[];
  paperFormats: string[];

  // Getters
  getCurrentOrg: () => Organization;
  getCurrentProfile: () => Profile;
  getOrgProfiles: () => Profile[];
  canImportBAT: () => boolean;
  canAddPersonnel: () => boolean;
  canUsePublicCatalogue: () => boolean;

  // Session Actions
  setOrg: (orgId: string) => void;
  setProfile: (profileId: string) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;

  // Domain Actions (CRUD)
  // 1. Clients
  addClient: (client: Omit<Client, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Client;
  editClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;

  // 1b. Products (Catalogue)
  addProduct: (product: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Product;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleCatalogueEnabled: () => void;

  // 2. Quotes
  addQuote: (quote: Quote) => void;
  editQuote: (quote: Quote) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;

  // 3. BAT
  addBATVersion: (batId: string, version: any) => void;
  validateBAT: (batId: string, validatedBy: string) => void;
  refuseBAT: (batId: string, reason: string) => void;

  // 4. POs
  addPO: (po: PurchaseOrder) => void;
  updatePOStatus: (poId: string, status: PurchaseOrder['status']) => void;

  // 5. Deliveries
  addDelivery: (delivery: DeliveryNote) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryNote['status']) => void;

  // 6. Invoices
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  recordPayment: (invoiceId: string, amountFcfa: number, method: PaymentMethod, note?: string) => void;

  // 7. Config & Org Settings
  updateProfile: (profile: Profile) => void;
  updateOrgDetails: (org: Organization) => void;
  addTax: (tax: { name: string; rate: number }) => void;
  deleteTax: (taxId: string) => void;
  addMachine: (machine: { name: string; type: string }) => void;
  deleteMachine: (machineId: string) => void;
  addPartner: (partner: { name: string; service: string }) => void;
  deletePartner: (partnerId: string) => void;
  addPaperFormat: (fmt: string) => void;
  deletePaperFormat: (fmt: string) => void;

  // Super Admin & Staff Management Actions
  addAuditLog: (action: string, options?: { entityType?: string; entityId?: string; metadata?: any } | null, organizationId?: string) => void;
  addOrganizationWithAdmin: (org: { name: string; address?: string; phone?: string; email?: string; subscriptionPlanId?: string }, admin: { fullName: string; email: string; role: 'admin'; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  toggleOrganizationActive: (orgId: string) => void;
  updateOrganizationSubscription: (orgId: string, planId: string, status: 'active' | 'suspended' | 'expired', endDate: string) => void;
  addSubscriptionPlan: (plan: { name: string; priceFcfa: number; billingCycle: '7_days' | 'monthly' | '6_months' | '12_months'; description: string }) => void;
  updateSubscriptionPlan: (plan: { id: string; name: string; priceFcfa: number; billingCycle: '7_days' | 'monthly' | '6_months' | '12_months'; description: string }) => void;
  deleteSubscriptionPlan: (planId: string) => void;
  addInvoiceTemplate: (template: { id: string; name: string }) => void;

  // Collaborators/Staff CRUD Actions
  addProfile: (profile: Omit<Profile, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteProfile: (profileId: string) => void;
  toggleProfileActive: (profileId: string) => void;

  // New Fullstack & Database Sync Actions
  hasLoadedSupabaseData?: boolean;
  isSupabaseLoading?: boolean;
  loadSupabaseData: (force?: boolean) => Promise<void>;
  registerFreeTrial: (data: { orgName: string; adminFullName: string; email: string; phone?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (profileId: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  addSuperAdmin: (superadmin: { fullName: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;

  // Public Catalogue & Online Orders (Formule Pro)
  updateOnlineOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;
  convertOnlineOrderToQuote: (orderId: string) => void;
  fetchPublicCatalogue: (orgId: string) => Promise<{ org: Organization | null; products: Product[] }>;
  submitPublicOrder: (orgId: string, payload: {
    companyName: string;
    contactName?: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
    items: { productId?: string; name: string; materialType?: Product['materialType']; format: string; quantity: number; unitPriceFcfa: number; lineTotalFcfa: number }[];
  }) => Promise<{ success: boolean; orderNumber?: string; error?: string }>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // Defaults
  currentOrgId: 'org-sud-print',
  currentProfileId: 'user-sud-admin',
  isSidebarCollapsed: false,
  theme: 'light',
  activeCurrency: 'FCFA',
  setCurrency: (code) => {
    import('@/lib/utils/money').then(m => m.setActiveCurrency(code));
    set({ activeCurrency: code });
  },
  orgStylePreferences: {
    themeColor: 'emerald',
    fontFamily: 'system',
    invoiceTemplate: 'modern'
  },

  // Auth
  isAuthenticated: false,
  isSuperAdmin: false,
  hasHydrated: false,
  setHasHydrated: (value) => set({ hasHydrated: value }),

  checkSession: async () => {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let sa = get().superadmins.find(s => s.authUserId === user.id);
        if (!sa) {
          const { data: saRow } = await supabase.from('superadmins').select('*').eq('auth_user_id', user.id).maybeSingle();
          if (saRow) {
            sa = { id: saRow.id, fullName: saRow.full_name, email: saRow.email, authUserId: saRow.auth_user_id, createdAt: saRow.created_at };
          }
        }
        if (sa) {
          if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
          set({ isAuthenticated: true, isSuperAdmin: true });
          return;
        }

        let profile = get().profiles.find(p => p.authUserId === user.id);
        if (!profile) {
          const { data: row } = await supabase.from('profiles').select('*').eq('auth_user_id', user.id).maybeSingle();
          if (row) {
            profile = {
              id: row.id,
              organizationId: row.organization_id,
              fullName: row.full_name,
              role: row.role,
              email: row.email,
              phone: row.phone,
              isActive: row.is_active,
              authUserId: row.auth_user_id,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
          }
        }

        if (profile && profile.isActive) {
          if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
          set({
            isAuthenticated: true,
            isSuperAdmin: false,
            currentProfileId: profile.id,
            currentOrgId: profile.organizationId,
          });
          return;
        }
      }
    }

    const state = get();
    if (state.isAuthenticated) {
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('printflow_session=true');
      if (hasCookie || !isSupabaseConfigured) {
        if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
        return;
      }
    }

    if (typeof document !== 'undefined') {
      document.cookie = 'printflow_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    set({ isAuthenticated: false, isSuperAdmin: false });
  },

  login: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (data?.user && !error) {
          let profile = get().profiles.find(p => p.authUserId === data.user!.id || p.email?.toLowerCase() === normalizedEmail);
          if (!profile) {
            const { data: row } = await supabase.from('profiles').select('*').eq('auth_user_id', data.user.id).maybeSingle();
            if (row) {
              profile = {
                id: row.id,
                organizationId: row.organization_id,
                fullName: row.full_name,
                role: row.role,
                email: row.email,
                phone: row.phone,
                isActive: row.is_active,
                authUserId: row.auth_user_id,
                createdAt: row.created_at,
                updatedAt: row.updated_at
              };
              const resolvedProfile = profile;
              set(state => ({ profiles: [...state.profiles.filter(p => p.id !== resolvedProfile.id), resolvedProfile] }));
            }
          }

          if (profile) {
            if (!profile.isActive) {
              await supabase.auth.signOut();
              return { success: false, error: 'Ce compte a été désactivé. Contactez votre administrateur.' };
            }
            const org = get().organizations.find(o => o.id === profile!.organizationId);
            if (org && org.isActive === false) {
              await supabase.auth.signOut();
              return { success: false, error: 'Cette organisation est suspendue par le Super Administrateur.' };
            }

            if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
            set({
              isAuthenticated: true,
              isSuperAdmin: false,
              currentProfileId: profile.id,
              currentOrgId: profile.organizationId,
            });
            return { success: true };
          }
        }
      } catch (e) {
        console.warn("Supabase signIn attempt error, falling back to local credentials:", e);
      }
    }

    const mockCred = mockCredentials.find(c => c.email.toLowerCase() === normalizedEmail && c.password === password);
    let localProfile = mockCred 
      ? get().profiles.find(p => p.id === mockCred.profileId)
      : get().profiles.find(p => p.email?.toLowerCase() === normalizedEmail && (p.password === password || !p.password));

    if (localProfile) {
      if (!localProfile.isActive) {
        return { success: false, error: 'Ce compte a été désactivé. Contactez votre administrateur.' };
      }
      const org = get().organizations.find(o => o.id === localProfile!.organizationId);
      if (org && org.isActive === false) {
        return { success: false, error: 'Cette organisation est suspendue par le Super Administrateur.' };
      }

      if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
      set({
        isAuthenticated: true,
        isSuperAdmin: false,
        currentProfileId: localProfile.id,
        currentOrgId: localProfile.organizationId,
      });
      return { success: true };
    }

    return { success: false, error: 'Adresse e-mail ou mot de passe incorrect.' };
  },

  superAdminLogin: async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (data?.user && !error) {
          let sa = get().superadmins.find(s => s.authUserId === data.user!.id || s.email.toLowerCase() === normalizedEmail);
          if (!sa) {
            const { data: row } = await supabase.from('superadmins').select('*').eq('auth_user_id', data.user.id).maybeSingle();
            if (row) {
              sa = { id: row.id, fullName: row.full_name, email: row.email, authUserId: row.auth_user_id, createdAt: row.created_at };
              const resolvedSa = sa;
              set(state => ({ superadmins: [...state.superadmins.filter(s => s.id !== resolvedSa.id), resolvedSa] }));
            }
          }

          if (sa) {
            if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
            set({ isAuthenticated: true, isSuperAdmin: true });
            return { success: true };
          }
        }
      } catch (e) {
        console.warn("Supabase superAdminLogin attempt error:", e);
      }
    }

    const isMockSA = (normalizedEmail === mockSuperAdmin.email.toLowerCase() && password === mockSuperAdmin.password) ||
      get().superadmins.some(s => s.email.toLowerCase() === normalizedEmail && (s.password === password || !s.password));

    if (isMockSA) {
      if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
      set({ isAuthenticated: true, isSuperAdmin: true });
      return { success: true };
    }

    return { success: false, error: 'Identifiants Super Admin invalides.' };
  },

  logout: () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'printflow_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    set({ isAuthenticated: false, isSuperAdmin: false });
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  },

  registerFreeTrial: async ({ orgName, adminFullName, email, phone, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    let authUserId: string | undefined = undefined;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password || 'sudprint2026',
        });

        if (authData?.user) {
          authUserId = authData.user.id;
        } else if (authError?.message?.includes('already registered')) {
          const { data: signInData } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password: password || 'sudprint2026',
          });
          if (signInData?.user) {
            authUserId = signInData.user.id;
          }
        }
      } catch (err) {
        console.warn("Supabase signUp attempt warning:", err);
      }
    }

    const orgId = `org-${Date.now()}`;
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newOrg: Organization = {
      id: orgId,
      name: orgName.trim(),
      address: '',
      phone: phone?.trim() || '',
      email: normalizedEmail,
      isActive: true,
      subscriptionPlanId: 'plan-free',
      subscriptionStatus: 'active',
      subscriptionEndDate: endDate,
      catalogueEnabled: false,
      createdAt: new Date().toISOString(),
    };

    const profileId = `user-${Date.now()}`;
    const newProfile: Profile = {
      id: profileId,
      organizationId: orgId,
      fullName: adminFullName.trim(),
      role: 'admin',
      email: normalizedEmail,
      phone: phone?.trim() || '',
      isActive: true,
      authUserId,
      password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('organizations').insert([{
          id: newOrg.id,
          name: newOrg.name,
          phone: newOrg.phone,
          email: newOrg.email,
          is_active: true,
          subscription_plan_id: newOrg.subscriptionPlanId,
          subscription_status: newOrg.subscriptionStatus,
          subscription_end_date: newOrg.subscriptionEndDate,
          catalogue_enabled: false,
          created_at: newOrg.createdAt,
        }]);

        await supabase.from('profiles').insert([{
          id: newProfile.id,
          organization_id: newProfile.organizationId,
          full_name: newProfile.fullName,
          role: newProfile.role,
          email: newProfile.email,
          phone: newProfile.phone,
          is_active: true,
          auth_user_id: authUserId || null,
          password: newProfile.password || null,
          created_at: newProfile.createdAt,
          updated_at: newProfile.updatedAt,
        }]);
      } catch (err) {
        console.error('Error inserting free trial org/profile in Supabase:', err);
      }
    }

    if (typeof document !== 'undefined') document.cookie = 'printflow_session=true; path=/; max-age=86400';
    set(state => ({
      organizations: [newOrg, ...state.organizations],
      profiles: [newProfile, ...state.profiles],
      currentOrgId: orgId,
      currentProfileId: profileId,
      isAuthenticated: true,
      isSuperAdmin: false,
    }));

    get().addAuditLog(`Essai gratuit 7 jours créé pour "${orgName.trim()}" (${adminFullName.trim()})`, null, orgId);

    return { success: true };
  },

  loadSupabaseData: async (force = false) => {
    if (!isSupabaseConfigured || !supabase) return;
    if (!force && get().hasLoadedSupabaseData) return;
    if (get().isSupabaseLoading) return;

    set({ isSupabaseLoading: true });
    const currentOrgId = get().currentOrgId;
    const isSuperAdmin = get().isSuperAdmin;

    try {
      let orgQuery = supabase.from('organizations').select('*');
      let profileQuery = supabase.from('profiles').select('*');
      let clientQuery = supabase.from('clients').select('*');
      let productQuery = supabase.from('products').select('*');
      let tierQuery = supabase.from('product_price_tiers').select('*');
      let quoteQuery = supabase.from('quotes').select('*');
      let quoteItemQuery = supabase.from('quote_items').select('*');
      let batQuery = supabase.from('bats').select('*');
      let batVersionQuery = supabase.from('bat_versions').select('*');
      let poQuery = supabase.from('purchase_orders').select('*');
      let poItemQuery = supabase.from('purchase_order_items').select('*');
      let deliveryQuery = supabase.from('delivery_notes').select('*');
      let deliveryItemQuery = supabase.from('delivery_note_items').select('*');
      let invoiceQuery = supabase.from('invoices').select('*');
      let invoiceItemQuery = supabase.from('invoice_items').select('*');
      let paymentQuery = supabase.from('payments').select('*');
      let onlineOrderQuery = supabase.from('online_orders').select('*');
      let taxQuery = supabase.from('taxes').select('*');
      let machineQuery = supabase.from('machines').select('*');
      let partnerQuery = supabase.from('partners').select('*');
      let paperFormatQuery = supabase.from('paper_formats').select('*');
      let auditQuery = supabase.from('audit_logs').select('*');

      if (!isSuperAdmin && currentOrgId) {
        orgQuery = orgQuery.eq('id', currentOrgId);
        profileQuery = profileQuery.eq('organization_id', currentOrgId);
        clientQuery = clientQuery.eq('organization_id', currentOrgId);
        productQuery = productQuery.eq('organization_id', currentOrgId);
        quoteQuery = quoteQuery.eq('organization_id', currentOrgId);
        batQuery = batQuery.eq('organization_id', currentOrgId);
        poQuery = poQuery.eq('organization_id', currentOrgId);
        deliveryQuery = deliveryQuery.eq('organization_id', currentOrgId);
        invoiceQuery = invoiceQuery.eq('organization_id', currentOrgId);
        onlineOrderQuery = onlineOrderQuery.eq('organization_id', currentOrgId);
        taxQuery = taxQuery.eq('organization_id', currentOrgId);
        machineQuery = machineQuery.eq('organization_id', currentOrgId);
        partnerQuery = partnerQuery.eq('organization_id', currentOrgId);
        paperFormatQuery = paperFormatQuery.eq('organization_id', currentOrgId);
        auditQuery = auditQuery.eq('organization_id', currentOrgId);
      }

      const [
        { data: orgRows },
        { data: profileRows },
        { data: clientRows },
        { data: productRows },
        { data: tierRows },
        { data: quoteRows },
        { data: quoteItemRows },
        { data: batRows },
        { data: batVersionRows },
        { data: poRows },
        { data: poItemRows },
        { data: deliveryRows },
        { data: deliveryItemRows },
        { data: invoiceRows },
        { data: invoiceItemRows },
        { data: paymentRows },
        { data: onlineOrderRows },
        { data: taxRows },
        { data: machineRows },
        { data: partnerRows },
        { data: paperFormatRows },
        { data: auditRows }
      ] = await Promise.all([
        orgQuery, profileQuery, clientQuery, productQuery, tierQuery,
        quoteQuery, quoteItemQuery, batQuery, batVersionQuery, poQuery,
        poItemQuery, deliveryQuery, deliveryItemQuery, invoiceQuery,
        invoiceItemQuery, paymentQuery, onlineOrderQuery, taxQuery,
        machineQuery, partnerQuery, paperFormatQuery, auditQuery
      ]) as any[];

      const updates: Partial<AppState> = {
        hasLoadedSupabaseData: true,
        isSupabaseLoading: false
      };

      if (orgRows && orgRows.length > 0) {
        updates.organizations = orgRows.map((o: any) => ({
          id: o.id,
          name: o.name,
          address: o.address || '',
          phone: o.phone || '',
          email: o.email || '',
          isActive: o.is_active !== false,
          subscriptionPlanId: o.subscription_plan_id || 'plan-free',
          subscriptionStatus: o.subscription_status || 'active',
          subscriptionEndDate: o.subscription_end_date || new Date(Date.now() + 7 * 86400000).toISOString(),
          catalogueEnabled: o.catalogue_enabled !== false,
          createdAt: o.created_at
        }));
      }

      if (profileRows && profileRows.length > 0) {
        updates.profiles = profileRows.map((p: any) => ({
          id: p.id,
          organizationId: p.organization_id,
          fullName: p.full_name,
          role: p.role,
          email: p.email,
          phone: p.phone,
          isActive: p.is_active !== false,
          authUserId: p.auth_user_id,
          password: p.password,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
      }

      if (clientRows && clientRows.length > 0) {
        updates.clients = clientRows.map((c: any) => ({
          id: c.id,
          organizationId: c.organization_id,
          companyName: c.company_name,
          contactName: c.contact_name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          createdBy: c.created_by,
          source: c.source || 'interne',
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
      }

      if (productRows && productRows.length > 0) {
        updates.products = productRows.map((p: any) => ({
          id: p.id,
          organizationId: p.organization_id,
          name: p.name,
          category: p.category,
          description: p.description,
          materialType: p.material_type || 'papier',
          paperType: p.paper_type,
          grammageG: p.grammage_g,
          format: p.format,
          formatOptions: p.format_options || [],
          finishing: p.finishing,
          photoUrl: p.photo_url,
          unitPriceFcfa: Number(p.unit_price_fcfa),
          vatRate: Number(p.vat_rate),
          isActive: p.is_active !== false,
          priceTiers: (tierRows || [])
            .filter((t: any) => t.product_id === p.id)
            .map((t: any) => ({
              id: t.id,
              productId: t.product_id,
              minQuantity: t.min_quantity,
              maxQuantity: t.max_quantity ?? undefined,
              unitPriceFcfa: Number(t.unit_price_fcfa)
            })),
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
      }

      if (quoteRows && quoteRows.length > 0) {
        updates.quotes = quoteRows.map((q: any) => ({
          id: q.id,
          organizationId: q.organization_id,
          quoteNumber: q.quote_number,
          clientId: q.client_id,
          status: q.status,
          subtotalFcfa: Number(q.subtotal_fcfa),
          vatAmountFcfa: Number(q.vat_amount_fcfa),
          marginPercent: q.margin_percent ? Number(q.margin_percent) : undefined,
          totalFcfa: Number(q.total_fcfa),
          notes: q.notes,
          createdBy: q.created_by,
          validatedBy: q.validated_by,
          validatedAt: q.validated_at,
          createdAt: q.created_at,
          updatedAt: q.updated_at,
          items: (quoteItemRows || [])
            .filter((qi: any) => qi.quote_id === q.id)
            .map((qi: any) => ({
              id: qi.id,
              quoteId: qi.quote_id,
              productId: qi.product_id,
              descriptionSnapshot: qi.description_snapshot,
              paperSnapshot: qi.paper_snapshot,
              finishingSnapshot: qi.finishing_snapshot,
              quantity: qi.quantity,
              unitPriceFcfa: Number(qi.unit_price_fcfa),
              vatRate: Number(qi.vat_rate),
              lineTotalFcfa: Number(qi.line_total_fcfa),
              sortOrder: qi.sort_order
            }))
        }));
      }

      if (batRows && batRows.length > 0) {
        updates.bats = batRows.map((b: any) => ({
          id: b.id,
          organizationId: b.organization_id,
          quoteId: b.quote_id,
          status: b.status,
          currentVersionId: b.current_version_id,
          validatedBy: b.validated_by,
          validatedAt: b.validated_at,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
          versions: (batVersionRows || [])
            .filter((bv: any) => bv.bat_id === b.id)
            .map((bv: any) => ({
              id: bv.id,
              batId: bv.bat_id,
              versionNumber: bv.version_number,
              filePath: bv.file_path,
              fileType: bv.file_type,
              comment: bv.comment,
              uploadedBy: bv.uploaded_by,
              uploadedAt: bv.uploaded_at
            }))
        }));
      }

      if (poRows && poRows.length > 0) {
        updates.pos = poRows.map((po: any) => ({
          id: po.id,
          organizationId: po.organization_id,
          orderNumber: po.order_number,
          quoteId: po.quote_id,
          batId: po.bat_id,
          status: po.status,
          machineSetup: po.machine_setup,
          depositAmountFcfa: po.deposit_amount_fcfa ? Number(po.deposit_amount_fcfa) : undefined,
          createdBy: po.created_by,
          createdAt: po.created_at,
          updatedAt: po.updated_at,
          items: (poItemRows || [])
            .filter((poi: any) => poi.purchase_order_id === po.id)
            .map((poi: any) => ({
              id: poi.id,
              purchaseOrderId: poi.purchase_order_id,
              quoteItemId: poi.quote_item_id,
              description: poi.description,
              finishing: poi.finishing,
              quantity: poi.quantity,
              sortOrder: poi.sort_order
            }))
        }));
      }

      if (deliveryRows && deliveryRows.length > 0) {
        updates.deliveries = deliveryRows.map((d: any) => ({
          id: d.id,
          organizationId: d.organization_id,
          deliveryNumber: d.delivery_number,
          purchaseOrderId: d.purchase_order_id,
          status: d.status,
          deliveredTo: d.delivered_to,
          signatureUrl: d.signature_url,
          deliveredAt: d.delivered_at,
          createdBy: d.createdBy,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          items: (deliveryItemRows || [])
            .filter((di: any) => di.delivery_note_id === d.id)
            .map((di: any) => ({
              id: di.id,
              deliveryNoteId: di.delivery_note_id,
              description: di.description,
              quantityReady: di.quantity_ready
            }))
        }));
      }

      if (invoiceRows && invoiceRows.length > 0) {
        updates.invoices = invoiceRows.map((inv: any) => ({
          id: inv.id,
          organizationId: inv.organization_id,
          invoiceNumber: inv.invoice_number,
          quoteId: inv.quote_id,
          batId: inv.bat_id,
          clientId: inv.client_id,
          status: inv.status,
          subtotalFcfa: Number(inv.subtotal_fcfa),
          vatAmountFcfa: Number(inv.vat_amount_fcfa),
          totalFcfa: Number(inv.total_fcfa),
          amountPaidFcfa: Number(inv.amount_paid_fcfa || 0),
          isDeleted: inv.is_deleted === true,
          deletedReason: inv.deleted_reason,
          deletedBy: inv.deleted_by,
          deletedAt: inv.deleted_at,
          createdBy: inv.created_by,
          createdAt: inv.created_at,
          updatedAt: inv.updated_at,
          items: (invoiceItemRows || [])
            .filter((ivi: any) => ivi.invoice_id === inv.id)
            .map((ivi: any) => ({
              id: ivi.id,
              invoiceId: ivi.invoice_id,
              quoteItemId: ivi.quote_item_id,
              description: ivi.description,
              quantity: ivi.quantity,
              unitPriceFcfa: Number(ivi.unit_price_fcfa),
              vatRate: Number(ivi.vat_rate),
              lineTotalFcfa: Number(ivi.line_total_fcfa)
            }))
        }));
      }

      if (paymentRows && paymentRows.length > 0) {
        updates.payments = paymentRows.map((pay: any) => ({
          id: pay.id,
          invoiceId: pay.invoice_id,
          amountFcfa: Number(pay.amount_fcfa),
          method: pay.method,
          paidAt: pay.paid_at,
          note: pay.note,
          recordedBy: pay.recorded_by,
          isCancelled: pay.is_cancelled === true,
          cancelledReason: pay.cancelled_reason,
          cancelledBy: pay.cancelled_by,
          cancelledAt: pay.cancelled_at,
          createdAt: pay.created_at
        }));
      }

      if (onlineOrderRows && onlineOrderRows.length > 0) {
        updates.onlineOrders = onlineOrderRows.map((o: any) => ({
          id: o.id,
          organizationId: o.organization_id,
          orderNumber: o.order_number,
          clientId: o.client_id,
          status: o.status,
          items: o.items || [],
          subtotalFcfa: Number(o.subtotal_fcfa),
          notes: o.notes,
          createdAt: o.created_at,
          updatedAt: o.updated_at
        }));
      }

      if (taxRows && taxRows.length > 0) {
        updates.taxes = taxRows
          .filter((t: any) => t.organization_id === currentOrgId)
          .map((t: any) => ({ id: t.id, name: t.name, rate: Number(t.rate) }));
      }
      if (machineRows && machineRows.length > 0) {
        updates.machines = machineRows
          .filter((m: any) => m.organization_id === currentOrgId)
          .map((m: any) => ({ id: m.id, name: m.name, type: m.type }));
      }
      if (partnerRows && partnerRows.length > 0) {
        updates.partners = partnerRows
          .filter((p: any) => p.organization_id === currentOrgId)
          .map((p: any) => ({ id: p.id, name: p.name, service: p.service }));
      }
      if (paperFormatRows && paperFormatRows.length > 0) {
        updates.paperFormats = paperFormatRows
          .filter((pf: any) => pf.organization_id === currentOrgId)
          .map((pf: any) => pf.format_name);
      }
      if (auditRows && auditRows.length > 0) {
        updates.auditLogs = auditRows.map((a: any) => ({
          id: a.id,
          organizationId: a.organization_id,
          entityType: a.entity_type,
          entityId: a.entity_id,
          action: a.action,
          actorId: a.actor_id,
          actorRole: a.actor_role,
          occurredAt: a.occurred_at,
          metadata: a.metadata
        }));
      }

      set(updates);
    } catch (e) {
      console.error("Error in loadSupabaseData:", e);
    }
  },

  organizations: mockOrganizations.map(o => ({
    ...o,
    isActive: true,
    subscriptionPlanId: o.id === 'org-sud-print' ? 'plan-pro' : 'plan-std',
    subscriptionStatus: 'active',
    subscriptionEndDate: o.id === 'org-sud-print' ? '2027-01-01T00:00:00Z' : '2026-12-31T23:59:59Z',
    catalogueEnabled: true
  })),
  profiles: mockProfiles.map(p => ({
    ...p,
    password: p.id === 'user-sud-admin' ? 'sudprint2026' : p.id === 'user-sahel-admin' ? 'sahel2026' : 'collaborateur2026'
  })),
  superadmins: [
    { id: 'superadmin-1', fullName: 'Root Administrateur', email: 'superadmin@printflow.io', password: 'RootAccess#2026', createdAt: '2026-01-01T08:00:00Z' }
  ],
  clients: mockClients,
  products: mockProducts,
  quotes: allQuotes,
  bats: allBATs,
  pos: allPOs,
  deliveries: [], // Empty initially
  invoices: allInvoices,
  payments: allPayments,
  onlineOrders: [],
  subscriptionPlans: [
    { id: 'plan-free', name: 'Essai Gratuit 7 Jours', priceFcfa: 0, billingCycle: '7_days', description: "7 jours d'essai gratuit. Import BAT désactivé, aucun ajout de personnel, catalogue public en ligne non disponible." },
    { id: 'plan-std', name: 'Formule Standard', priceFcfa: 15000, billingCycle: 'monthly', description: "Toutes les fonctionnalités standard avec ajout de personnel à la carte. Import BAT désactivé. Catalogue public en ligne réservé à la Formule Pro." },
    { id: 'plan-pro', name: 'Formule Pro', priceFcfa: 65000, billingCycle: 'monthly', description: "Toutes les fonctionnalités incluses sans limite. Import BAT et personnel illimité. Catalogue public en ligne avec commandes clients externes, enregistrées automatiquement dans votre tableau de bord." }
  ],
  availableTemplates: [
    { id: 'modern', name: 'Gabarit Néon Moderne' },
    { id: 'tech', name: 'Gabarit Cyber Grid' },
    { id: 'classic', name: 'Gabarit Classique Épuré' }
  ],
  auditLogs: [
    { id: 'log-1', organizationId: 'system', entityType: 'system', entityId: 'sys', action: 'Initialisation de la plateforme Print_Flow', occurredAt: '2026-07-15T08:00:00Z' },
    { id: 'log-2', organizationId: 'org-sud-print', entityType: 'subscription', entityId: 'org-sud-print', action: 'Abonnement Pro activé pour Sud Print', occurredAt: '2026-07-15T08:05:00Z' },
    { id: 'log-3', organizationId: 'org-sahel-graphique', entityType: 'subscription', entityId: 'org-sahel-graphique', action: 'Abonnement Pro activé pour Sahel Graphique', occurredAt: '2026-07-15T08:10:00Z' }
  ],

  taxes: defaultTaxes,
  machines: defaultMachines,
  partners: defaultPartners,
  paperFormats: defaultPaperFormats,

  // Getters
  getCurrentOrg: () => {
    const { currentOrgId, organizations } = get();
    return organizations.find(org => org.id === currentOrgId) || organizations[0];
  },

  getCurrentProfile: () => {
    const { currentProfileId, profiles } = get();
    return profiles.find(profile => profile.id === currentProfileId) || profiles[0];
  },

  getOrgProfiles: () => {
    const { currentOrgId, profiles } = get();
    return profiles.filter(profile => profile.organizationId === currentOrgId);
  },

  canImportBAT: () => {
    const org = get().getCurrentOrg();
    return org ? org.subscriptionPlanId === 'plan-pro' : false;
  },

  canAddPersonnel: () => {
    const org = get().getCurrentOrg();
    return org ? org.subscriptionPlanId !== 'plan-free' : false;
  },

  canUsePublicCatalogue: () => {
    const org = get().getCurrentOrg();
    return org ? org.subscriptionPlanId === 'plan-pro' : false;
  },

  // Actions
  setOrg: (orgId: string) => {
    const firstProfile = get().profiles.find(p => p.organizationId === orgId);
    set({
      currentOrgId: orgId,
      currentProfileId: firstProfile ? firstProfile.id : '',
    });
  },

  setProfile: (profileId: string) => {
    const profile = get().profiles.find(p => p.id === profileId);
    if (profile) {
      set({
        currentProfileId: profileId,
        currentOrgId: profile.organizationId,
      });
    }
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: nextTheme });
    
    if (typeof window !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },

  // Clients Actions
  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: `client-${Date.now()}`,
      organizationId: get().currentOrgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set(state => ({ clients: [newClient, ...state.clients] }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('clients').insert([{
        id: newClient.id,
        organization_id: newClient.organizationId,
        company_name: newClient.companyName,
        contact_name: newClient.contactName,
        phone: newClient.phone,
        email: newClient.email,
        address: newClient.address,
        created_by: newClient.createdBy,
        created_at: newClient.createdAt,
        updated_at: newClient.updatedAt
      }]).then(({ error }: any) => {
        if (error) console.error("Error adding client to Supabase:", error);
      });
    }

    return newClient;
  },

  editClient: (updatedClient) => {
    set(state => ({
      clients: state.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('clients').update({
        company_name: updatedClient.companyName,
        contact_name: updatedClient.contactName,
        phone: updatedClient.phone,
        email: updatedClient.email,
        address: updatedClient.address,
        updated_at: new Date().toISOString()
      }).eq('id', updatedClient.id).then(({ error }: any) => {
        if (error) console.error("Error editing client in Supabase:", error);
      });
    }
  },

  deleteClient: (clientId) => {
    set(state => ({
      clients: state.clients.filter(c => c.id !== clientId)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('clients').delete().eq('id', clientId).then(({ error }: any) => {
        if (error) console.error("Error deleting client in Supabase:", error);
      });
    }
  },

  // Products (Catalogue) Actions
  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      organizationId: get().currentOrgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set(state => ({ products: [newProduct, ...state.products] }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').insert([{
        id: newProduct.id,
        organization_id: newProduct.organizationId,
        name: newProduct.name,
        category: newProduct.category,
        description: newProduct.description,
        material_type: newProduct.materialType || 'papier',
        paper_type: newProduct.paperType,
        grammage_g: newProduct.grammageG,
        format: newProduct.format,
        format_options: newProduct.formatOptions || [],
        finishing: newProduct.finishing,
        photo_url: newProduct.photoUrl,
        unit_price_fcfa: newProduct.unitPriceFcfa,
        vat_rate: newProduct.vatRate,
        is_active: newProduct.isActive,
        created_at: newProduct.createdAt,
        updated_at: newProduct.updatedAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding product to Supabase:", error);
          return;
        }
        if (newProduct.priceTiers && newProduct.priceTiers.length > 0) {
          supabase.from('product_price_tiers').insert(newProduct.priceTiers.map(t => ({
            id: t.id,
            product_id: newProduct.id,
            min_quantity: t.minQuantity,
            max_quantity: t.maxQuantity,
            unit_price_fcfa: t.unitPriceFcfa
          }))).then(({ error: tierError }: any) => {
            if (tierError) console.error("Error adding price tiers to Supabase:", tierError);
          });
        }
      });
    }

    return newProduct;
  },

  editProduct: (updatedProduct) => {
    set(state => ({
      products: state.products.map(p => p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : p)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').update({
        name: updatedProduct.name,
        category: updatedProduct.category,
        description: updatedProduct.description,
        material_type: updatedProduct.materialType || 'papier',
        paper_type: updatedProduct.paperType,
        grammage_g: updatedProduct.grammageG,
        format: updatedProduct.format,
        format_options: updatedProduct.formatOptions || [],
        finishing: updatedProduct.finishing,
        photo_url: updatedProduct.photoUrl,
        unit_price_fcfa: updatedProduct.unitPriceFcfa,
        vat_rate: updatedProduct.vatRate,
        is_active: updatedProduct.isActive,
        updated_at: new Date().toISOString()
      }).eq('id', updatedProduct.id).then(({ error }: any) => {
        if (error) console.error("Error editing product in Supabase:", error);
      });
    }
  },

  deleteProduct: (productId) => {
    set(state => ({
      products: state.products.filter(p => p.id !== productId)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('products').delete().eq('id', productId).then(({ error }: any) => {
        if (error) console.error("Error deleting product in Supabase:", error);
      });
    }
  },

  toggleCatalogueEnabled: () => {
    const orgId = get().currentOrgId;
    let nextValue = true;
    set(state => ({
      organizations: state.organizations.map(o => {
        if (o.id !== orgId) return o;
        nextValue = !(o.catalogueEnabled !== false);
        return { ...o, catalogueEnabled: nextValue };
      })
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('organizations').update({ catalogue_enabled: nextValue }).eq('id', orgId).then(({ error }: any) => {
        if (error) console.error("Error toggling catalogue_enabled in Supabase:", error);
      });
    }
  },

  // Quotes Actions
  addQuote: (newQuote) => {
    set(state => ({ quotes: [newQuote, ...state.quotes] }));
    get().addAuditLog(`Devis ${newQuote.quoteNumber} créé (${newQuote.totalFcfa.toLocaleString()} FCFA)`, { entityType: 'quotes', entityId: newQuote.id }, newQuote.organizationId);

    if (isSupabaseConfigured && supabase) {
      supabase.from('quotes').insert([{
        id: newQuote.id,
        organization_id: newQuote.organizationId,
        quote_number: newQuote.quoteNumber,
        client_id: newQuote.clientId,
        status: newQuote.status,
        subtotal_fcfa: newQuote.subtotalFcfa,
        vat_amount_fcfa: newQuote.vatAmountFcfa,
        margin_percent: newQuote.marginPercent,
        total_fcfa: newQuote.totalFcfa,
        notes: newQuote.notes,
        created_by: newQuote.createdBy,
        validated_by: newQuote.validatedBy,
        validated_at: newQuote.validatedAt,
        created_at: newQuote.createdAt,
        updated_at: newQuote.updatedAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding quote to Supabase:", error);
          return;
        }
        // Insert Quote Items
        if (newQuote.items && newQuote.items.length > 0) {
          const dbItems = newQuote.items.map(item => ({
            id: item.id,
            quote_id: item.quoteId,
            product_id: item.productId,
            description_snapshot: item.descriptionSnapshot,
            paper_snapshot: item.paperSnapshot,
            finishing_snapshot: item.finishingSnapshot,
            quantity: item.quantity,
            unit_price_fcfa: item.unitPriceFcfa,
            vat_rate: item.vatRate,
            line_total_fcfa: item.lineTotalFcfa,
            sort_order: item.sortOrder
          }));
          supabase.from('quote_items').insert(dbItems).then(({ error: itemsError }: any) => {
            if (itemsError) console.error("Error adding quote items to Supabase:", itemsError);
          });
        }
      });
    }
  },

  editQuote: (updatedQuote) => {
    set(state => ({
      quotes: state.quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('quotes').update({
        client_id: updatedQuote.clientId,
        status: updatedQuote.status,
        subtotal_fcfa: updatedQuote.subtotalFcfa,
        vat_amount_fcfa: updatedQuote.vatAmountFcfa,
        margin_percent: updatedQuote.marginPercent,
        total_fcfa: updatedQuote.totalFcfa,
        notes: updatedQuote.notes,
        validated_by: updatedQuote.validatedBy,
        validated_at: updatedQuote.validatedAt,
        updated_at: new Date().toISOString()
      }).eq('id', updatedQuote.id).then(({ error }: any) => {
        if (error) {
          console.error("Error updating quote in Supabase:", error);
          return;
        }
        // Delete old items and insert new ones
        supabase.from('quote_items').delete().eq('quote_id', updatedQuote.id).then(() => {
          if (updatedQuote.items && updatedQuote.items.length > 0) {
            const dbItems = updatedQuote.items.map(item => ({
              id: item.id,
              quote_id: item.quoteId,
              product_id: item.productId,
              description_snapshot: item.descriptionSnapshot,
              paper_snapshot: item.paperSnapshot,
              finishing_snapshot: item.finishingSnapshot,
              quantity: item.quantity,
              unit_price_fcfa: item.unitPriceFcfa,
              vat_rate: item.vatRate,
              line_total_fcfa: item.lineTotalFcfa,
              sort_order: item.sortOrder
            }));
            supabase.from('quote_items').insert(dbItems).then(({ error: itemsError }: any) => {
              if (itemsError) console.error("Error adding quote items in editQuote:", itemsError);
            });
          }
        });
      });
    }
  },

  updateQuoteStatus: (quoteId, status) => {
    const targetQuote = get().quotes.find(q => q.id === quoteId);
    set(state => ({
      quotes: state.quotes.map(q => q.id === quoteId ? { ...q, status, updatedAt: new Date().toISOString() } : q)
    }));
    if (targetQuote) {
      const statusLabel = status === 'valide' ? 'validé' : status === 'refuse' ? 'refusé' : 'remis en attente';
      get().addAuditLog(`Devis ${targetQuote.quoteNumber} ${statusLabel}`, { entityType: 'quotes', entityId: quoteId }, targetQuote.organizationId);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('quotes').update({
        status,
        updated_at: new Date().toISOString()
      }).eq('id', quoteId).then(({ error }: any) => {
        if (error) console.error("Error updating quote status in Supabase:", error);
      });
    }
  },

  // BAT Actions
  addBATVersion: (batId, version) => {
    set(state => ({
      bats: state.bats.map(b => {
        if (b.id === batId) {
          const versions = b.versions || [];
          const updatedVersions = [...versions, version];
          return {
            ...b,
            versions: updatedVersions,
            currentVersionId: version.id,
            status: 'soumis',
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      })
    }));
  },

  validateBAT: (batId, validatedBy) => {
    set(state => {
      const updatedBats = state.bats.map(b => {
        if (b.id === batId) {
          return {
            ...b,
            status: 'valide' as const,
            validatedBy,
            validatedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      });

      // Find the quote associated with this BAT and automatically validate it as well
      const targetBAT = state.bats.find(b => b.id === batId);
      const updatedQuotes = targetBAT 
        ? state.quotes.map(q => q.id === targetBAT.quoteId ? { ...q, status: 'valide' as const, updatedAt: new Date().toISOString() } : q)
        : state.quotes;

      return { bats: updatedBats, quotes: updatedQuotes };
    });

    const targetBAT = get().bats.find(b => b.id === batId);
    if (targetBAT) {
      get().addAuditLog(`BAT validé par ${validatedBy}`, { entityType: 'bat', entityId: batId }, targetBAT.organizationId);
    }
  },

  refuseBAT: (batId, reason) => {
    set(state => ({
      bats: state.bats.map(b => {
        if (b.id === batId) {
          const versions = b.versions || [];
          const lastVersion = versions[versions.length - 1];
          if (lastVersion) {
            lastVersion.comment = `🔴 CORRECTION DEMANDÉE: ${reason} (Original: ${lastVersion.comment || ''})`;
          }
          return {
            ...b,
            status: 'refuse' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return b;
      })
    }));

    const targetBAT = get().bats.find(b => b.id === batId);
    if (targetBAT) {
      get().addAuditLog(`BAT refusé : ${reason}`, { entityType: 'bat', entityId: batId }, targetBAT.organizationId);
    }
  },

  // POs (Orders) Actions
  addPO: (newPO) => {
    set(state => ({ pos: [newPO, ...state.pos] }));
  },

  updatePOStatus: (poId, status) => {
    set(state => ({
      pos: state.pos.map(p => p.id === poId ? { ...p, status, updatedAt: new Date().toISOString() } : p)
    }));
  },

  // Deliveries Actions
  addDelivery: (newDelivery) => {
    set(state => {
      // Find the linked PO and update status to complete if not already
      const linkedPO = state.pos.find(p => p.id === newDelivery.purchaseOrderId);
      const updatedPOs = linkedPO 
        ? state.pos.map(p => p.id === linkedPO.id ? { ...p, status: 'termine' as const, updatedAt: new Date().toISOString() } : p)
        : state.pos;

      return {
        deliveries: [newDelivery, ...state.deliveries],
        pos: updatedPOs
      };
    });
  },

  updateDeliveryStatus: (deliveryId, status) => {
    set(state => {
      const updatedDeliveries = state.deliveries.map(d => 
        d.id === deliveryId 
          ? { 
              ...d, 
              status, 
              deliveredAt: status === 'livre' ? new Date().toISOString() : undefined 
            } 
          : d
      );

      // Dynamically auto-generate an invoice if status turns to "livre"
      const targetDelivery = state.deliveries.find(d => d.id === deliveryId);
      const invoiceExists = targetDelivery 
        ? state.invoices.some(inv => inv.quoteId === targetDelivery.purchaseOrderId) 
        : false;

      let updatedInvoices = state.invoices;

      if (status === 'livre' && targetDelivery && !invoiceExists) {
        // Retrieve linked PO and Devis
        const linkedPO = state.pos.find(po => po.id === targetDelivery.purchaseOrderId);
        const linkedQuote = linkedPO ? state.quotes.find(q => q.id === linkedPO.quoteId) : null;

        if (linkedQuote) {
          const newInvoice: Invoice = {
            id: `inv-${Date.now()}`,
            organizationId: get().currentOrgId,
            invoiceNumber: `FAC-2026-0${state.invoices.length + 1}`,
            quoteId: linkedQuote.id,
            batId: linkedPO?.batId || 'direct-po',
            clientId: linkedQuote.clientId,
            status: 'en_attente_acompte',
            subtotalFcfa: linkedQuote.subtotalFcfa,
            vatAmountFcfa: linkedQuote.vatAmountFcfa,
            totalFcfa: linkedQuote.totalFcfa,
            amountPaidFcfa: 0,
            isDeleted: false,
            createdBy: get().getCurrentProfile().fullName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: (linkedQuote.items || []).map(item => ({
              id: `invi-${Date.now()}-${item.id}`,
              invoiceId: `inv-${Date.now()}`,
              description: item.descriptionSnapshot,
              quantity: item.quantity,
              unitPriceFcfa: item.unitPriceFcfa,
              vatRate: item.vatRate,
              lineTotalFcfa: item.lineTotalFcfa
            }))
          };
          updatedInvoices = [newInvoice, ...state.invoices];
        }
      }

      return {
        deliveries: updatedDeliveries,
        invoices: updatedInvoices
      };
    });
  },

  // Invoices Actions
  addInvoice: (newInvoice) => {
    set(state => ({ invoices: [newInvoice, ...state.invoices] }));
    get().addAuditLog(`Facture ${newInvoice.invoiceNumber} émise (${newInvoice.totalFcfa.toLocaleString()} FCFA)`, { entityType: 'invoices', entityId: newInvoice.id }, newInvoice.organizationId);

    if (isSupabaseConfigured && supabase) {
      supabase.from('invoices').insert([{
        id: newInvoice.id,
        organization_id: newInvoice.organizationId,
        invoice_number: newInvoice.invoiceNumber,
        quote_id: newInvoice.quoteId,
        bat_id: newInvoice.batId,
        client_id: newInvoice.clientId,
        status: newInvoice.status,
        subtotal_fcfa: newInvoice.subtotalFcfa,
        vat_amount_fcfa: newInvoice.vatAmountFcfa,
        total_fcfa: newInvoice.totalFcfa,
        amount_paid_fcfa: newInvoice.amountPaidFcfa,
        is_deleted: newInvoice.isDeleted,
        created_by: newInvoice.createdBy,
        created_at: newInvoice.createdAt,
        updated_at: newInvoice.updatedAt
      }]).then(({ error }: any) => {
        if (error) {
          console.error("Error adding invoice to Supabase:", error);
          return;
        }
        if (newInvoice.items && newInvoice.items.length > 0) {
          supabase.from('invoice_items').insert(newInvoice.items.map(item => ({
            id: item.id,
            invoice_id: item.invoiceId,
            quote_item_id: item.quoteItemId,
            description: item.description,
            quantity: item.quantity,
            unit_price_fcfa: item.unitPriceFcfa,
            vat_rate: item.vatRate,
            line_total_fcfa: item.lineTotalFcfa
          }))).then(({ error: itemsError }: any) => {
            if (itemsError) console.error("Error adding invoice items to Supabase:", itemsError);
          });
        }
      });
    }
  },

  updateInvoiceStatus: (invoiceId, status) => {
    set(state => ({
      invoices: state.invoices.map(i => i.id === invoiceId ? { ...i, status, updatedAt: new Date().toISOString() } : i)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', invoiceId).then(({ error }: any) => {
        if (error) console.error("Error updating invoice status in Supabase:", error);
      });
    }
  },

  recordPayment: (invoiceId, amountFcfa, method, note) => {
    const invoice = get().invoices.find(i => i.id === invoiceId);
    if (!invoice || amountFcfa <= 0) return;

    const newPaid = invoice.amountPaidFcfa + amountFcfa;
    const nextStatus: Invoice['status'] = newPaid >= invoice.totalFcfa ? 'soldee' : 'partiellement_payee';
    const now = new Date().toISOString();

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId,
      amountFcfa,
      method,
      paidAt: now,
      note,
      recordedBy: get().getCurrentProfile()?.fullName || 'Utilisateur',
      isCancelled: false,
      createdAt: now
    };

    set(state => ({
      payments: [newPayment, ...state.payments],
      invoices: state.invoices.map(i => i.id === invoiceId ? { ...i, amountPaidFcfa: newPaid, status: nextStatus, updatedAt: now } : i)
    }));

    get().addAuditLog(
      `Paiement de ${amountFcfa.toLocaleString()} FCFA (${method}) enregistré sur la facture ${invoice.invoiceNumber}`,
      { entityType: 'payments', entityId: newPayment.id },
      invoice.organizationId
    );

    if (isSupabaseConfigured && supabase) {
      supabase.from('payments').insert([{
        id: newPayment.id,
        invoice_id: newPayment.invoiceId,
        amount_fcfa: newPayment.amountFcfa,
        method: newPayment.method,
        paid_at: newPayment.paidAt,
        note: newPayment.note,
        recorded_by: newPayment.recordedBy,
        is_cancelled: newPayment.isCancelled,
        created_at: newPayment.createdAt
      }]).then(({ error }: any) => {
        if (error) console.error("Error adding payment to Supabase:", error);
      });

      supabase.from('invoices').update({
        amount_paid_fcfa: newPaid,
        status: nextStatus,
        updated_at: now
      }).eq('id', invoiceId).then(({ error }: any) => {
        if (error) console.error("Error updating invoice after payment in Supabase:", error);
      });
    }
  },

  // Config & Profile Actions
  setOrgPreferences: (prefs) => {
    set(state => ({
      orgStylePreferences: { ...state.orgStylePreferences, ...prefs }
    }));
  },

  updateProfile: (updatedProfile) => {
    set(state => ({
      profiles: state.profiles.map(p => p.id === updatedProfile.id ? updatedProfile : p)
    }));
  },

  updateOrgDetails: (updatedOrg) => {
    set(state => ({
      organizations: state.organizations.map(o => o.id === updatedOrg.id ? updatedOrg : o)
    }));
  },

  addTax: (newTax) => {
    const taxObj = { id: `tax-${Date.now()}`, ...newTax };
    set(state => ({ taxes: [...state.taxes, taxObj] }));
  },

  deleteTax: (taxId) => {
    set(state => ({ taxes: state.taxes.filter(t => t.id !== taxId) }));
  },

  addMachine: (newMachine) => {
    const machineObj = { id: `m-${Date.now()}`, ...newMachine };
    set(state => ({ machines: [...state.machines, machineObj] }));
  },

  deleteMachine: (machineId) => {
    set(state => ({ machines: state.machines.filter(m => m.id !== machineId) }));
  },

  addPartner: (newPartner) => {
    const partnerObj = { id: `p-${Date.now()}`, ...newPartner };
    set(state => ({ partners: [...state.partners, partnerObj] }));
  },

  deletePartner: (partnerId) => {
    set(state => ({ partners: state.partners.filter(p => p.id !== partnerId) }));
  },

  addPaperFormat: (fmt) => {
    set(state => ({ paperFormats: [...state.paperFormats, fmt] }));
  },

  deletePaperFormat: (fmt) => {
    set(state => ({ paperFormats: state.paperFormats.filter(f => f !== fmt) }));
  },

  addAuditLog: (action, options, organizationId) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      organizationId: organizationId || 'system',
      entityType: options?.entityType || 'action',
      entityId: options?.entityId || 'sys',
      action,
      occurredAt: new Date().toISOString(),
      metadata: options?.metadata
    };
    set(state => ({ auditLogs: [newLog, ...state.auditLogs] }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_logs').insert([{
        id: newLog.id,
        organization_id: newLog.organizationId,
        entity_type: newLog.entityType,
        entity_id: newLog.entityId,
        action: newLog.action,
        occurred_at: newLog.occurredAt,
        metadata: newLog.metadata || null
      }]).then(({ error }: any) => {
        if (error) console.error("Error adding audit log to Supabase:", error);
      });
    }
  },

  addOrganizationWithAdmin: async (org, admin) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }

    const { userId, error: authError } = await createAuthUserPreservingSession(admin.email, admin.password || 'admin123');
    if (!userId) {
      return { success: false, error: authError };
    }

    const newOrgId = `org-${Date.now()}`;
    const newOrg: Organization = {
      id: newOrgId,
      name: org.name,
      address: org.address,
      phone: org.phone,
      email: org.email,
      isActive: true,
      subscriptionPlanId: org.subscriptionPlanId || 'plan-std',
      subscriptionStatus: 'active',
      subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      catalogueEnabled: true,
      createdAt: new Date().toISOString()
    };

    const newProfileId = `user-${Date.now()}`;
    const newProfile: Profile = {
      id: newProfileId,
      organizationId: newOrgId,
      fullName: admin.fullName,
      role: 'admin',
      email: admin.email.trim().toLowerCase(),
      phone: admin.phone,
      isActive: true,
      authUserId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set(state => ({
      organizations: [...state.organizations, newOrg],
      profiles: [...state.profiles, newProfile]
    }));

    get().addAuditLog(`Organisation "${org.name}" créée par le Super Admin avec l'admin "${admin.fullName}"`, null, 'system');

    try {
      const { error } = await supabase.from('organizations').insert([{
        id: newOrg.id,
        name: newOrg.name,
        address: newOrg.address,
        phone: newOrg.phone,
        email: newOrg.email,
        is_active: newOrg.isActive,
        subscription_plan_id: newOrg.subscriptionPlanId,
        subscription_status: newOrg.subscriptionStatus,
        subscription_end_date: newOrg.subscriptionEndDate,
        catalogue_enabled: true,
        created_at: newOrg.createdAt
      }]);
      if (error) {
        console.error("Error inserting organization in Supabase:", error);
        return { success: false, error: error.message };
      }

      const { error: profileError } = await supabase.from('profiles').insert([{
        id: newProfile.id,
        organization_id: newProfile.organizationId,
        full_name: newProfile.fullName,
        role: newProfile.role,
        email: newProfile.email,
        phone: newProfile.phone,
        is_active: newProfile.isActive,
        auth_user_id: newProfile.authUserId,
        created_at: newProfile.createdAt,
        updated_at: newProfile.updatedAt
      }]);
      if (profileError) {
        console.error("Error inserting profile in Supabase:", profileError);
        return { success: false, error: profileError.message };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    return { success: true };
  },

  toggleOrganizationActive: (orgId) => {
    let isAct = false;
    set(state => {
      const org = state.organizations.find(o => o.id === orgId);
      isAct = org ? !org.isActive : false;
      
      // Add audit log
      const actionText = isAct 
        ? `Organisation "${org?.name}" activée par le Super Admin`
        : `Organisation "${org?.name}" désactivée par le Super Admin`;

      return {
        organizations: state.organizations.map(o => o.id === orgId ? { ...o, isActive: isAct } : o),
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            organizationId: 'system',
            entityType: 'organization',
            entityId: orgId,
            action: actionText,
            occurredAt: new Date().toISOString()
          },
          ...state.auditLogs
        ]
      };
    });

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('organizations').update({ is_active: isAct }).eq('id', orgId).then(({ error }: any) => {
        if (error) console.error("Error toggleOrganizationActive in Supabase:", error);
      });
    }
  },

  updateOrganizationSubscription: (orgId, planId, status, endDate) => {
    set(state => {
      const org = state.organizations.find(o => o.id === orgId);
      const plan = state.subscriptionPlans.find(p => p.id === planId);
      const actionText = `Abonnement mis à jour pour "${org?.name}" vers "${plan?.name}" (Statut: ${status})`;
      
      return {
        organizations: state.organizations.map(o => o.id === orgId ? { ...o, subscriptionPlanId: planId, subscriptionStatus: status, subscriptionEndDate: endDate } : o),
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            organizationId: orgId,
            entityType: 'subscription',
            entityId: orgId,
            action: actionText,
            occurredAt: new Date().toISOString()
          },
          ...state.auditLogs
        ]
      };
    });

    // Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('organizations').update({
        subscription_plan_id: planId,
        subscription_status: status,
        subscription_end_date: endDate
      }).eq('id', orgId).then(({ error }: any) => {
        if (error) console.error("Error updating organization subscription in Supabase:", error);
      });
    }
  },

  addSubscriptionPlan: (plan) => {
    const newPlan = { id: `plan-${Date.now()}`, ...plan };
    set(state => ({
      subscriptionPlans: [...state.subscriptionPlans, newPlan]
    }));
    get().addAuditLog(`Formule d'abonnement "${plan.name}" ajoutée par le Super Admin`, null, 'system');
  },

  updateSubscriptionPlan: (updatedPlan) => {
    set(state => ({
      subscriptionPlans: state.subscriptionPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p)
    }));
    get().addAuditLog(`Formule d'abonnement "${updatedPlan.name}" mise à jour par le Super Admin`, null, 'system');
  },

  deleteSubscriptionPlan: (planId) => {
    set(state => {
      return {
        subscriptionPlans: state.subscriptionPlans.filter(p => p.id !== planId)
      };
    });
    get().addAuditLog(`Formule d'abonnement supprimée par le Super Admin`, null, 'system');
  },

  addInvoiceTemplate: (template) => {
    set(state => ({
      availableTemplates: [...state.availableTemplates, template]
    }));
    get().addAuditLog(`Modèle de facture "${template.name}" mis en ligne par le Super Admin`, null, 'system');
  },

  addProfile: async (profile) => {
    const currentOrg = get().getCurrentOrg();
    if (currentOrg && currentOrg.subscriptionPlanId === 'plan-free') {
      return { success: false, error: "L'ajout de personnel est bloqué sur le plan d'essai gratuit. Veuillez passer à un abonnement Standard ou Pro." };
    }
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    if (!profile.email) {
      return { success: false, error: "L'adresse e-mail est obligatoire." };
    }

    const { userId, error: authError } = await createAuthUserPreservingSession(profile.email, profile.password || 'collaborateur2026');
    if (!userId) {
      return { success: false, error: authError };
    }

    const orgId = get().currentOrgId;
    const newProfileId = `user-${Date.now()}`;
    const newProfile: Profile = {
      id: newProfileId,
      organizationId: orgId,
      fullName: profile.fullName,
      role: profile.role,
      email: profile.email.trim().toLowerCase(),
      phone: profile.phone,
      isActive: true,
      authUserId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set(state => ({
      profiles: [...state.profiles, newProfile]
    }));

    get().addAuditLog(`Collaborateur "${profile.fullName}" créé avec le rôle ${profile.role}`, null, orgId);

    const { error } = await supabase.from('profiles').insert([{
      id: newProfile.id,
      organization_id: newProfile.organizationId,
      full_name: newProfile.fullName,
      role: newProfile.role,
      email: newProfile.email,
      phone: newProfile.phone,
      is_active: newProfile.isActive,
      auth_user_id: newProfile.authUserId,
      created_at: newProfile.createdAt,
      updated_at: newProfile.updatedAt
    }]);
    if (error) {
      console.error("Error inserting profile in Supabase:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  deleteProfile: (profileId) => {
    const orgId = get().currentOrgId;
    set(state => ({
      profiles: state.profiles.filter(p => p.id !== profileId)
    }));
    get().addAuditLog(`Collaborateur supprimé de l'organisation`, null, orgId);

    // Sync with Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').delete().eq('id', profileId).then(({ error }: any) => {
        if (error) console.error(error);
      });
    }
  },

  toggleProfileActive: (profileId) => {
    const orgId = get().currentOrgId;
    let isAct = false;
    set(state => {
      const profile = state.profiles.find(p => p.id === profileId);
      isAct = profile ? !profile.isActive : false;
      return {
        profiles: state.profiles.map(p => p.id === profileId ? { ...p, isActive: isAct, updatedAt: new Date().toISOString() } : p)
      };
    });
    get().addAuditLog(`Statut du collaborateur modifié`, null, orgId);

    // Sync with Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').update({ is_active: isAct, updated_at: new Date().toISOString() }).eq('id', profileId).then(({ error }: any) => {
        if (error) console.error(error);
      });
    }
  },

  changePassword: async (profileId, newPass) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
    set(state => ({
      profiles: state.profiles.map(p => p.id === profileId ? { ...p, updatedAt: new Date().toISOString() } : p)
    }));
    return { success: true };
  },

  addSuperAdmin: async (sa) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Supabase n'est pas configuré." };
    }

    const { userId, error: authError } = await createAuthUserPreservingSession(sa.email, sa.password || 'RootAccess#2026');
    if (!userId) {
      return { success: false, error: authError };
    }

    const newSaId = `superadmin-${Date.now()}`;
    const newSa = {
      id: newSaId,
      fullName: sa.fullName,
      email: sa.email.trim().toLowerCase(),
      authUserId: userId,
      createdAt: new Date().toISOString()
    };

    set(state => ({
      superadmins: [...state.superadmins, newSa]
    }));

    try {
      const { error } = await supabase.from('superadmins').insert([{
        id: newSa.id,
        full_name: newSa.fullName,
        email: newSa.email,
        auth_user_id: newSa.authUserId,
        created_at: newSa.createdAt
      }]);
      if (error) return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e.message };
    }

    get().addAuditLog(`Super Admin "${sa.fullName}" créé`, null, 'system');
    return { success: true };
  },

  // Public Catalogue & Online Orders (Formule Pro)
  updateOnlineOrderStatus: (orderId, status) => {
    set(state => ({
      onlineOrders: state.onlineOrders.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('online_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).then(({ error }: any) => {
        if (error) console.error("Error updating online order status in Supabase:", error);
      });
    }
  },

  convertOnlineOrderToQuote: (orderId) => {
    const order = get().onlineOrders.find(o => o.id === orderId);
    if (!order) return;

    const quoteId = `quote-${Date.now()}`;
    const subtotal = order.subtotalFcfa;
    const vatRate = 18;
    const vatAmount = Math.round(subtotal * vatRate / 100);

    const newQuote: Quote = {
      id: quoteId,
      organizationId: order.organizationId,
      quoteNumber: `DEV-WEB-${order.orderNumber.replace(/\D/g, '') || Date.now()}`,
      clientId: order.clientId,
      status: 'en_attente',
      subtotalFcfa: subtotal,
      vatAmountFcfa: vatAmount,
      totalFcfa: subtotal + vatAmount,
      notes: `Généré depuis la commande en ligne ${order.orderNumber}.${order.notes ? ' Notes client: ' + order.notes : ''}`,
      createdBy: get().getCurrentProfile()?.fullName || 'Catalogue Public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: order.items.map((item, idx) => ({
        id: `qi-${Date.now()}-${idx}`,
        quoteId,
        productId: item.productId,
        descriptionSnapshot: `${item.name} (${item.format})`,
        quantity: item.quantity,
        unitPriceFcfa: item.unitPriceFcfa,
        vatRate,
        lineTotalFcfa: item.lineTotalFcfa,
        sortOrder: idx
      }))
    };

    get().addQuote(newQuote);
    get().updateOnlineOrderStatus(orderId, 'convertie');
    get().addAuditLog(`Devis ${newQuote.quoteNumber} créé depuis la commande en ligne ${order.orderNumber}`, null, order.organizationId);
  },

  fetchPublicCatalogue: async (orgId) => {
    if (!isSupabaseConfigured || !supabase) {
      return { org: null, products: [] };
    }

    try {
      const { data: orgRow } = await supabase.from('organizations').select('*').eq('id', orgId).maybeSingle();

      if (
        !orgRow ||
        orgRow.is_active === false ||
        orgRow.subscription_plan_id !== 'plan-pro' ||
        orgRow.catalogue_enabled === false
      ) {
        return { org: null, products: [] };
      }

      const org: Organization = {
        id: orgRow.id,
        name: orgRow.name,
        address: orgRow.address,
        phone: orgRow.phone,
        email: orgRow.email,
        isActive: orgRow.is_active,
        subscriptionPlanId: orgRow.subscription_plan_id,
        subscriptionStatus: orgRow.subscription_status,
        subscriptionEndDate: orgRow.subscription_end_date,
        catalogueEnabled: orgRow.catalogue_enabled !== false,
        createdAt: orgRow.created_at
      };

      const [{ data: productRows }, { data: tierRows }] = await Promise.all([
        supabase.from('products').select('*').eq('organization_id', orgId).eq('is_active', true),
        supabase.from('product_price_tiers').select('*')
      ]) as any[];

      const products: Product[] = (productRows || []).map((p: any) => ({
        id: p.id,
        organizationId: p.organization_id,
        name: p.name,
        category: p.category,
        description: p.description,
        materialType: p.material_type || 'papier',
        paperType: p.paper_type,
        grammageG: p.grammage_g,
        format: p.format,
        formatOptions: p.format_options || [],
        finishing: p.finishing,
        photoUrl: p.photo_url,
        unitPriceFcfa: Number(p.unit_price_fcfa),
        vatRate: Number(p.vat_rate),
        isActive: p.is_active,
        priceTiers: (tierRows || [])
          .filter((t: any) => t.product_id === p.id)
          .map((t: any) => ({
            id: t.id,
            productId: t.product_id,
            minQuantity: t.min_quantity,
            maxQuantity: t.max_quantity ?? undefined,
            unitPriceFcfa: Number(t.unit_price_fcfa)
          })),
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      return { org, products };
    } catch (e) {
      console.error("Error in fetchPublicCatalogue:", e);
      return { org: null, products: [] };
    }
  },

  submitPublicOrder: async (orgId, payload) => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Le catalogue en ligne n'est pas disponible pour le moment." };
    }
    if (!payload.items.length) {
      return { success: false, error: 'Votre commande est vide.' };
    }

    try {
      // Find an existing client for this org by phone, otherwise create one.
      const { data: existingClients } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', orgId)
        .eq('phone', payload.phone)
        .limit(1);

      let clientId: string;

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        clientId = `client-web-${Date.now()}`;
        const { error: clientError } = await supabase.from('clients').insert([{
          id: clientId,
          organization_id: orgId,
          company_name: payload.companyName,
          contact_name: payload.contactName,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          source: 'catalogue_public',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        if (clientError) {
          console.error("Error creating public client in Supabase:", clientError);
          return { success: false, error: "Impossible d'enregistrer vos coordonnées. Réessayez." };
        }
      }

      const orderId = `order-web-${Date.now()}`;
      const orderNumber = `CMD-WEB-${Date.now().toString().slice(-6)}`;
      const subtotal = payload.items.reduce((sum, item) => sum + item.lineTotalFcfa, 0);

      const { error: orderError } = await supabase.from('online_orders').insert([{
        id: orderId,
        organization_id: orgId,
        order_number: orderNumber,
        client_id: clientId,
        status: 'nouvelle',
        items: payload.items,
        subtotal_fcfa: subtotal,
        notes: payload.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (orderError) {
        console.error("Error creating online order in Supabase:", orderError);
        return { success: false, error: "Impossible d'enregistrer votre commande. Réessayez." };
      }

      const newOrder: OnlineOrder = {
        id: orderId,
        organizationId: orgId,
        orderNumber,
        clientId,
        status: 'nouvelle',
        items: payload.items,
        subtotalFcfa: subtotal,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      set(state => ({ onlineOrders: [newOrder, ...state.onlineOrders] }));

      return { success: true, orderNumber };
    } catch (e: any) {
      console.error("Error in submitPublicOrder:", e);
      return { success: false, error: e.message || 'Une erreur est survenue.' };
    }
  }
    }),
    {
      name: 'printflow-session',
      partialize: (state) => ({
        currentOrgId: state.currentOrgId,
        currentProfileId: state.currentProfileId,
        isAuthenticated: state.isAuthenticated,
        isSuperAdmin: state.isSuperAdmin,
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
        orgStylePreferences: state.orgStylePreferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
