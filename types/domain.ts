export type UserRole = 'admin' | 'commercial' | 'chef_atelier';

export type QuoteStatus = 'en_attente' | 'valide' | 'refuse';
export type BATStatus = 'en_attente' | 'soumis' | 'valide' | 'refuse';
export type POStatus = 'en_attente_production' | 'en_cours_impression' | 'termine';
export type InvoiceStatus = 'en_attente_acompte' | 'partiellement_payee' | 'soldee';
export type DeliveryStatus = 'pret_expedition' | 'livre';
export type PaymentMethod = 'especes' | 'cheque' | 'mobile_money';

export interface Organization {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  subscriptionPlanId?: string;
  subscriptionStatus?: 'active' | 'suspended' | 'expired';
  subscriptionEndDate?: string;
  catalogueEnabled?: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  organizationId: string;
  fullName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  isActive: boolean;
  /** @deprecated auth now goes through Supabase Auth (authUserId); no longer used for login checks */
  password?: string;
  authUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  organizationId: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdBy?: string;
  source?: 'interne' | 'catalogue_public';
  createdAt: string;
  updatedAt: string;
}

export interface ProductPriceTier {
  id: string;
  productId: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPriceFcfa: number;
}

export type ProductMaterialType = 'papier' | 'textile' | 'support_rigide' | 'autre';

export interface ProductFormatOption {
  label: string;
  extraPriceFcfa?: number;
}

export interface Product {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  description?: string;
  materialType?: ProductMaterialType;
  paperType?: string;
  grammageG?: number;
  format?: string;
  formatOptions?: ProductFormatOption[];
  finishing?: string;
  photoUrl?: string;
  unitPriceFcfa: number;
  vatRate: number;
  isActive: boolean;
  priceTiers?: ProductPriceTier[];
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId?: string;
  descriptionSnapshot: string;
  paperSnapshot?: string;
  finishingSnapshot?: string;
  quantity: number;
  unitPriceFcfa: number;
  vatRate: number;
  lineTotalFcfa: number;
  sortOrder: number;
}

export interface Quote {
  id: string;
  organizationId: string;
  quoteNumber: string;
  clientId: string;
  status: QuoteStatus;
  subtotalFcfa: number;
  vatAmountFcfa: number;
  marginPercent?: number;
  totalFcfa: number;
  notes?: string;
  createdBy: string;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: QuoteItem[];
}

export interface BATVersion {
  id: string;
  batId: string;
  versionNumber: number;
  filePath: string;
  fileType: string;
  comment?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface BAT {
  id: string;
  organizationId: string;
  quoteId: string;
  status: BATStatus;
  currentVersionId?: string;
  validatedBy?: string;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
  versions?: BATVersion[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  quoteItemId?: string;
  description: string;
  finishing?: string;
  quantity: number;
  sortOrder: number;
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  orderNumber: string;
  quoteId: string;
  batId: string;
  status: POStatus;
  machineSetup?: string;
  depositAmountFcfa?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: PurchaseOrderItem[];
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  quoteItemId?: string;
  description: string;
  quantity: number;
  unitPriceFcfa: number;
  vatRate: number;
  lineTotalFcfa: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  quoteId: string;
  batId: string;
  clientId: string;
  status: InvoiceStatus;
  subtotalFcfa: number;
  vatAmountFcfa: number;
  totalFcfa: number;
  amountPaidFcfa: number;
  isDeleted: boolean;
  deletedReason?: string;
  deletedBy?: string;
  deletedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountFcfa: number;
  method: PaymentMethod;
  paidAt: string;
  note?: string;
  recordedBy: string;
  isCancelled: boolean;
  cancelledReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface DeliveryNoteItem {
  id: string;
  deliveryNoteId: string;
  description: string;
  quantityReady: number;
}

export interface DeliveryNote {
  id: string;
  organizationId: string;
  deliveryNumber: string;
  purchaseOrderId: string;
  status: DeliveryStatus;
  deliveredTo?: string;
  signatureUrl?: string;
  deliveredAt?: string;
  createdBy: string;
  createdAt: string;
  items?: DeliveryNoteItem[];
}

export interface AuditLog {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId?: string;
  actorRole?: UserRole;
  occurredAt: string;
  beforeData?: any;
  afterData?: any;
  metadata?: any;
}

// --- Public Catalogue / Online Orders (Formule Pro) ---
export type OnlineOrderStatus = 'nouvelle' | 'en_traitement' | 'convertie' | 'rejetee';

export interface OnlineOrderItem {
  productId?: string;
  name: string;
  materialType?: ProductMaterialType;
  format: string;
  quantity: number;
  unitPriceFcfa: number;
  lineTotalFcfa: number;
}

export interface OnlineOrder {
  id: string;
  organizationId: string;
  orderNumber: string;
  clientId: string;
  status: OnlineOrderStatus;
  items: OnlineOrderItem[];
  subtotalFcfa: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
