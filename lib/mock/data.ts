import { 
  Organization, 
  Profile, 
  Client, 
  Product, 
  Quote, 
  BAT, 
  PurchaseOrder, 
  Invoice, 
  Payment, 
  DeliveryNote, 
  AuditLog 
} from '@/types/domain';

// --- Organizations ---
export const mockOrganizations: Organization[] = [
  {
    id: 'org-sud-print',
    name: 'Sud Print',
    address: 'Avenue Cheikh Anta Diop, Dakar, Sénégal',
    phone: '+221 33 824 55 66',
    email: 'contact@sudprint.sn',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'org-sahel-graphique',
    name: 'Sahel Graphique',
    address: 'Zone Industrielle, Bamako, Mali',
    phone: '+223 20 22 44 88',
    email: 'info@sahelgraphique.ml',
    createdAt: '2026-02-15T09:30:00Z',
  }
];

// --- Profiles / Users ---
export const mockProfiles: Profile[] = [
  // Sud Print Users
  {
    id: 'user-sud-admin',
    organizationId: 'org-sud-print',
    fullName: 'Fatou Diop',
    role: 'admin',
    email: 'fatou.diop@sudprint.sn',
    phone: '+221 77 654 32 10',
    isActive: true,
    createdAt: '2026-01-10T08:05:00Z',
    updatedAt: '2026-01-10T08:05:00Z',
  },
  {
    id: 'user-sud-commercial',
    organizationId: 'org-sud-print',
    fullName: 'Amadou Sow',
    role: 'commercial',
    email: 'amadou.sow@sudprint.sn',
    phone: '+221 77 987 65 43',
    isActive: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'user-sud-atelier',
    organizationId: 'org-sud-print',
    fullName: 'Moustapha Ndiaye',
    role: 'chef_atelier',
    email: 'moustapha.ndiaye@sudprint.sn',
    phone: '+221 77 111 22 33',
    isActive: true,
    createdAt: '2026-01-12T10:15:00Z',
    updatedAt: '2026-01-12T10:15:00Z',
  },

  // Sahel Graphique Users
  {
    id: 'user-sahel-admin',
    organizationId: 'org-sahel-graphique',
    fullName: 'Ousmane Keita',
    role: 'admin',
    email: 'ousmane.keita@sahelgraphique.ml',
    phone: '+223 76 54 32 10',
    isActive: true,
    createdAt: '2026-02-15T09:35:00Z',
    updatedAt: '2026-02-15T09:35:00Z',
  },
  {
    id: 'user-sahel-commercial',
    organizationId: 'org-sahel-graphique',
    fullName: 'Mariam Diallo',
    role: 'commercial',
    email: 'mariam.diallo@sahelgraphique.ml',
    phone: '+223 66 88 99 00',
    isActive: true,
    createdAt: '2026-02-16T11:00:00Z',
    updatedAt: '2026-02-16T11:00:00Z',
  }
];

// --- Auth (Mocked phase — passwords live here only until Supabase Auth is wired in) ---
export interface MockCredential {
  email: string;
  password: string;
  profileId: string;
}

export const mockCredentials: MockCredential[] = [
  { email: 'fatou.diop@sudprint.sn', password: 'sudprint2026', profileId: 'user-sud-admin' },
  { email: 'amadou.sow@sudprint.sn', password: 'sudprint2026', profileId: 'user-sud-commercial' },
  { email: 'moustapha.ndiaye@sudprint.sn', password: 'sudprint2026', profileId: 'user-sud-atelier' },
  { email: 'ousmane.keita@sahelgraphique.ml', password: 'sahel2026', profileId: 'user-sahel-admin' },
  { email: 'mariam.diallo@sahelgraphique.ml', password: 'sahel2026', profileId: 'user-sahel-commercial' },
];

export const mockSuperAdmin = {
  fullName: 'Root Administrateur',
  email: 'superadmin@printflow.io',
  password: 'RootAccess#2026',
};

