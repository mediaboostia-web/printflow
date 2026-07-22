# Print_Flow

Print_Flow is a production & billing management app for print shops (imprimeries) operating in West Africa (FCFA currency, French UI). It covers the full order lifecycle: client management → quote (devis) → proof approval (BAT) → production order → delivery → invoicing & payments, plus a lightweight Super Admin plane for the SaaS operator.

This document is a reference snapshot of the app as it stands: what it does, how it's built, and the decisions behind it. Update it when the architecture or feature set changes meaningfully — it is not auto-generated.

## Status: real Supabase backend (Auth + RLS), Zustand as a write-through cache

**Authentication and data isolation are real**, backed by Supabase Auth + Postgres Row Level Security (see `supabase_schema.sql`'s "MIGRATION: Supabase Auth & Row Level Security" section — must be run once in the Supabase SQL Editor). Zustand (`lib/state/store.ts`) still holds the live working set in memory (seeded from `lib/mock/data.ts` on boot, then overwritten by `loadSupabaseData()` once the org's real rows are fetched), and every mutating action does an optimistic local `set()` **plus** a `supabase.from(...)` call — so it behaves like a write-through cache in front of Postgres, not a mock. Session state itself, though, is no longer just a `localStorage` flag: it's a real Supabase Auth session (cookie-based, via `@supabase/ssr`), independently re-verified server-side by `proxy.ts` on every request to a protected path and client-side by `checkSession()` on mount. The domain types in `types/domain.ts` mirror the Postgres schema (snake_case-free camelCase TS, explicit `organizationId` on every row).

## Tech stack

- **Next.js 16 (App Router, Turbopack)** — see `AGENTS.md` at the repo root: this is a newer Next.js than typical training data, check `node_modules/next/dist/docs/` before assuming an API.
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (CSS-variable-based theme, see `app/globals.css`)
- **Zustand 5** (`lib/state/store.ts`) with the `persist` middleware for session state
- **lucide-react** for icons, **recharts** for the dashboard chart
- **jspdf** + **html2canvas** for client-side PDF export (see "Print / preview / download" below)
- No UI kit (shadcn/Radix/etc.) — every control (dropdown, modal, toast) is hand-built in `components/ui` and page files to match the custom "Tech-Luxe" design system.
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — Postgres database, Auth (email/password), and Row Level Security. `lib/supabaseClient.ts` exports a browser client (`createBrowserClient`, cookie-backed session) used throughout the app; `proxy.ts` builds its own server-side client per request via `createServerClient`. No ORM — every query is a direct `supabase.from(...)` call.

## Directory structure

