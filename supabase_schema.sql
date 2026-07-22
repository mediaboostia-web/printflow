-- Print_Flow Supabase / PostgreSQL Database Schema
-- Paste this script into the Supabase SQL Editor to set up your tables and mock data.

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables in case of rebuild
DROP TABLE IF EXISTS public.online_orders CASCADE;
DROP TABLE IF EXISTS public.delivery_note_items CASCADE;
DROP TABLE IF EXISTS public.delivery_notes CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.purchase_order_items CASCADE;
DROP TABLE IF EXISTS public.purchase_orders CASCADE;
DROP TABLE IF EXISTS public.bat_versions CASCADE;
DROP TABLE IF EXISTS public.bats CASCADE;
DROP TABLE IF EXISTS public.quote_items CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.product_price_tiers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.taxes CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.paper_formats CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.superadmins CASCADE;

-- 1. Organizations
CREATE TABLE public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    subscription_plan_id TEXT DEFAULT 'plan-free', -- Default to Free Trial
    subscription_status TEXT DEFAULT 'active',
    subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'), -- Default to 7 days
    catalogue_enabled BOOLEAN DEFAULT true, -- Public catalogue link on/off switch (Formule Pro only)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Profiles (Users)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'commercial', 'chef_atelier')),
    email TEXT UNIQUE,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    password TEXT NOT NULL DEFAULT 'collaborateur2026', -- Local password for direct logins
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Superadmins (SaaS Operators)
CREATE TABLE public.superadmins (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Clients
CREATE TABLE public.clients (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_by TEXT,
    source TEXT DEFAULT 'interne', -- 'interne' | 'catalogue_public'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Products
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    material_type TEXT DEFAULT 'papier', -- 'papier' | 'textile' | 'support_rigide' | 'autre'
    paper_type TEXT,
    grammage_g INTEGER,
    format TEXT,
    format_options JSONB DEFAULT '[]'::jsonb, -- [{ "label": "A4", "extraPriceFcfa": 0 }, ...]
    finishing TEXT,
    photo_url TEXT,
    unit_price_fcfa NUMERIC NOT NULL,
    vat_rate NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Product Price Tiers
CREATE TABLE public.product_price_tiers (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    unit_price_fcfa NUMERIC NOT NULL
);

-- 7. Quotes (Devis)
CREATE TABLE public.quotes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente', 'valide', 'refuse')),
    subtotal_fcfa NUMERIC NOT NULL,
    vat_amount_fcfa NUMERIC NOT NULL,
    margin_percent NUMERIC,
    total_fcfa NUMERIC NOT NULL,
    notes TEXT,
    created_by TEXT,
    validated_by TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Quote Items
CREATE TABLE public.quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id TEXT,
    description_snapshot TEXT NOT NULL,
    paper_snapshot TEXT,
    finishing_snapshot TEXT,
    quantity INTEGER NOT NULL,
    unit_price_fcfa NUMERIC NOT NULL,
    vat_rate NUMERIC NOT NULL,
    line_total_fcfa NUMERIC NOT NULL,
    sort_order INTEGER NOT NULL
);

-- 9. BATs (Bon à Tirer)
CREATE TABLE public.bats (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente', 'soumis', 'valide', 'refuse')),
    current_version_id TEXT,
    validated_by TEXT,
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. BAT Versions
CREATE TABLE public.bat_versions (
    id TEXT PRIMARY KEY,
    bat_id TEXT REFERENCES public.bats(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    comment TEXT,
    uploaded_by TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. Purchase Orders (Bons de Commande / Production)
CREATE TABLE public.purchase_orders (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    bat_id TEXT REFERENCES public.bats(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente_production', 'en_cours_impression', 'termine')),
    machine_setup TEXT,
    deposit_amount_fcfa NUMERIC,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Purchase Order Items
CREATE TABLE public.purchase_order_items (
    id TEXT PRIMARY KEY,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    quote_item_id TEXT,
    description TEXT NOT NULL,
    finishing TEXT,
    quantity INTEGER NOT NULL,
    sort_order INTEGER NOT NULL
);

-- 13. Invoices (Factures)
CREATE TABLE public.invoices (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    quote_id TEXT REFERENCES public.quotes(id) ON DELETE CASCADE,
    bat_id TEXT REFERENCES public.bats(id) ON DELETE CASCADE,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_attente_acompte', 'partiellement_payee', 'soldee')),
    subtotal_fcfa NUMERIC NOT NULL,
    vat_amount_fcfa NUMERIC NOT NULL,
    total_fcfa NUMERIC NOT NULL,
    amount_paid_fcfa NUMERIC DEFAULT 0,
    is_deleted BOOLEAN DEFAULT false,
    deleted_reason TEXT,
    deleted_by TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 14. Invoice Items
CREATE TABLE public.invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    quote_item_id TEXT,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price_fcfa NUMERIC NOT NULL,
    vat_rate NUMERIC NOT NULL,
    line_total_fcfa NUMERIC NOT NULL
);

-- 15. Payments
CREATE TABLE public.payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount_fcfa NUMERIC NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('especes', 'cheque', 'mobile_money')),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    note TEXT,
    recorded_by TEXT,
    is_cancelled BOOLEAN DEFAULT false,
    cancelled_reason TEXT,
    cancelled_by TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 16. Delivery Notes (Bons de Livraison)
CREATE TABLE public.delivery_notes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    delivery_number TEXT NOT NULL,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pret_expedition', 'livre')),
    delivered_to TEXT,
    signature_url TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 17. Delivery Note Items
CREATE TABLE public.delivery_note_items (
    id TEXT PRIMARY KEY,
    delivery_note_id TEXT REFERENCES public.delivery_notes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity_ready INTEGER NOT NULL
);

-- 18. Taxes Settings
CREATE TABLE public.taxes (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC NOT NULL
);

-- 19. Machines Settings
CREATE TABLE public.machines (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL
);

-- 20. Partners Settings
CREATE TABLE public.partners (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service TEXT NOT NULL
);

-- 21. Paper Formats Settings
CREATE TABLE public.paper_formats (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    format_name TEXT NOT NULL
);

-- 22. Audit Logs
CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_id TEXT,
    actor_role TEXT,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    before_data JSONB,
    after_data JSONB,
    metadata JSONB
);

-- 23. Online Orders (Public Catalogue — Formule Pro)
-- Orders submitted anonymously by external clients through the public catalogue link
-- (app/catalogue/[orgId]). Kept as a lightweight inbox (JSONB items, no item sub-table)
-- since it's a staging area reviewed by staff before being converted into a real Devis.
CREATE TABLE public.online_orders (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'en_traitement', 'convertie', 'rejetee')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_fcfa NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


--------------------------------------------------------------------------------
-- SEED DATA
--------------------------------------------------------------------------------

-- 1. Seed Organizations
INSERT INTO public.organizations (id, name, address, phone, email, is_active, subscription_plan_id, subscription_status, subscription_end_date, created_at) VALUES
('org-sud-print', 'Sud Print', 'Avenue Cheikh Anta Diop, Dakar, Sénégal', '+221 33 824 55 66', 'contact@sudprint.sn', true, 'plan-pro', 'active', '2027-01-01T00:00:00Z', '2026-01-10T08:00:00Z'),
('org-sahel-graphique', 'Sahel Graphique', 'Zone Industrielle, Bamako, Mali', '+223 20 22 44 88', 'info@sahelgraphique.ml', true, 'plan-std', 'active', '2026-12-31T23:59:59Z', '2026-02-15T09:30:00Z');

-- 2. Seed Superadmins
INSERT INTO public.superadmins (id, full_name, email, password, created_at) VALUES
('superadmin-1', 'Root Administrateur', 'superadmin@printflow.io', 'RootAccess#2026', '2026-01-01T08:00:00Z');

-- 3. Seed Profiles
INSERT INTO public.profiles (id, organization_id, full_name, role, email, phone, is_active, password, created_at, updated_at) VALUES
('user-sud-admin', 'org-sud-print', 'Fatou Diop', 'admin', 'fatou.diop@sudprint.sn', '+221 77 654 32 10', true, 'sudprint2026', '2026-01-10T08:05:00Z', '2026-01-10T08:05:00Z'),
('user-sud-commercial', 'org-sud-print', 'Amadou Sow', 'commercial', 'amadou.sow@sudprint.sn', '+221 77 987 65 43', true, 'sudprint2026', '2026-01-12T10:00:00Z', '2026-01-12T10:00:00Z'),
('user-sud-atelier', 'org-sud-print', 'Moustapha Ndiaye', 'chef_atelier', 'moustapha.ndiaye@sudprint.sn', '+221 77 111 22 33', true, 'sudprint2026', '2026-01-12T10:15:00Z', '2026-01-12T10:15:00Z'),
('user-sahel-admin', 'org-sahel-graphique', 'Ousmane Keita', 'admin', 'ousmane.keita@sahelgraphique.ml', '+223 76 54 32 10', true, 'sahel2026', '2026-02-15T09:35:00Z', '2026-02-15T09:35:00Z'),
('user-sahel-commercial', 'org-sahel-graphique', 'Mariam Diallo', 'commercial', 'mariam.diallo@sahelgraphique.ml', '+223 66 88 99 00', true, 'sahel2026', '2026-02-16T11:00:00Z', '2026-02-16T11:00:00Z');

-- 4. Seed Clients
INSERT INTO public.clients (id, organization_id, company_name, contact_name, phone, email, address, created_by, created_at, updated_at) VALUES
('client-senelec', 'org-sud-print', 'SENELEC', 'M. Abdoulaye Diallo', '+221 33 839 00 00', 'a.diallo@senelec.sn', '28 Rue Vincens, Dakar', 'user-sud-commercial', '2026-01-20T09:00:00Z', '2026-01-20T09:00:00Z'),
('client-orange-sn', 'org-sud-print', 'Sonatel Orange', 'Mme Awa Cissé', '+221 33 839 20 20', 'awa.cisse@orange.sn', 'Vdn, Dakar', 'user-sud-commercial', '2026-01-22T14:30:00Z', '2026-01-22T14:30:00Z'),
('client-cfao-sn', 'org-sud-print', 'CFAO Motors Sénégal', 'M. Jean-Pierre Gomis', '+221 33 849 77 77', 'jpgomis@cfao.sn', 'Km 2, Boulevard du Centenaire, Dakar', 'user-sud-admin', '2026-01-25T11:00:00Z', '2026-01-25T11:00:00Z'),
('client-bceao-ml', 'org-sahel-graphique', 'BCEAO Mali', 'M. Souleymane Traoré', '+223 20 22 25 41', 'straore@bceao.int', 'Avenue de la Marne, Bamako', 'user-sahel-commercial', '2026-02-20T10:00:00Z', '2026-02-20T10:00:00Z'),
('client-telecom-ml', 'org-sahel-graphique', 'Malitel', 'Mme Fatoumata Coulibaly', '+223 20 29 00 00', 'f.coulibaly@malitel.ml', 'Route de Koulikoro, Bamako', 'user-sahel-commercial', '2026-02-22T16:00:00Z', '2026-02-22T16:00:00Z');

-- 5. Seed Products
INSERT INTO public.products (id, organization_id, name, category, description, material_type, paper_type, grammage_g, format, format_options, finishing, unit_price_fcfa, vat_rate, is_active, created_at, updated_at) VALUES
('prod-sud-flyers', 'org-sud-print', 'Flyers A5', 'Distribution', 'Flyers A5, impression Recto/Verso, papier Couché Brillant 135g.', 'papier', 'Couché Brillant', 135, 'A5', '[{"label":"A5","extraPriceFcfa":0},{"label":"A6","extraPriceFcfa":-10},{"label":"A4","extraPriceFcfa":25}]', 'Massicotage', 45, 18.00, true, '2026-01-15T09:00:00Z', '2026-01-15T09:00:00Z'),
('prod-sud-bache', 'org-sud-print', 'Bâche Grand Format', 'Signalétique', 'Bâche PVC 510g/m² avec œillets tous les 50cm.', 'support_rigide', 'Bâche PVC', 510, 'Sur mesure (m²)', '[{"label":"1x1 m","extraPriceFcfa":0},{"label":"2x1 m","extraPriceFcfa":6000},{"label":"3x2 m","extraPriceFcfa":18000}]', 'Œillets & Ourlet', 7500, 18.00, true, '2026-01-15T09:10:00Z', '2026-01-15T09:10:00Z'),
('prod-sud-cartes', 'org-sud-print', 'Cartes de Visite', 'Papeterie', 'Cartes de visite 8.5x5.4cm sur papier 350g Couché Demi-mat, Pelliculage Soft Touch R/V.', 'papier', 'Couché Demi-mat', 350, '85x54 mm', '[]', 'Pelliculage Mat Soft Touch R/V', 80, 18.00, true, '2026-01-15T09:20:00Z', '2026-01-15T09:20:00Z'),
('prod-sud-brochures', 'org-sud-print', 'Brochure A4 16 pages', 'Édition', 'Brochures agrafées A4, Couverture 250g Couché Brillant, Intérieur 135g Couché Brillant, 16 pages.', 'papier', 'Couché Brillant', 135, 'A4 (fermé)', '[]', 'Piquage 2 points métal, pliage, massicotage', 1200, 18.00, true, '2026-01-15T09:30:00Z', '2026-01-15T09:30:00Z'),
('prod-sud-textile', 'org-sud-print', 'Oriflamme Textile Publicitaire', 'Grand Format', 'Oriflamme en textile polyester tendu, impression sublimation, finition fourreau + œillets.', 'textile', 'Polyester Tendu 110g', NULL, '60x160 cm', '[{"label":"60x160 cm","extraPriceFcfa":0},{"label":"80x200 cm","extraPriceFcfa":4500},{"label":"100x300 cm","extraPriceFcfa":12000}]', 'Fourreau + Œillets', 18500, 18.00, true, '2026-01-15T09:40:00Z', '2026-01-15T09:40:00Z'),
('prod-sahel-affiches', 'org-sahel-graphique', 'Affiches A3', 'Distribution', 'Affiches A3, Recto seul, papier Couché Mat 170g.', 'papier', 'Couché Mat', 170, 'A3', '[]', 'Massicotage', 250, 18.00, true, '2026-02-18T10:00:00Z', '2026-02-18T10:00:00Z');

-- 6. Seed Price Tiers
INSERT INTO public.product_price_tiers (id, product_id, min_quantity, max_quantity, unit_price_fcfa) VALUES
('tier-1', 'prod-sud-flyers', 100, 499, 45),
('tier-2', 'prod-sud-flyers', 500, 1999, 35),
('tier-3', 'prod-sud-flyers', 2000, NULL, 25),
('tier-4', 'prod-sud-bache', 1, 9, 7500),
('tier-5', 'prod-sud-bache', 10, NULL, 6000),
('tier-6', 'prod-sud-cartes', 100, 499, 80),
('tier-7', 'prod-sud-cartes', 500, 999, 60),
('tier-8', 'prod-sud-cartes', 1000, NULL, 45),
('tier-12', 'prod-sud-textile', 1, 4, 18500),
('tier-13', 'prod-sud-textile', 5, NULL, 15500),
('tier-9', 'prod-sud-brochures', 50, 249, 1200),
('tier-10', 'prod-sud-brochures', 250, NULL, 950),
('tier-11', 'prod-sahel-affiches', 50, NULL, 250);

-- 7. Seed Quotes
INSERT INTO public.quotes (id, organization_id, quote_number, client_id, status, subtotal_fcfa, vat_amount_fcfa, margin_percent, total_fcfa, notes, created_by, validated_by, validated_at, created_at, updated_at) VALUES
('quote-sud-001', 'org-sud-print', 'DEV-2026-0001', 'client-senelec', 'valide', 1750000, 315000, 20.00, 2065000, 'Campagne de sensibilisation sécurité électricité - Impression de brochures.', 'user-sud-commercial', 'user-sud-admin', '2026-07-02T10:00:00Z', '2026-07-01T09:00:00Z', '2026-07-02T10:00:00Z'),
('quote-sud-002', 'org-sud-print', 'DEV-2026-0002', 'client-orange-sn', 'valide', 3750000, 675000, 25.00, 4425000, 'Impression de 500 bâches publicitaires pour lancement d''offres Orange Money.', 'user-sud-commercial', 'user-sud-admin', '2026-07-10T11:00:00Z', '2026-07-09T14:00:00Z', '2026-07-10T11:00:00Z'),
('quote-sud-003', 'org-sud-print', 'DEV-2026-0003', 'client-cfao-sn', 'en_attente', 800000, 144000, 15.00, 944000, 'Cartes de visite haut de gamme pour les directeurs de département.', 'user-sud-commercial', NULL, NULL, '2026-07-18T15:00:00Z', '2026-07-18T15:00:00Z'),
('quote-sud-004', 'org-sud-print', 'DEV-2026-0004', 'client-orange-sn', 'valide', 450000, 81000, 30.00, 531000, 'Flyers A5 pour l''agence Orange de Thiès.', 'user-sud-commercial', 'user-sud-admin', '2026-06-10T09:00:00Z', '2026-06-08T10:00:00Z', '2026-06-10T09:00:00Z'),
('quote-sahel-001', 'org-sahel-graphique', 'DEV-2026-0001', 'client-bceao-ml', 'valide', 1250000, 225000, 20.00, 1475000, 'Affiches d''information pour le siège de Bamako.', 'user-sahel-commercial', 'user-sahel-admin', '2026-07-01T11:00:00Z', '2026-06-30T10:00:00Z', '2026-07-01T11:00:00Z');

-- 8. Seed Quote Items
INSERT INTO public.quote_items (id, quote_id, product_id, description_snapshot, paper_snapshot, finishing_snapshot, quantity, unit_price_fcfa, vat_rate, line_total_fcfa, sort_order) VALUES
('qi-001', 'quote-sud-001', 'prod-sud-brochures', 'Brochure A4 16 pages - Sensibilisation 2026', 'Couché Brillant 135g', 'Piquage 2 points métal, pliage, massicotage', 1000, 950, 18.00, 950000, 0),
('qi-002', 'quote-sud-001', 'prod-sud-flyers', 'Flyers A5 - Consignes de Sécurité Ménage', 'Couché Brillant 135g', 'Massicotage', 22858, 35, 18.00, 800030, 1),
('qi-003', 'quote-sud-002', 'prod-sud-bache', 'Bâche Grand Format Orange Money 1x1m', 'Bâche PVC 510g', 'Œillets aux 4 coins, ourlet renforcé', 500, 7500, 18.00, 3750000, 0),
('qi-004', 'quote-sud-003', 'prod-sud-cartes', 'Cartes de visite Directeurs CFAO', 'Couché Demi-mat 350g', 'Pelliculage Soft Touch R/V, Vernis sélectif 3D', 10000, 80, 18.00, 800000, 0),
('qi-005', 'quote-sud-004', 'prod-sud-flyers', 'Flyers A5 Agence Thiès', 'Couché Brillant 135g', 'Massicotage', 10000, 45, 18.00, 450000, 0),
('qi-sahel-1', 'quote-sahel-001', 'prod-sahel-affiches', 'Affiches A3 - Normes Bancaires', 'Couché Mat 170g', 'Massicotage', 5000, 250, 18.00, 1250000, 0);

-- 9. Seed BATs
INSERT INTO public.bats (id, organization_id, quote_id, status, current_version_id, validated_by, validated_at, created_at, updated_at) VALUES
('bat-sud-001', 'org-sud-print', 'quote-sud-001', 'valide', 'bv-002', 'user-sud-admin', '2026-07-04T15:00:00Z', '2026-07-02T10:15:00Z', '2026-07-04T15:00:00Z'),
('bat-sud-002', 'org-sud-print', 'quote-sud-002', 'soumis', 'bv-003', NULL, NULL, '2026-07-11T09:00:00Z', '2026-07-12T10:00:00Z'),
('bat-sud-004', 'org-sud-print', 'quote-sud-004', 'valide', 'bv-004', 'user-sud-commercial', '2026-06-11T16:00:00Z', '2026-06-10T10:00:00Z', '2026-06-11T16:00:00Z'),
('bat-sahel-001', 'org-sahel-graphique', 'quote-sahel-001', 'valide', 'bv-sahel-1', 'user-sahel-admin', '2026-07-03T14:00:00Z', '2026-07-01T14:00:00Z', '2026-07-03T14:00:00Z');

-- 10. Seed BAT Versions
INSERT INTO public.bat_versions (id, bat_id, version_number, file_path, file_type, comment, uploaded_by, uploaded_at) VALUES
('bv-001', 'bat-sud-001', 1, 'bat/org-sud-print/quote-sud-001/v1.pdf', 'application/pdf', 'Première version pour relecture. Logo SENELEC corrigé.', 'user-sud-commercial', '2026-07-02T10:20:00Z'),
('bv-002', 'bat-sud-001', 2, 'bat/org-sud-print/quote-sud-001/v2.pdf', 'application/pdf', 'Version corrigée après retour client sur le texte de page 4.', 'user-sud-commercial', '2026-07-04T11:00:00Z'),
('bv-003', 'bat-sud-002', 1, 'bat/org-sud-print/quote-sud-002/v1.pdf', 'application/pdf', 'Maquette finale HD soumise pour validation client.', 'user-sud-commercial', '2026-07-12T10:00:00Z'),
('bv-004', 'bat-sud-004', 1, 'bat/org-sud-print/quote-sud-004/v1.pdf', 'application/pdf', 'Maquette finale validée par le responsable d''agence.', 'user-sud-commercial', '2026-06-11T11:00:00Z'),
('bv-sahel-1', 'bat-sahel-001', 1, 'bat/org-sahel-graphique/quote-sahel-001/v1.pdf', 'application/pdf', 'Maquette A3 validée par la direction de la communication.', 'user-sahel-commercial', '2026-07-02T10:00:00Z');

-- 11. Seed Purchase Orders
INSERT INTO public.purchase_orders (id, organization_id, order_number, quote_id, bat_id, status, machine_setup, deposit_amount_fcfa, created_by, created_at, updated_at) VALUES
('po-sud-001', 'org-sud-print', 'BC-2026-0001', 'quote-sud-001', 'bat-sud-001', 'en_cours_impression', 'Impression Offset Heidelberger Speedmaster, CTP plaques neuves. Massicotage et agrafage automatique.', NULL, 'user-sud-commercial', '2026-07-05T08:30:00Z', '2026-07-05T09:00:00Z'),
('po-sud-004', 'org-sud-print', 'BC-2026-0002', 'quote-sud-004', 'bat-sud-004', 'termine', 'Presse numérique Xerox Versant, massicotage rapide.', NULL, 'user-sud-commercial', '2026-06-12T08:00:00Z', '2026-06-14T17:00:00Z'),
('po-sahel-001', 'org-sahel-graphique', 'BC-2026-0001', 'quote-sahel-001', 'bat-sahel-001', 'en_cours_impression', NULL, NULL, 'user-sahel-commercial', '2026-07-04T09:00:00Z', '2026-07-04T09:00:00Z');

-- 12. Seed PO Items
INSERT INTO public.purchase_order_items (id, purchase_order_id, quote_item_id, description, finishing, quantity, sort_order) VALUES
('poi-001', 'po-sud-001', 'qi-001', 'Brochure A4 16 pages - Sensibilisation 2026', 'Piquage 2 points métal, pliage, massicotage', 1000, 0),
('poi-002', 'po-sud-001', 'qi-002', 'Flyers A5 - Consignes de Sécurité Ménage', 'Massicotage', 22858, 1),
('poi-004', 'po-sud-004', 'qi-005', 'Flyers A5 Agence Thiès', 'Massicotage', 10000, 0);

-- 13. Seed Invoices
INSERT INTO public.invoices (id, organization_id, invoice_number, quote_id, bat_id, client_id, status, subtotal_fcfa, vat_amount_fcfa, total_fcfa, amount_paid_fcfa, is_deleted, created_by, created_at, updated_at) VALUES
('inv-sud-001', 'org-sud-print', 'FAC-2026-0001', 'quote-sud-001', 'bat-sud-001', 'client-senelec', 'partiellement_payee', 1750000, 315000, 2065000, 1000000, false, 'user-sud-admin', '2026-07-05T08:45:00Z', '2026-07-05T15:00:00Z'),
('inv-sud-004', 'org-sud-print', 'FAC-2026-0002', 'quote-sud-004', 'bat-sud-004', 'client-orange-sn', 'soldee', 450000, 81000, 531000, 531000, false, 'user-sud-admin', '2026-06-12T09:00:00Z', '2026-06-15T11:00:00Z'),
('inv-sahel-001', 'org-sahel-graphique', 'FAC-2026-0001', 'quote-sahel-001', 'bat-sahel-001', 'client-bceao-ml', 'soldee', 1250000, 225000, 1475000, 1475000, false, 'user-sahel-admin', '2026-07-04T09:15:00Z', '2026-07-04T12:00:00Z');

-- 14. Seed Invoice Items
INSERT INTO public.invoice_items (id, invoice_id, quote_item_id, description, quantity, unit_price_fcfa, vat_rate, line_total_fcfa) VALUES
('ivi-001', 'inv-sud-001', 'qi-001', 'Brochure A4 16 pages - Sensibilisation 2026', 1000, 950, 18.00, 950000),
('ivi-002', 'inv-sud-001', 'qi-002', 'Flyers A5 - Consignes de Sécurité Ménage', 22858, 35, 18.00, 800030),
('ivi-004', 'inv-sud-004', 'qi-005', 'Flyers A5 Agence Thiès', 10000, 45, 18.00, 450000);

-- 15. Seed Payments
INSERT INTO public.payments (id, invoice_id, amount_fcfa, method, paid_at, note, recorded_by, is_cancelled, created_at) VALUES
('pay-sud-001', 'inv-sud-001', 1000000, 'cheque', '2026-07-05T14:30:00Z', 'Acompte de 48% par chèque Ecobank N° 847291', 'user-sud-admin', false, '2026-07-05T14:30:00Z'),
('pay-sud-004', 'inv-sud-004', 531000, 'mobile_money', '2026-06-15T10:30:00Z', 'Paiement intégral via Orange Money Pro Réf TXN-8947291', 'user-sud-commercial', false, '2026-06-15T10:30:00Z'),
('pay-sahel-001', 'inv-sahel-001', 1475000, 'cheque', '2026-07-04T11:45:00Z', NULL, 'user-sahel-admin', false, '2026-07-04T11:45:00Z');

-- 16. Seed Delivery Notes
INSERT INTO public.delivery_notes (id, organization_id, delivery_number, purchase_order_id, status, delivered_to, signature_url, delivered_at, created_by, created_at, updated_at) VALUES
('dn-sud-004', 'org-sud-print', 'BL-2026-0001', 'po-sud-004', 'livre', 'M. Ibrahima Diallo (Chef d''agence Thiès)', 'https://placehold.co/100x50/png?text=Signed', '2026-06-16T14:00:00Z', 'user-sud-atelier', '2026-06-15T17:00:00Z', '2026-06-16T14:00:00Z');

-- 17. Seed Delivery Note Items
INSERT INTO public.delivery_note_items (id, delivery_note_id, description, quantity_ready) VALUES
('dni-004', 'dn-sud-004', 'Flyers A5 Agence Thiès', 10000);

-- 18. Seed Default Taxes
INSERT INTO public.taxes (id, organization_id, name, rate) VALUES
('tax-1-sud', 'org-sud-print', 'TVA Sénégal Standard', 18),
('tax-2-sud', 'org-sud-print', 'TVA Exonérée / Export', 0),
('tax-3-sud', 'org-sud-print', 'TVA Hors-champ', 0),
('tax-1-sahel', 'org-sahel-graphique', 'TVA Mali Standard', 18);

-- 19. Seed Default Machines
INSERT INTO public.machines (id, organization_id, name, type) VALUES
('m-1-sud', 'org-sud-print', 'Presse Offset Heidelberg Speedmaster', 'Offset'),
('m-2-sud', 'org-sud-print', 'Xerox Versant 180 Press', 'Numérique'),
('m-3-sud', 'org-sud-print', 'Traceur Roland TrueVIS SG2-640', 'Grand Format'),
('m-4-sud', 'org-sud-print', 'Massicot Polar 92 ED', 'Finition / Découpe'),
('m-1-sahel', 'org-sahel-graphique', 'Offset 4 Couleurs Ryobi', 'Offset');

-- 20. Seed Default Partners
INSERT INTO public.partners (id, organization_id, name, service) VALUES
('p-1-sud', 'org-sud-print', 'Express Plastification Dakar', 'Pelliculage & Vernis'),
('p-2-sud', 'org-sud-print', 'Façonnage Dakar S.A.', 'Plis & Rainurage');

-- 21. Seed Default Paper Formats
INSERT INTO public.paper_formats (id, organization_id, format_name) VALUES
('f-1-sud', 'org-sud-print', 'A4 (21 x 29.7 cm)'),
('f-2-sud', 'org-sud-print', 'A3 (29.7 x 42 cm)'),
('f-3-sud', 'org-sud-print', 'A5 (14.8 x 21 cm)'),
('f-4-sud', 'org-sud-print', 'Carte de visite (8.5 x 5.4 cm)'),
('f-1-sahel', 'org-sahel-graphique', 'A4 (21 x 29.7 cm)'),
('f-2-sahel', 'org-sahel-graphique', 'A3 (29.7 x 42 cm)');

-- 22. Seed Audit Logs
INSERT INTO public.audit_logs (id, organization_id, entity_type, entity_id, action, actor_id, actor_role, occurred_at) VALUES
('log-1', 'system', 'system', 'sys', 'Initialisation de la plateforme Print_Flow', 'system', NULL, '2026-07-15T08:00:00Z'),
('log-2', 'org-sud-print', 'subscription', 'org-sud-print', 'Abonnement Pro activé pour Sud Print', 'system', NULL, '2026-07-15T08:05:00Z'),
('log-3', 'org-sahel-graphique', 'subscription', 'org-sahel-graphique', 'Abonnement Pro activé pour Sahel Graphique', 'system', NULL, '2026-07-15T08:10:00Z');


--------------------------------------------------------------------------------
-- MIGRATION: Catalogue Public & Commandes en ligne (Formule Pro)
--------------------------------------------------------------------------------
-- Additive & idempotent — safe to run once against an EXISTING project without
-- losing data (unlike the DROP/CREATE bootstrap script above, which is only for
-- a brand new Supabase project). Paste this block alone into the SQL Editor if
-- your project already has the base schema from a previous run of this file.

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS catalogue_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material_type TEXT DEFAULT 'papier';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS format_options JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'interne';

CREATE TABLE IF NOT EXISTS public.online_orders (
    id TEXT PRIMARY KEY,
    organization_id TEXT REFERENCES public.organizations(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    client_id TEXT REFERENCES public.clients(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'nouvelle' CHECK (status IN ('nouvelle', 'en_traitement', 'convertie', 'rejetee')),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal_fcfa NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


--------------------------------------------------------------------------------
-- MIGRATION: Supabase Auth & Row Level Security
--------------------------------------------------------------------------------
-- Additive & idempotent — safe to re-run. Links the app's own `profiles` /
-- `superadmins` tables to real Supabase Auth identities (auth.users) and locks
-- every table down with RLS scoped by organization, so the public/anon key can
-- no longer read or write another organization's data. Two areas are
-- intentionally kept open to the `anon` role: the public catalogue storefront
-- (app/catalogue/[orgId]) needs to read a Pro organization's active products
-- and create leads/orders anonymously — see section 6 below.
--
-- Prerequisite (one-time, in the Supabase Dashboard, cannot be done via SQL):
--   Authentication -> Providers -> make sure Email is enabled.
--   Authentication -> Settings -> disable "Confirm email" (keeps the current
--   UX where a Super-Admin-created org admin, or a free-trial sign-up, can
--   log in immediately without checking an inbox).

ALTER TABLE public.profiles ALTER COLUMN password DROP NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.superadmins ALTER COLUMN password DROP NOT NULL;
ALTER TABLE public.superadmins ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Helper functions used by the policies below (SECURITY DEFINER so they can
-- read profiles/superadmins regardless of the calling user's own RLS grants).
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS TEXT LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT organization_id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.superadmins WHERE auth_user_id = auth.uid());
$$;

-- 1) Tables scoped directly by their own organization_id column.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients','products','quotes','bats','purchase_orders','invoices',
    'delivery_notes','taxes','machines','partners','paper_formats',
    'audit_logs','online_orders'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "org_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "org_select" ON public.%I FOR SELECT TO authenticated USING (organization_id = public.current_org_id() OR public.is_superadmin())', t);
    EXECUTE format('CREATE POLICY "org_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (organization_id = public.current_org_id() OR public.is_superadmin())', t);
    EXECUTE format('CREATE POLICY "org_update" ON public.%I FOR UPDATE TO authenticated USING (organization_id = public.current_org_id() OR public.is_superadmin()) WITH CHECK (organization_id = public.current_org_id() OR public.is_superadmin())', t);
    EXECUTE format('CREATE POLICY "org_delete" ON public.%I FOR DELETE TO authenticated USING (organization_id = public.current_org_id() OR public.is_superadmin())', t);
  END LOOP;
END $$;

-- 2) Tables scoped through a parent table's organization_id (no own column).
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT * FROM (VALUES
    ('product_price_tiers', 'products', 'product_id'),
    ('quote_items', 'quotes', 'quote_id'),
    ('bat_versions', 'bats', 'bat_id'),
    ('purchase_order_items', 'purchase_orders', 'purchase_order_id'),
    ('invoice_items', 'invoices', 'invoice_id'),
    ('payments', 'invoices', 'invoice_id'),
    ('delivery_note_items', 'delivery_notes', 'delivery_note_id')
  ) AS x(child_table, parent_table, fk_column)
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_select" ON public.%I', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_insert" ON public.%I', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_update" ON public.%I', rec.child_table);
    EXECUTE format('DROP POLICY IF EXISTS "org_delete" ON public.%I', rec.child_table);
    EXECUTE format(
      'CREATE POLICY "org_select" ON public.%1$I FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_insert" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_update" ON public.%1$I FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin()))) WITH CHECK (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
    EXECUTE format(
      'CREATE POLICY "org_delete" ON public.%1$I FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.%2$I parent WHERE parent.id = %1$I.%3$I AND (parent.organization_id = public.current_org_id() OR public.is_superadmin())))',
      rec.child_table, rec.parent_table, rec.fk_column
    );
  END LOOP;
END $$;

-- 3) organizations: scoped by its own id (not organization_id), plus a
--    relaxed INSERT for self-serve trial sign-ups (a brand-new authenticated
--    user has no profiles row yet, so current_org_id() is still NULL for them).
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "org_select" ON public.organizations;
DROP POLICY IF EXISTS "org_insert" ON public.organizations;
DROP POLICY IF EXISTS "org_update" ON public.organizations;
DROP POLICY IF EXISTS "org_delete" ON public.organizations;
CREATE POLICY "org_select" ON public.organizations FOR SELECT TO authenticated
  USING (id = public.current_org_id() OR public.is_superadmin());
CREATE POLICY "org_insert" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin() OR auth.uid() IS NOT NULL);
CREATE POLICY "org_update" ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id() OR public.is_superadmin())
  WITH CHECK (id = public.current_org_id() OR public.is_superadmin());
CREATE POLICY "org_delete" ON public.organizations FOR DELETE TO authenticated
  USING (public.is_superadmin());

-- 4) profiles: colleagues within the same org can see each other; a user can
--    always create/see their OWN profile row even before it's linked to an
--    org (self-serve sign-up), or when a Super Admin provisions it for them.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (organization_id = public.current_org_id() OR auth_user_id = auth.uid() OR public.is_superadmin());
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth_user_id = auth.uid() OR organization_id = public.current_org_id() OR public.is_superadmin());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated
  USING (organization_id = public.current_org_id() OR auth_user_id = auth.uid() OR public.is_superadmin())
  WITH CHECK (organization_id = public.current_org_id() OR auth_user_id = auth.uid() OR public.is_superadmin());
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated
  USING (organization_id = public.current_org_id() OR public.is_superadmin());