// --- Clients ---
export const mockClients: Client[] = [
  // Sud Print Clients (Sénégal)
  {
    id: 'client-senelec',
    organizationId: 'org-sud-print',
    companyName: 'SENELEC',
    contactName: 'M. Abdoulaye Diallo',
    phone: '+221 33 839 00 00',
    email: 'a.diallo@senelec.sn',
    address: '28 Rue Vincens, Dakar',
    createdBy: 'user-sud-commercial',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'client-orange-sn',
    organizationId: 'org-sud-print',
    companyName: 'Sonatel Orange',
    contactName: 'Mme Awa Cissé',
    phone: '+221 33 839 20 20',
    email: 'awa.cisse@orange.sn',
    address: 'Vdn, Dakar',
    createdBy: 'user-sud-commercial',
    createdAt: '2026-01-22T14:30:00Z',
    updatedAt: '2026-01-22T14:30:00Z',
  },
  {
    id: 'client-cfao-sn',
    organizationId: 'org-sud-print',
    companyName: 'CFAO Motors Sénégal',
    contactName: 'M. Jean-Pierre Gomis',
    phone: '+221 33 849 77 77',
    email: 'jpgomis@cfao.sn',
    address: 'Km 2, Boulevard du Centenaire, Dakar',
    createdBy: 'user-sud-admin',
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-01-25T11:00:00Z',
  },

  // Sahel Graphique Clients (Mali)
  {
    id: 'client-bceao-ml',
    organizationId: 'org-sahel-graphique',
    companyName: 'BCEAO Mali',
    contactName: 'M. Souleymane Traoré',
    phone: '+223 20 22 25 41',
    email: 'straore@bceao.int',
    address: 'Avenue de la Marne, Bamako',
    createdBy: 'user-sahel-commercial',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'client-telecom-ml',
    organizationId: 'org-sahel-graphique',
    companyName: 'Malitel',
    contactName: 'Mme Fatoumata Coulibaly',
    phone: '+223 20 29 00 00',
    email: 'f.coulibaly@malitel.ml',
    address: 'Route de Koulikoro, Bamako',
    createdBy: 'user-sahel-commercial',
    createdAt: '2026-02-22T16:00:00Z',
    updatedAt: '2026-02-22T16:00:00Z',
  }
];

