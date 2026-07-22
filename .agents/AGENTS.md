# Print_Flow Project Guidelines & Agent Rules

All development within the Print_Flow workspace MUST adhere strictly to the established design system and coding rules.

## Design System Enforcement
- **Color Palette & Theme**: Map element backgrounds, texts, borders, and inputs to the semantic Tailwind CSS v4 variables: `bg-bg-base`, `bg-bg-card`, `text-text-main`, `text-text-secondary`, `border-border-subtle`, `bg-input-bg`. These CSS variables support dark/light theme switching natively (Midnight Blue).
- **Midnight Blue Dark theme**:
  - Base Background: `#090D16`
  - Card Surface: `#101726`
  - Border Lines: `#1E293B`
- **Font Stack**: Do not import remote fonts (e.g., Google Fonts) to avoid compilation network errors. Use the local system-ui sans-serif font stack.
- **Corner Radii**:
  - KPI cards & main content panels: `rounded-3xl`
  - Inputs, search boxes & select dropdowns: `rounded-xl` or `rounded-2xl`
  - Main action buttons, tab segments & status tags: `rounded-full`
- **Layout Consistency**:
  - **Header**: Keep headers clean. Show ONLY the active tab title. No breadcrumb hierarchies or navigation arrows.
  - **Collapsible Sidebar**: Handle the collapsible sidebar states responsive styling dynamically based on the state `isSidebarCollapsed` in the Zustand store. When collapsed, hide text labels and headers, keep only icons centered.
  - **Dashboard Layout**: Keep the dashboard layout simple and linear; KPI cards grid at the top, full-width SVG chart in the middle, and full-width transactions table at the bottom.

## Component Interactions & States
- **Component Scale Loading**: Never use screen blockers or spinner overlays on dashboard cards or tables. Use realistic pulse-scale skeleton components that mimic the target structure (e.g., bar grids for charts, pulsing rows for tables) with the class `animate-scale-pulse`.
- **Figures Confidentiality**: Implement hide/show anonymization toggle (`hideFigures`) on all pages showing monetary values. If active, replace numbers with `••••••`.
- **Greeting System**: Greet the user dynamically based on the hour of the day with confidence, referencing their full name.

## Effects & Animations
- **Sidebar Limelight Effect**: Active sidebar navigation links must display a vertical green accent line (`w-1.5 h-6 bg-brand-primary absolute left-0` with `shadow-[0_0_10px_rgba(0,176,96,0.8)]`) and apply a translucent primary background (`bg-brand-primary/10 text-brand-primary`). Inactive links hover states must apply a soft dark background (`hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-text-main`).
- **KPI Card Hover Glow**: KPI statistic cards must project a soft radial glow and change borders/backgrounds on pointer/hover interaction:
  `hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)]`
- **Tables action column**: Do not include action/details button columns in preview lists or home tables. Keep columns clean (Reference, Client, Status, Actor, Amount).

## Mobile & Responsive Guidelines
- **Forced Sidebar Mobile Collapse**: Below the `md` (768px) breakpoint, the Sidebar layout MUST always collapse to `w-20` and hide text labels/headers, displaying only icons centered in the sidebar container.
- **Table Responsiveness**: Tables must be wrapped in `overflow-x-auto` to allow horizontal scrolling on small screens. Table headers and cell columns MUST use `whitespace-nowrap` to prevent text-wrapping layout bugs.

## Project Stack & Conventions
- **Multi-Tenant SaaS**: All domain queries/components must respect the organization boundary (`currentOrgId`).