```
app/
  page.tsx                 Root: client-side router based on session state (→ /login, /super-admin, or /dashboard)
  layout.tsx                Root HTML shell, metadata
  login/page.tsx             Org user login (email/password against mockCredentials)
  super-admin/
    login/page.tsx           Super Admin login (separate credential, separate branding)
    page.tsx                 Super Admin landing (protected, minimal — see Known gaps)
  (app)/                     Route group for the authenticated org-user shell
    layout.tsx                Sidebar + Header shell, auth guard, theme sync, .app-shell* print markers
    dashboard/page.tsx        KPI cards, trend chart, recent activity table
    clients/page.tsx          Client directory CRUD
    catalogue/page.tsx        Product/service catalogue CRUD, image upload (5 Mo max), formats
    devis/page.tsx            Quotes: list, create, edit (pending only), accept/refuse, A4 preview/print/download, client sub-tab
    bat/page.tsx               BAT (proof) upload — .ZIP only, up to 500 Mo — versioning, validate/refuse workflow
    commandes/page.tsx        Production orders (Bons de Commande): create from a validated quote, BAT lock check, deposit (acompte) tracking, fiche print/download (never shows the assigned machine — kept confidential from the client copy)
    livraisons/page.tsx       Delivery notes: created from finished production orders, triggers invoice generation
    factures/page.tsx         Invoices: list, A4 preview/print/download, record payments
    parametres/page.tsx       Org settings: taxes, machines, partners, paper formats, org profile (admin-only)
    aide/page.tsx              Static help/FAQ content
    commandes-en-ligne/page.tsx  Public catalogue orders inbox (Formule Pro gated — see "Public catalogue" below)
    historique/page.tsx        Devis/BAT/factures/paiements timeline, sourced from auditLogs (Formule Pro gated)
  catalogue/[orgId]/page.tsx  Public, unauthenticated storefront (Formule Pro gated) — NOT inside (app), no sidebar/auth
proxy.ts                       Next 16's middleware — real server-side auth guard (see "Authentication" below)
components/
  layout/Sidebar.tsx          Role-filtered nav, collapsible
  layout/Header.tsx           Active tab title, theme toggle, profile popover, logout (icon-only on mobile, full popover ≥ sm)
  ui/Dropdown.tsx             The single reusable dropdown used everywhere instead of native <select>
lib/
  state/store.ts              Zustand store: session/auth + all domain CRUD, dual-written to Supabase
  mock/data.ts                Seed data: organizations, profiles, clients, products (client-side fallback until loadSupabaseData() runs)
  supabaseClient.ts            Browser Supabase client (createBrowserClient, cookie-backed session)
  utils/money.ts              FCFA formatting helpers
  utils/pdf.ts                downloadElementAsPdf() — client-side PDF export (html2canvas + jsPDF)
types/domain.ts               All domain entity types (Organization, Profile, Client, Product, Quote, BAT, PurchaseOrder, Invoice, Payment, DeliveryNote, AuditLog, OnlineOrder)
supabase_schema.sql            Single copy-pasteable script: bootstrap tables + seed data + RLS policies + Supabase Auth linkage — see "Authentication" below
```

## Multi-tenancy & roles

Every domain row carries `organizationId`; all reads/writes in the store and pages filter by `currentOrgId`. Three org-level roles exist on `Profile.role`:

- **admin** — full access, including `parametres` (org settings) and `factures`.
- **commercial** — everything except org settings.
- **chef_atelier** (workshop lead) — blocked from `factures` and `parametres` (explicit "Accès Refusé" screens); otherwise sees the same production-facing pages.

`components/layout/Sidebar.tsx` filters nav items by role; page components additionally self-guard (defense in depth, since a URL can be typed directly).

A separate **Super Admin** plane (`/super-admin/*`) sits outside the org tenancy model entirely — one hardcoded operator account, not tied to any `organizationId`, meant for the SaaS operator rather than imprimerie staff.

## Authentication (real Supabase Auth + RLS)