// --- Products & Price Tiers ---
export const mockProducts: Product[] = [
  // Sud Print Products
  {
    id: 'prod-sud-flyers',
    organizationId: 'org-sud-print',
    name: 'Flyers A5',
    category: 'Distribution',
    description: 'Flyers A5, impression Recto/Verso, papier Couché Brillant 135g.',
    materialType: 'papier',
    paperType: 'Couché Brillant',
    grammageG: 135,
    format: 'A5',
    formatOptions: [
      { label: 'A5', extraPriceFcfa: 0 },
      { label: 'A6', extraPriceFcfa: -10 },
      { label: 'A4', extraPriceFcfa: 25 },
    ],
    finishing: 'Massicotage',
    unitPriceFcfa: 45,
    vatRate: 18.00,
    isActive: true,
    priceTiers: [
      { id: 'tier-1', productId: 'prod-sud-flyers', minQuantity: 100, maxQuantity: 499, unitPriceFcfa: 45 },
      { id: 'tier-2', productId: 'prod-sud-flyers', minQuantity: 500, maxQuantity: 1999, unitPriceFcfa: 35 },
      { id: 'tier-3', productId: 'prod-sud-flyers', minQuantity: 2000, maxQuantity: undefined, unitPriceFcfa: 25 },
    ],
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'prod-sud-bache',
    organizationId: 'org-sud-print',
    name: 'Bâche Grand Format',
    category: 'Signalétique',
    description: 'Bâche PVC 510g/m² avec œillets tous les 50cm.',
    materialType: 'support_rigide',
    paperType: 'Bâche PVC',
    grammageG: 510,
    format: 'Sur mesure (m²)',
    formatOptions: [
      { label: '1x1 m', extraPriceFcfa: 0 },
      { label: '2x1 m', extraPriceFcfa: 6000 },
      { label: '3x2 m', extraPriceFcfa: 18000 },
    ],
    finishing: 'Œillets & Ourlet',
    unitPriceFcfa: 7500,
    vatRate: 18.00,
    isActive: true,
    priceTiers: [
      { id: 'tier-4', productId: 'prod-sud-bache', minQuantity: 1, maxQuantity: 9, unitPriceFcfa: 7500 },
      { id: 'tier-5', productId: 'prod-sud-bache', minQuantity: 10, maxQuantity: undefined, unitPriceFcfa: 6000 },
    ],
    createdAt: '2026-01-15T09:10:00Z',
    updatedAt: '2026-01-15T09:10:00Z',
  },
  {
    id: 'prod-sud-cartes',
    organizationId: 'org-sud-print',
    name: 'Cartes de Visite',
    category: 'Papeterie',
    description: 'Cartes de visite 8.5x5.4cm sur papier 350g Couché Demi-mat, Pelliculage Soft Touch R/V.',
    materialType: 'papier',
    paperType: 'Couché Demi-mat',
    grammageG: 350,
    format: '85x54 mm',
    finishing: 'Pelliculage Mat Soft Touch R/V',
    unitPriceFcfa: 80,
    vatRate: 18.00,
    isActive: true,
    priceTiers: [
      { id: 'tier-6', productId: 'prod-sud-cartes', minQuantity: 100, maxQuantity: 499, unitPriceFcfa: 80 },
      { id: 'tier-7', productId: 'prod-sud-cartes', minQuantity: 500, maxQuantity: 999, unitPriceFcfa: 60 },
      { id: 'tier-8', productId: 'prod-sud-cartes', minQuantity: 1000, maxQuantity: undefined, unitPriceFcfa: 45 },
    ],
    createdAt: '2026-01-15T09:20:00Z',
    updatedAt: '2026-01-15T09:20:00Z',
  },
  {
    id: 'prod-sud-brochures',
    organizationId: 'org-sud-print',
    name: 'Brochure A4 16 pages',
    category: 'Édition',
    description: 'Brochures agrafées A4, Couverture 250g Couché Brillant, Intérieur 135g Couché Brillant, 16 pages.',
    materialType: 'papier',
    paperType: 'Couché Brillant',
    grammageG: 135,
    format: 'A4 (fermé)',
    finishing: 'Piquage 2 points métal, pliage, massicotage',
    unitPriceFcfa: 1200,
    vatRate: 18.00,
    isActive: true,
    priceTiers: [
      { id: 'tier-9', productId: 'prod-sud-brochures', minQuantity: 50, maxQuantity: 249, unitPriceFcfa: 1200 },
      { id: 'tier-10', productId: 'prod-sud-brochures', minQuantity: 250, maxQuantity: undefined, unitPriceFcfa: 950 },
    ],
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'prod-sud-textile',
    organizationId: 'org-sud-print',
    name: 'Oriflamme Textile Publicitaire',
    category: 'Grand Format',
    description: 'Oriflamme en textile polyester tendu, impression sublimation, finition fourreau + œillets.',
    materialType: 'textile',
    paperType: 'Polyester Tendu 110g',
    format: '60x160 cm',
    formatOptions: [
      { label: '60x160 cm', extraPriceFcfa: 0 },
      { label: '80x200 cm', extraPriceFcfa: 4500 },
      { label: '100x300 cm', extraPriceFcfa: 12000 },
    ],
    finishing: 'Fourreau + Œillets',
    unitPriceFcfa: 18500,
    vatRate: 18.00,
    isActive: true,
    priceTiers: [
      { id: 'tier-12', productId: 'prod-sud-textile', minQuantity: 1, maxQuantity: 4, unitPriceFcfa: 18500 },
      { id: 'tier-13', productId: 'prod-sud-textile', minQuantity: 5, maxQuantity: undefined, unitPriceFcfa: 15500 },
    ],
    createdAt: '2026-01-15T09:40:00Z',
    updatedAt: '2026-01-15T09:40:00Z',
  },

  // Sahel Graphique Products
  {
    id: 'prod-sahel-affiches',
    organizationId: 'org-sahel-graphique',
    name: 'Affiches A3',
    category: 'Distribution',
    description: 'Affiches A3, Recto seul, papier Couché Mat 170g.',
    materialType: 'papier',
    paperType: 'Couché Mat',
    grammageG: 170,
    format: 'A3',
    finishing: 'Massicotage',
    unitPriceFcfa: 250,
    vatRate: 18.00,
    isActive: true,
    priceTiers: [
      { id: 'tier-11', productId: 'prod-sahel-affiches', minQuantity: 50, maxQuantity: undefined, unitPriceFcfa: 250 },
    ],
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
  }
];

// --- Quotes, Quote Items & BAT (Sud Print) ---