-- 5) superadmins: only existing Super Admins can see/manage the list. The
--    very first Super Admin is seeded directly below (section 7) — that
--    bypasses RLS since it runs as SQL in the editor, not through the client API.
ALTER TABLE public.superadmins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "superadmins_select" ON public.superadmins;
DROP POLICY IF EXISTS "superadmins_insert" ON public.superadmins;
CREATE POLICY "superadmins_select" ON public.superadmins FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid() OR public.is_superadmin());
CREATE POLICY "superadmins_insert" ON public.superadmins FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin());

-- 6) Public catalogue (Formule Pro storefront) — anonymous visitors only ever
--    read active products of a Pro/active/catalogue-enabled organization, and
--    can only INSERT (never read back) a lead client + an online order.
DROP POLICY IF EXISTS "anon_read_pro_orgs" ON public.organizations;
CREATE POLICY "anon_read_pro_orgs" ON public.organizations FOR SELECT TO anon
  USING (subscription_plan_id = 'plan-pro' AND is_active = true AND catalogue_enabled = true);

DROP POLICY IF EXISTS "anon_read_products" ON public.products;
CREATE POLICY "anon_read_products" ON public.products FOR SELECT TO anon
  USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM public.organizations o
      WHERE o.id = products.organization_id
        AND o.subscription_plan_id = 'plan-pro' AND o.is_active = true AND o.catalogue_enabled = true
    )
  );