- `profiles`/`superadmins` rows carry an `auth_user_id` column linking them to a real `auth.users` identity — the old plaintext `password` column is deprecated (kept nullable for backward compat, no longer read or written for login).
- `login(email, password)` / `superAdminLogin(...)` call `supabase.auth.signInWithPassword`, then resolve the matching `profiles`/`superadmins` row by `auth_user_id` (falling back to a direct Supabase query if the local Zustand list hasn't been populated by `loadSupabaseData()` yet). Both are `async` and return `Promise<{success, error?}>`.
- `logout()` flips local state immediately and fires `supabase.auth.signOut()`.
- `checkSession()` re-verifies the real Supabase session on mount (`app/(app)/layout.tsx`, `app/super-admin/page.tsx`) — the persisted `isAuthenticated` Zustand flag is a UX convenience (avoids a loading flash), never the source of truth.
- **`proxy.ts`** (Next 16's renamed `middleware.ts`) is the actual security boundary: it reads the Supabase session cookie server-side via `@supabase/ssr`'s `createServerClient` and redirects to `/login` or `/super-admin/login` *before* any protected page/bundle is served. `/catalogue/[orgId]` (the public storefront) is deliberately excluded from its protected-path list.
- **Creating a user for someone else** (`addOrganizationWithAdmin`, `addProfile`, `addSuperAdmin` — an already-logged-in admin/superadmin provisioning another person's account) uses `createAuthUserPreservingSession()` in `lib/state/store.ts`: it snapshots the caller's own session, calls `supabase.auth.signUp` (which would otherwise hijack the active session to the new user), then restores the caller's session. This avoids needing the `service_role` key (only the anon key is configured — see `.env.local`).
- **RLS**: every table is scoped by `organization_id` (via `public.current_org_id()`, a `SECURITY DEFINER` function reading `profiles.auth_user_id = auth.uid()`) or by `public.is_superadmin()`. The public catalogue is the one deliberate exception — `anon`-role policies allow reading a Pro/active/catalogue-enabled org's products and inserting a lead `client`/`online_order`, nothing else.
- The `/login` page's "Comptes de démonstration" panel still autofills the original demo emails/passwords, but the matching `auth.users` accounts are **not** created by the SQL script — a raw `auth.users` INSERT was tried once and produced rows GoTrue couldn't sign in (`500 Database error querying schema`; confirmed project-specific to those rows, not a general outage — an unknown email still gets a clean `400 invalid_credentials`). Create each demo account via Dashboard → Authentication → Users → Add User instead, then link it with `UPDATE public.profiles/superadmins SET auth_user_id = '<uuid>' WHERE email = '...'` — see the comment in `supabase_schema.sql` section 7 for the full list and exact commands.

**Known gap**: no self-serve password reset / email verification flow is wired up yet (Supabase Auth supports both — just not built into the UI).

## Core workflow (the part that matters most)

1. **Devis (Quote)** created for a client, optionally flagged `requiresBAT`. Tax is computed once on the quote's subtotal (`vatAmount = subtotal * globalVatRate / 100`) — never per line item, even though each `QuoteItem`/`InvoiceItem` carries a `vatRate` field (that's display/reference metadata only, all items on a document share the same global rate). Status: `en_attente` → `valide`/`refuse`.
2. **BAT (Bon à Tirer / proof)**, if required, must reach `valide` before a production order can be created — enforced as a hard lock (`batLockActive`) in `commandes/page.tsx`. Proof files are uploaded as **.ZIP archives only** (up to 500 Mo); files over ~20 Mo are validated and tracked (name/size) but not read into memory as a downloadable copy, to avoid freezing the tab on huge archives in this no-backend phase.
3. **Commande (Purchase Order / Bon de Production)** is created from a validated quote, assigned a machine, and can carry a partial **deposit (acompte)** amount. Status: `en_attente_production` → `en_cours_impression` → `termine`. The printable "Fiche Commande Client" deliberately omits the assigned machine — that's shop-floor information, not something shown to the client.
4. **Livraison (Delivery Note)**: once a PO is `termine`, it automatically becomes selectable in `livraisons/page.tsx` (filtered live off `po.status === 'termine'`) and disappears again once a delivery note exists for it (`storeDeliveries.some(d => d.purchaseOrderId === po.id)`) — this is the "auto-chain," there's no manual hand-off step.
5. **Facture (Invoice)**: `updateDeliveryStatus` in the store auto-generates an invoice the moment a delivery's status flips to `livre`, copying totals from the linked quote. Payments are then recorded against it in `factures/page.tsx` (`amountPaidFcfa` accumulates; status moves `en_attente_acompte` → `partiellement_payee` → `soldee`).

## Public catalogue & online orders (Formule Pro)

Organizations on `plan-pro` (checked via `canUsePublicCatalogue()` in the store, same shape as `canImportBAT()`) get a public, unauthenticated storefront at `/catalogue/{organizationId}` (`app/catalogue/[orgId]/page.tsx` — a route sibling to the `(app)` group, so it renders with none of the sidebar/header chrome, just the root `app/layout.tsx` shell). An `Organization.catalogueEnabled` boolean (admin toggle, independent of the plan) can switch it off temporarily.

- **Catalogue admin (`catalogue/page.tsx`)**: this is also where the catalogue's `Product` records became real (Supabase-backed via `products`/`product_price_tiers`) instead of the old page-local hardcoded array — `lib/state/store.ts` now owns `products` with `addProduct`/`editProduct`/`deleteProduct`. Every product carries a `materialType` (`papier` | `textile` | `support_rigide` | `autre`) that drives which technical sub-fields the form shows (grammage/paper type, textile material, or rigid-support material/thickness), plus an optional `formatOptions` list (`{ label, extraPriceFcfa }[]`) so a single product can offer several sizes/formats at a price delta from its base `unitPriceFcfa`. Pro orgs see a link/toggle panel at the top of this page; non-Pro orgs see a locked upsell card instead.
- **Public storefront**: fetches via `fetchPublicCatalogue(orgId)` (anonymous Supabase read — returns `org: null` if the org is missing/inactive/not-Pro/catalogue-disabled, without exposing which). Visitors filter by material type, pick a format + quantity per product (price recomputed live off `priceTiers` + the format's `extraPriceFcfa`), build a cart, and submit contact details via `submitPublicOrder(orgId, payload)`.
- **Order intake**: `submitPublicOrder` upserts a `Client` (matched by phone within the org, tagged `source: 'catalogue_public'`) and inserts a row into `online_orders` (`OnlineOrder` type — a lightweight JSONB-items inbox, not a full item sub-table, since it's a staging area) directly in Supabase — it does not touch the visitor's local Zustand state, since they aren't authenticated into any org.
- **Dashboard side**: `commandes-en-ligne/page.tsx` (nav entry in `Sidebar.tsx`, gated the same way — locked upsell view for non-Pro) lists `onlineOrders` for `currentOrgId`, refreshed like everything else via `loadSupabaseData` on `(app)/layout.tsx` mount. Staff can mark an order "en traitement", reject it, or "Convertir en Devis" (`convertOnlineOrderToQuote`, which builds a real `Quote` from the order's items via the normal `addQuote` action and flips the order to `convertie`).
- **RLS**: `organizations`/`products`/`product_price_tiers` each have an extra `anon`-role SELECT policy scoped to `subscription_plan_id = 'plan-pro' AND is_active AND catalogue_enabled`, and `clients`/`online_orders` have `anon`-role INSERT policies — see "Authentication" above. Anonymous visitors can never read another org's data or any non-Pro org's products.

## Print / preview / download

Devis, factures, and the commande "fiche" share one pattern (`factures/page.tsx`, `devis/page.tsx`, `commandes/page.tsx`):

- An on-screen A4-styled preview (`bg-white`, org logo mark, itemized table, totals) rendered inline (factures) or inside a modal (devis, commandes). Spacing is intentionally tight (`py-4`/`py-5`, no forced min-height) so a short document doesn't show a large empty gap and a long one still reads cleanly, one page at a time.
- **"Imprimer"** calls `window.print()`. A `<style>` block with `@media print { ... }` hides everything except the printable element (`#print-invoice-area` / `#print-quote-area` / `#print-fiche-area`) and sets `@page { size: A4; margin: 12mm; }`.
- **"Télécharger"** generates a real PDF client-side via `lib/utils/pdf.ts` (`downloadElementAsPdf`, built on `html2canvas` + `jspdf`): it rasterizes the printable element and paginates the image onto one or more A4 pages, then saves a `.pdf` file directly — no print dialog, no server round-trip, works off the live on-screen DOM node so it isn't affected by the print-clipping issue below.
- Only invoice/quote/order content is ever visible when printing — sidebar, header, nav, and all buttons/inputs are hidden via `body * { visibility: hidden }` plus a `.no-print` class on every chrome element inside the page (title, filters/list column, preview toolbar, modal header/footer for devis/commandes).

### Print clipping gotcha (already fixed — don't reintroduce)

`window.print()` renders the live DOM with print media styles, it does not screenshot the viewport. The printable element is `position: absolute`, but it sits inside the app shell's `h-screen overflow-hidden` / `overflow-y-auto` wrappers (`app/(app)/layout.tsx`) and, for devis/commandes, inside a modal's `max-h-[90vh] overflow-hidden` panel too — and for factures, inside its own two-column page grid (`div.grid.lg:grid-cols-12` → `div.lg:col-span-6`). `overflow: hidden`/`auto` on an ancestor clips its whole painted subtree — including absolutely-positioned descendants whose containing block is further up the tree — even once that ancestor is `visibility: hidden`, because visibility doesn't remove a box from layout/clipping. Left unfixed, printed output renders almost entirely blank with the real content offset down the page (this was a real, shipped bug — twice: once for devis/commandes, later for factures until its own page-grid wrapper got the same treatment).

The fix has three parts, one per printable view's own non-`.app-shell*` ancestor chain:
1. `app/globals.css` carries a global `@media print` rule forcing `position: static; overflow: visible; height: auto; max-height: none;` on three marker classes (`.app-shell`, `.app-shell-col`, `.app-shell-main`) applied to the layout wrappers in `app/(app)/layout.tsx`.
2. `devis/page.tsx` and `commandes/page.tsx` additionally mark their modal wrapper chain with `.print-modal-backdrop` / `.print-modal-panel` / `.print-modal-scroll` and neutralize those the same way inside their own local print `<style>` block (each modal is page-specific, so this lives per-page rather than in `globals.css`).
3. `factures/page.tsx` (the one view rendered inline in the page instead of a modal) marks its own root/grid/column wrappers with `.print-page-root` / `.print-page-grid` / `.print-page-col` and neutralizes those the same way — plus uses `.no-print` (not tag selectors) to hide its list column and preview toolbar, matching the pattern already used by `commandes/page.tsx`.

If a new printable view is ever added inside a scrolling/fixed/grid container, it needs the same treatment (pick a marker-class name, neutralize it locally) or it will silently print blank or offset.

## Design system ("Tech-Luxe")

Full rules live in `.agents/AGENTS.md` (agent-facing) — summarized:

- **Theme**: CSS variables in `app/globals.css`, light + a "Midnight Blue" dark mode (`#090D16` base / `#101726` cards / `#1E293B` borders), toggled via `.dark` class synced from Zustand `theme` state.
- **Brand color**: emerald green (`--color-brand-primary: #00B060`), used for CTAs, active nav state, focus rings.
- **Radii**: `rounded-3xl` for cards/panels, `rounded-xl`/`rounded-2xl` for inputs, `rounded-full` for buttons/tabs/status pills.
- **No native `<select>`** — `components/ui/Dropdown.tsx` is the one dropdown component used everywhere (catalogue, devis, commandes, livraisons, parametres, the profile-edit role picker). It's a generic `Dropdown<T extends string | number>` with a button trigger + absolutely-positioned option list, not a native select, so it can be styled consistently across the app.
- **Loading state**: `animate-scale-pulse` skeletons (never spinner overlays) on cards/tables while data "loads" (simulated with `setTimeout`).
- **Figures anonymization**: `hideFigures` toggle pattern for masking monetary values (see AGENTS.md; applied where relevant).
- Tables: always wrapped in `overflow-x-auto`, headers `whitespace-nowrap`.
- Modals: always `fixed inset-0 ... p-4` backdrop + `w-full max-w-*` panel — this combination is what makes them responsive by default (full width minus 16px gutters on phones, capped width on larger screens).

## Responsive behavior

Sidebar force-collapses to icon-only (`w-20`) below `md`. All grids/tables/modals use responsive Tailwind breakpoints (`sm:`/`md:`/`lg:`); the A4 document previews specifically use `flex-wrap` header rows and `grid-cols-1 sm:grid-cols-2` info blocks so they don't cram two-column layouts into narrow phone widths.

## Known gaps / next steps

- **BAT archives over ~20 Mo aren't downloadable in this phase** — their filename/size is tracked (and the 500 Mo cap is enforced) but the bytes aren't read into memory, so the "Télécharger" action on that version is disabled with an explanatory tooltip instead of offering a broken link. Once real file storage (e.g. Supabase Storage) exists, swap `simulatedFileBase64`/`FileReader` in `bat/page.tsx` for an actual upload.
- Editing a devis after creation is supported only while it's still `en_attente` (pending); accepted/refused quotes are immutable in the UI to avoid retroactively changing something a client already acted on. The BAT-required toggle is likewise locked once a quote exists, to avoid creating duplicate BAT records.
- **No password reset / email verification UI** — Supabase Auth supports both, just not wired into the login/register screens yet.
- `proxy.ts` requires `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` to also be readable inside `next.config.ts`'s `env` block (added there) — in this Next 16.2 + Turbopack combo, plain `process.env.NEXT_PUBLIC_*` reads inside `proxy.ts` were empty at runtime without that explicit `env` passthrough, even though the same vars work fine everywhere else in the app.