// Devis 1: Validé, BAT Validé, Commande Créée, Facture Partiellement Payée
export const mockQuote1: Quote = {
  id: 'quote-sud-001',
  organizationId: 'org-sud-print',
  quoteNumber: 'DEV-2026-0001',
  clientId: 'client-senelec',
  status: 'valide',
  subtotalFcfa: 1750000,
  vatAmountFcfa: 315000,
  marginPercent: 20.00,
  totalFcfa: 2065000,
  notes: 'Campagne de sensibilisation sécurité électricité - Impression de brochures.',
  createdBy: 'user-sud-commercial',
  validatedBy: 'user-sud-admin',
  validatedAt: '2026-07-02T10:00:00Z',
  createdAt: '2026-07-01T09:00:00Z',
  updatedAt: '2026-07-02T10:00:00Z',
  items: [
    {
      id: 'qi-001',
      quoteId: 'quote-sud-001',
      productId: 'prod-sud-brochures',
      descriptionSnapshot: 'Brochure A4 16 pages - Sensibilisation 2026',
      paperSnapshot: 'Couché Brillant 135g',
      finishingSnapshot: 'Piquage 2 points métal, pliage, massicotage',
      quantity: 1000,
      unitPriceFcfa: 950,
      vatRate: 18.00,
      lineTotalFcfa: 950000,
      sortOrder: 0
    },
    {
      id: 'qi-002',
      quoteId: 'quote-sud-001',
      productId: 'prod-sud-flyers',
      descriptionSnapshot: 'Flyers A5 - Consignes de Sécurité Ménage',
      paperSnapshot: 'Couché Brillant 135g',
      finishingSnapshot: 'Massicotage',
      quantity: 22858, // Quantity to push it to total total total
      unitPriceFcfa: 35,
      vatRate: 18.00,
      lineTotalFcfa: 800030,
      sortOrder: 1
    }
  ]
};

export const mockBAT1: BAT = {
  id: 'bat-sud-001',
  organizationId: 'org-sud-print',
  quoteId: 'quote-sud-001',
  status: 'valide',
  currentVersionId: 'bv-002',
  validatedBy: 'user-sud-admin',
  validatedAt: '2026-07-04T15:00:00Z',
  createdAt: '2026-07-02T10:15:00Z',
  updatedAt: '2026-07-04T15:00:00Z',
  versions: [
    {
      id: 'bv-001',
      batId: 'bat-sud-001',
      versionNumber: 1,
      filePath: 'bat/org-sud-print/quote-sud-001/v1.pdf',
      fileType: 'application/pdf',
      comment: 'Première version pour relecture. Logo SENELEC corrigé.',
      uploadedBy: 'user-sud-commercial',
      uploadedAt: '2026-07-02T10:20:00Z',
    },
    {
      id: 'bv-002',
      batId: 'bat-sud-001',
      versionNumber: 2,
      filePath: 'bat/org-sud-print/quote-sud-001/v2.pdf',
      fileType: 'application/pdf',
      comment: 'Version corrigée après retour client sur le texte de page 4.',
      uploadedBy: 'user-sud-commercial',
      uploadedAt: '2026-07-04T11:00:00Z',
    }
  ]
};

export const mockPO1: PurchaseOrder = {
  id: 'po-sud-001',
  organizationId: 'org-sud-print',
  orderNumber: 'BC-2026-0001',
  quoteId: 'quote-sud-001',
  batId: 'bat-sud-001',
  status: 'en_cours_impression',
  machineSetup: 'Impression Offset Heidelberger Speedmaster, CTP plaques neuves. Massicotage et agrafage automatique.',
  createdBy: 'user-sud-commercial',
  createdAt: '2026-07-05T08:30:00Z',
  updatedAt: '2026-07-05T09:00:00Z',
  items: [
    {
      id: 'poi-001',
      purchaseOrderId: 'po-sud-001',
      quoteItemId: 'qi-001',
      description: 'Brochure A4 16 pages - Sensibilisation 2026',
      finishing: 'Piquage 2 points métal, pliage, massicotage',
      quantity: 1000,
      sortOrder: 0
    },
    {
      id: 'poi-002',
      purchaseOrderId: 'po-sud-001',
      quoteItemId: 'qi-002',
      description: 'Flyers A5 - Consignes de Sécurité Ménage',
      finishing: 'Massicotage',
      quantity: 22858,
      sortOrder: 1
    }
  ]
};