DROP POLICY IF EXISTS "anon_read_price_tiers" ON public.product_price_tiers;
CREATE POLICY "anon_read_price_tiers" ON public.product_price_tiers FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.products pr
      JOIN public.organizations o ON o.id = pr.organization_id
      WHERE pr.id = product_price_tiers.product_id
        AND pr.is_active = true AND o.subscription_plan_id = 'plan-pro' AND o.is_active = true AND o.catalogue_enabled = true
    )
  );

DROP POLICY IF EXISTS "anon_insert_clients" ON public.clients;
CREATE POLICY "anon_insert_clients" ON public.clients FOR INSERT TO anon
  WITH CHECK (source = 'catalogue_public');

DROP POLICY IF EXISTS "anon_insert_online_orders" ON public.online_orders;
CREATE POLICY "anon_insert_online_orders" ON public.online_orders FOR INSERT TO anon
  WITH CHECK (true);

-- 7) Demo accounts: DO NOT insert directly into auth.users.
--    An earlier version of this script did that (crypt() + a raw INSERT) and
--    it silently produced malformed rows on this project — GoTrue returned
--    `500 Database error querying schema` on sign-in for exactly those accounts
--    (confirmed: a nonexistent email correctly gets a clean 400, so this is not
--    a project-wide outage, just those specific rows), most likely because a
--    matching auth.identities row is also required and its exact shape isn't
--    stable across Supabase/GoTrue versions to script safely.
--
--    If you already ran the old version of this file, clean up first:
--      DELETE FROM auth.users WHERE email IN (
--        'fatou.diop@sudprint.sn','amadou.sow@sudprint.sn','moustapha.ndiaye@sudprint.sn',
--        'ousmane.keita@sahelgraphique.ml','mariam.diallo@sahelgraphique.ml','superadmin@printflow.io'
--      );
--    (safe: profiles.auth_user_id / superadmins.auth_user_id are ON DELETE SET NULL)
--
--    Then create each demo account the supported way: Dashboard -> Authentication
--    -> Users -> Add User (same email/password as below, "Auto Confirm User" on),
--    copy the generated UUID, and run:
--      UPDATE public.profiles SET auth_user_id = '<uuid>' WHERE email = '<email>';
--      -- or, for the Super Admin account:
--      UPDATE public.superadmins SET auth_user_id = '<uuid>' WHERE email = '<email>';
--
--    Demo accounts to (re)create this way:
--      fatou.diop@sudprint.sn / sudprint2026            (admin, Sud Print)
--      amadou.sow@sudprint.sn / sudprint2026             (commercial, Sud Print)
--      moustapha.ndiaye@sudprint.sn / sudprint2026        (chef_atelier, Sud Print)
--      ousmane.keita@sahelgraphique.ml / sahel2026        (admin, Sahel Graphique)
--      mariam.diallo@sahelgraphique.ml / sahel2026        (commercial, Sahel Graphique)
--      superadmin@printflow.io / RootAccess#2026          (Super Admin)
--
--    New accounts created going forward through the app itself (free trial
--    sign-up, Super Admin creating an org, an admin adding a colleague) all go
--    through supabase.auth.signUp()/the Admin-safe helper in lib/state/store.ts
--    — never raw SQL — so they don't hit this issue.