export const mockInvoice1: Invoice = {
  id: 'inv-sud-001',
  organizationId: 'org-sud-print',
  invoiceNumber: 'FAC-2026-0001',
  quoteId: 'quote-sud-001',
  batId: 'bat-sud-001',
  clientId: 'client-senelec',
  status: 'partiellement_payee',
  subtotalFcfa: 1750000,
  vatAmountFcfa: 315000,
  totalFcfa: 2065000,
  amountPaidFcfa: 1000000, // Partial payment
  isDeleted: false,
  createdBy: 'user-sud-admin',
  createdAt: '2026-07-05T08:45:00Z',
  updatedAt: '2026-07-05T15:00:00Z',
  items: [
    {
      id: 'ivi-001',
      invoiceId: 'inv-sud-001',
      quoteItemId: 'qi-001',
      description: 'Brochure A4 16 pages - Sensibilisation 2026',
      quantity: 1000,
      unitPriceFcfa: 950,
      vatRate: 18.00,
      lineTotalFcfa: 950000
    },
    {
      id: 'ivi-002',
      invoiceId: 'inv-sud-001',
      quoteItemId: 'qi-002',
      description: 'Flyers A5 - Consignes de Sécurité Ménage',
      quantity: 22858,
      unitPriceFcfa: 35,
      vatRate: 18.00,
      lineTotalFcfa: 800030
    }
  ]
};

export const mockPayment1: Payment = {
  id: 'pay-sud-001',
  invoiceId: 'inv-sud-001',
  amountFcfa: 1000000,
  method: 'cheque',
  paidAt: '2026-07-05T14:30:00Z',
  note: 'Acompte de 48% par chèque Ecobank N° 847291',
  recordedBy: 'user-sud-admin',
  isCancelled: false,
  createdAt: '2026-07-05T14:30:00Z'
};


// Devis 2: Validé, BAT Soumis (en attente de validation), Pas de Commande, Pas de Facture
export const mockQuote2: Quote = {
  id: 'quote-sud-002',
  organizationId: 'org-sud-print',
  quoteNumber: 'DEV-2026-0002',
  clientId: 'client-orange-sn',
  status: 'valide',
  subtotalFcfa: 3750000,
  vatAmountFcfa: 675000,
  marginPercent: 25.00,
  totalFcfa: 4425000,
  notes: 'Impression de 500 bâches publicitaires pour lancement d\'offres Orange Money.',
  createdBy: 'user-sud-commercial',
  validatedBy: 'user-sud-admin',
  validatedAt: '2026-07-10T11:00:00Z',
  createdAt: '2026-07-09T14:00:00Z',
  updatedAt: '2026-07-10T11:00:00Z',
  items: [
    {
      id: 'qi-003',
      quoteId: 'quote-sud-002',
      productId: 'prod-sud-bache',
      descriptionSnapshot: 'Bâche Grand Format Orange Money 1x1m',
      paperSnapshot: 'Bâche PVC 510g',
      finishingSnapshot: 'Œillets aux 4 coins, ourlet renforcé',
      quantity: 500,
      unitPriceFcfa: 7500,
      vatRate: 18.00,
      lineTotalFcfa: 3750000,
      sortOrder: 0
    }
  ]
};

export const mockBAT2: BAT = {
  id: 'bat-sud-002',
  organizationId: 'org-sud-print',
  quoteId: 'quote-sud-002',
  status: 'soumis',
  currentVersionId: 'bv-003',
  createdAt: '2026-07-11T09:00:00Z',
  updatedAt: '2026-07-12T10:00:00Z',
  versions: [
    {
      id: 'bv-003',
      batId: 'bat-sud-002',
      versionNumber: 1,
      filePath: 'bat/org-sud-print/quote-sud-002/v1.pdf',
      fileType: 'application/pdf',
      comment: 'Maquette finale HD soumise pour validation client.',
      uploadedBy: 'user-sud-commercial',
      uploadedAt: '2026-07-12T10:00:00Z'
    }
  ]
};


// Devis 3: En attente, Pas de BAT possible (règle absolue)
export const mockQuote3: Quote = {
  id: 'quote-sud-003',
  organizationId: 'org-sud-print',
  quoteNumber: 'DEV-2026-0003',
  clientId: 'client-cfao-sn',
  status: 'en_attente',
  subtotalFcfa: 800000,
  vatAmountFcfa: 144000,
  marginPercent: 15.00,
  totalFcfa: 944000,
  notes: 'Cartes de visite haut de gamme pour les directeurs de département.',
  createdBy: 'user-sud-commercial',
  createdAt: '2026-07-18T15:00:00Z',
  updatedAt: '2026-07-18T15:00:00Z',
  items: [
    {
      id: 'qi-004',
      quoteId: 'quote-sud-003',
      productId: 'prod-sud-cartes',
      descriptionSnapshot: 'Cartes de visite Directeurs CFAO',
      paperSnapshot: 'Couché Demi-mat 350g',
      finishingSnapshot: 'Pelliculage Soft Touch R/V, Vernis sélectif 3D',
      quantity: 10000,
      unitPriceFcfa: 80,
      vatRate: 18.00,
      lineTotalFcfa: 800000,
      sortOrder: 0
    }
  ]
};


// Devis 4: Validé, BAT Validé, Commande Terminée, Facture Soldée, Livrée
export const mockQuote4: Quote = {
  id: 'quote-sud-004',
  organizationId: 'org-sud-print',
  quoteNumber: 'DEV-2026-0004',
  clientId: 'client-orange-sn',
  status: 'valide',
  subtotalFcfa: 450000,
  vatAmountFcfa: 81000,
  marginPercent: 30.00,
  totalFcfa: 531000,
  notes: 'Flyers A5 pour l\'agence Orange de Thiès.',
  createdBy: 'user-sud-commercial',
  validatedBy: 'user-sud-admin',
  validatedAt: '2026-06-10T09:00:00Z',
  createdAt: '2026-06-08T10:00:00Z',
  updatedAt: '2026-06-10T09:00:00Z',
  items: [
    {
      id: 'qi-005',
      quoteId: 'quote-sud-004',
      productId: 'prod-sud-flyers',
      descriptionSnapshot: 'Flyers A5 Agence Thiès',
      paperSnapshot: 'Couché Brillant 135g',
      finishingSnapshot: 'Massicotage',
      quantity: 10000,
      unitPriceFcfa: 45,
      vatRate: 18.00,
      lineTotalFcfa: 450000,
      sortOrder: 0
    }
  ]
};

export const mockBAT4: BAT = {
  id: 'bat-sud-004',
  organizationId: 'org-sud-print',
  quoteId: 'quote-sud-004',
  status: 'valide',
  currentVersionId: 'bv-004',
  validatedBy: 'user-sud-commercial',
  validatedAt: '2026-06-11T16:00:00Z',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-11T16:00:00Z',
  versions: [
    {
      id: 'bv-004',
      batId: 'bat-sud-004',
      versionNumber: 1,
      filePath: 'bat/org-sud-print/quote-sud-004/v1.pdf',
      fileType: 'application/pdf',
      comment: 'Maquette finale validée par le responsable d\'agence.',
      uploadedBy: 'user-sud-commercial',
      uploadedAt: '2026-06-11T11:00:00Z'
    }
  ]
};

export const mockPO4: PurchaseOrder = {
  id: 'po-sud-004',
  organizationId: 'org-sud-print',
  orderNumber: 'BC-2026-0002',
  quoteId: 'quote-sud-004',
  batId: 'bat-sud-004',
  status: 'termine',
  machineSetup: 'Presse numérique Xerox Versant, massicotage rapide.',
  createdBy: 'user-sud-commercial',
  createdAt: '2026-06-12T08:00:00Z',
  updatedAt: '2026-06-14T17:00:00Z',
  items: [
    {
      id: 'poi-004',
      purchaseOrderId: 'po-sud-004',
      quoteItemId: 'qi-005',
      description: 'Flyers A5 Agence Thiès',
      quantity: 10000,
      sortOrder: 0
    }
  ]
};

export const mockInvoice4: Invoice = {
  id: 'inv-sud-004',
  organizationId: 'org-sud-print',
  invoiceNumber: 'FAC-2026-0002',
  quoteId: 'quote-sud-004',
  batId: 'bat-sud-004',
  clientId: 'client-orange-sn',
  status: 'soldee',
  subtotalFcfa: 450000,
  vatAmountFcfa: 81000,
  totalFcfa: 531000,
  amountPaidFcfa: 531000,
  isDeleted: false,
  createdBy: 'user-sud-admin',
  createdAt: '2026-06-12T09:00:00Z',
  updatedAt: '2026-06-15T11:00:00Z',
  items: [
    {
      id: 'ivi-004',
      invoiceId: 'inv-sud-004',
      quoteItemId: 'qi-005',
      description: 'Flyers A5 Agence Thiès',
      quantity: 10000,
      unitPriceFcfa: 45,
      vatRate: 18.00,
      lineTotalFcfa: 450000
    }
  ]
};

export const mockPayment4: Payment = {
  id: 'pay-sud-004',
  invoiceId: 'inv-sud-004',
  amountFcfa: 531000,
  method: 'mobile_money',
  paidAt: '2026-06-15T10:30:00Z',
  note: 'Paiement intégral via Orange Money Pro Réf TXN-8947291',
  recordedBy: 'user-sud-commercial',
  isCancelled: false,
  createdAt: '2026-06-15T10:30:00Z'
};

export const mockDelivery4: DeliveryNote = {
  id: 'dn-sud-004',
  organizationId: 'org-sud-print',
  deliveryNumber: 'BL-2026-0001',
  purchaseOrderId: 'po-sud-004',
  status: 'livre',
  deliveredTo: 'M. Ibrahima Diallo (Chef d\'agence Thiès)',
  signatureUrl: 'https://placehold.co/100x50/png?text=Signed',
  deliveredAt: '2026-06-16T14:00:00Z',
  createdBy: 'user-sud-atelier',
  createdAt: '2026-06-15T17:00:00Z',
  items: [
    {
      id: 'dni-004',
      deliveryNoteId: 'dn-sud-004',
      description: 'Flyers A5 Agence Thiès',
      quantityReady: 10000
    }
  ]
};


// --- Sahel Graphique Mock Data (Isolated) ---
export const mockQuoteSahel1: Quote = {
  id: 'quote-sahel-001',
  organizationId: 'org-sahel-graphique',
  quoteNumber: 'DEV-2026-0001',
  clientId: 'client-bceao-ml',
  status: 'valide',
  subtotalFcfa: 1250000,
  vatAmountFcfa: 225000,
  marginPercent: 20.00,
  totalFcfa: 1475000,
  notes: 'Affiches d\'information pour le siège de Bamako.',
  createdBy: 'user-sahel-commercial',
  validatedBy: 'user-sahel-admin',
  validatedAt: '2026-07-01T11:00:00Z',
  createdAt: '2026-06-30T10:00:00Z',
  updatedAt: '2026-07-01T11:00:00Z',
  items: [
    {
      id: 'qi-sahel-1',
      quoteId: 'quote-sahel-001',
      productId: 'prod-sahel-affiches',
      descriptionSnapshot: 'Affiches A3 - Normes Bancaires',
      paperSnapshot: 'Couché Mat 170g',
      finishingSnapshot: 'Massicotage',
      quantity: 5000,
      unitPriceFcfa: 250,
      vatRate: 18.00,
      lineTotalFcfa: 1250000,
      sortOrder: 0
    }
  ]
};

export const mockBATSahel1: BAT = {
  id: 'bat-sahel-001',
  organizationId: 'org-sahel-graphique',
  quoteId: 'quote-sahel-001',
  status: 'valide',
  currentVersionId: 'bv-sahel-1',
  validatedBy: 'user-sahel-admin',
  validatedAt: '2026-07-03T14:00:00Z',
  createdAt: '2026-07-01T14:00:00Z',
  updatedAt: '2026-07-03T14:00:00Z',
  versions: [
    {
      id: 'bv-sahel-1',
      batId: 'bat-sahel-001',
      versionNumber: 1,
      filePath: 'bat/org-sahel-graphique/quote-sahel-001/v1.pdf',
      fileType: 'application/pdf',
      comment: 'Maquette A3 validée par la direction de la communication.',
      uploadedBy: 'user-sahel-commercial',
      uploadedAt: '2026-07-02T10:00:00Z'
    }
  ]
};

export const mockPOSahel1: PurchaseOrder = {
  id: 'po-sahel-001',
  organizationId: 'org-sahel-graphique',
  orderNumber: 'BC-2026-0001',
  quoteId: 'quote-sahel-001',
  batId: 'bat-sahel-001',
  status: 'en_cours_impression',
  createdBy: 'user-sahel-commercial',
  createdAt: '2026-07-04T09:00:00Z',
  updatedAt: '2026-07-04T09:00:00Z'
};

export const mockInvoiceSahel1: Invoice = {
  id: 'inv-sahel-001',
  organizationId: 'org-sahel-graphique',
  invoiceNumber: 'FAC-2026-0001',
  quoteId: 'quote-sahel-001',
  batId: 'bat-sahel-001',
  clientId: 'client-bceao-ml',
  status: 'soldee',
  subtotalFcfa: 1250000,
  vatAmountFcfa: 225000,
  totalFcfa: 1475000,
  amountPaidFcfa: 1475000,
  isDeleted: false,
  createdBy: 'user-sahel-admin',
  createdAt: '2026-07-04T09:15:00Z',
  updatedAt: '2026-07-04T12:00:00Z',
};

export const mockPaymentSahel1: Payment = {
  id: 'pay-sahel-001',
  invoiceId: 'inv-sahel-001',
  amountFcfa: 1475000,
  method: 'cheque',
  paidAt: '2026-07-04T11:45:00Z',
  recordedBy: 'user-sahel-admin',
  isCancelled: false,
  createdAt: '2026-07-04T11:45:00Z'
};


// --- Consolidations lists ---
export const allQuotes = [mockQuote1, mockQuote2, mockQuote3, mockQuote4, mockQuoteSahel1];
export const allBATs = [mockBAT1, mockBAT2, mockBAT4, mockBATSahel1];
export const allPOs = [mockPO1, mockPO4, mockPOSahel1];
export const allInvoices = [mockInvoice1, mockInvoice4, mockInvoiceSahel1];
export const allPayments = [mockPayment1, mockPayment4, mockPaymentSahel1];
export const allDeliveries = [mockDelivery4];

// --- Audit Log Mock ---
export const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    organizationId: 'org-sud-print',
    entityType: 'quotes',
    entityId: 'quote-sud-001',
    action: 'Devis créé',
    actorId: 'user-sud-commercial',
    actorRole: 'commercial',
    occurredAt: '2026-07-01T09:00:00Z',
    afterData: { quoteNumber: 'DEV-2026-0001', total_fcfa: 2065000 }
  },
  {
    id: '2',
    organizationId: 'org-sud-print',
    entityType: 'quotes',
    entityId: 'quote-sud-001',
    action: 'Devis validé',
    actorId: 'user-sud-admin',
    actorRole: 'admin',
    occurredAt: '2026-07-02T10:00:00Z',
    afterData: { status: 'valide' }
  },
  {
    id: '3',
    organizationId: 'org-sud-print',
    entityType: 'bat',
    entityId: 'bat-sud-001',
    action: 'BAT créé',
    actorId: 'user-sud-commercial',
    actorRole: 'commercial',
    occurredAt: '2026-07-02T10:20:00Z',
    afterData: { quote_id: 'quote-sud-001', status: 'en_attente' }
  },
  {
    id: '4',
    organizationId: 'org-sud-print',
    entityType: 'bat',
    entityId: 'bat-sud-001',
    action: 'Version 2 soumise',
    actorId: 'user-sud-commercial',
    actorRole: 'commercial',
    occurredAt: '2026-07-04T11:00:00Z',
  },
  {
    id: '5',
    organizationId: 'org-sud-print',
    entityType: 'bat',
    entityId: 'bat-sud-001',
    action: 'BAT validé par client',
    actorId: 'user-sud-admin',
    actorRole: 'admin',
    occurredAt: '2026-07-04T15:00:00Z',
    afterData: { status: 'valide' }
  },
  {
    id: '6',
    organizationId: 'org-sud-print',
    entityType: 'purchase_orders',
    entityId: 'po-sud-001',
    action: 'Bon de Commande créé',
    actorId: 'user-sud-commercial',
    actorRole: 'commercial',
    occurredAt: '2026-07-05T08:30:00Z',
    afterData: { orderNumber: 'BC-2026-0001', status: 'en_attente_production' }
  },
  {
    id: '7',
    organizationId: 'org-sud-print',
    entityType: 'invoices',
    entityId: 'inv-sud-001',
    action: 'Facture émise',
    actorId: 'user-sud-admin',
    actorRole: 'admin',
    occurredAt: '2026-07-05T08:45:00Z',
    afterData: { invoiceNumber: 'FAC-2026-0001', total_fcfa: 2065000 }
  },
  {
    id: '8',
    organizationId: 'org-sud-print',
    entityType: 'payments',
    entityId: 'pay-sud-001',
    action: 'Paiement enregistré',
    actorId: 'user-sud-admin',
    actorRole: 'admin',
    occurredAt: '2026-07-05T14:30:00Z',
    afterData: { amountFcfa: 1000000, method: 'cheque' }
  },
  {
    id: '9',
    organizationId: 'org-sud-print',
    entityType: 'purchase_orders',
    entityId: 'po-sud-001',
    action: 'Mise en production',
    actorId: 'user-sud-atelier',
    actorRole: 'chef_atelier',
    occurredAt: '2026-07-05T15:00:00Z',
    afterData: { status: 'en_cours_impression' }
  }
];
