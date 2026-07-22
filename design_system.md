# Print_Flow — Design System & UI Guidelines

Ce document décrit les spécifications de design, de composants, d'interactions, d'animations, d'espacements et de thèmes à respecter pour le développement de toutes les pages de **Print_Flow**. Ce système garantit une cohérence esthétique et ergonomique de classe mondiale (SaaS de production premium).

---

## 1. Palette Chromatique & Variables de Thème

Les couleurs de l'application sont gérées via des variables CSS natives reliées au thème Tailwind CSS v4. Elles s'inversent automatiquement lors du basculement en mode nuit (Midnight Blue).

| Élément | Mode Clair | Mode Nuit (Midnight Blue) | Variable Tailwind / Variable CSS |
| :--- | :--- | :--- | :--- |
| **Couleur Primaire** | `#00B060` (Vert émeraude) | `#00B060` (Vert émeraude) | `var(--color-brand-primary)` |
| **Fond Général** | `#F8F9FA` (Gris ultra-clair) | `#090D16` (Bleu nuit profond) | `var(--color-bg-base)` / `--background` |
| **Surfaces / Cartes** | `#FFFFFF` (Blanc pur) | `#101726` (Midnight soft) | `var(--color-bg-card)` / `--bg-card-color` |
| **Texte Principal** | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | `var(--color-text-main)` / `--foreground` |
| **Texte Secondaire** | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | `var(--color-text-secondary)` / `--text-secondary-color` |
| **Bordures / Séparateurs**| `#E2E8F0` (Slate 200) | `#1E293B` (Slate 800) | `var(--color-border-subtle)` / `--border-color` |
| **Fonds de Saisie (Inputs)**| `#F8F9FA` | `#1A2333` | `var(--color-input-bg)` / `--input-bg-color` |

---

## 2. Règle d'Agencement & Grilles (Layout, Spacing)

### A. Espacement & Dimensions (Spacing)
- **Marges de Contenu** : Les pages intègrent un espace extérieur de `px-6 py-6` ou `space-y-6` entre les sections.
- **Grille des KPIs** : Grille adaptative de 4 colonnes (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5`).
- **Gaps** : Utiliser exclusivement `gap-5` (1.25rem) pour les KPIs et `gap-6` (1.5rem) pour les grands conteneurs de page.
- **Paddings de Cartes** : Toutes les cartes majeures appliquent un padding uniforme de `p-6` (1.5rem).
- **Entêtes de Tableaux** : Les marges intérieures des tableaux doivent respecter `px-6 py-4` pour les entêtes et cellules.

### B. Navigation & Sidebar (Responsive & Collapsible)
- **Sidebar Mobile & Desktop** :
  - **Sur Mobile / Tablette (Écran < 768px)** : La barre latérale est forcée en mode réduit (`w-20`), masquant l'entièreté des textes pour n'afficher que les icônes centrées.
  - **Sur Desktop (Écran >= 768px)** : La barre s'ouvre à `w-64` ou se replie à `w-20` selon l'état `isSidebarCollapsed` du store.
  - Transition : Transition CSS fluide de 300ms sur la largeur (`transition-all duration-300`).
- **En-tête (Header) Épuré** :
  - Affiche uniquement le titre de l'onglet courant (ex: *Clients*, *Devis & BAT*). Pas de fil d'Ariane ni de flèches historiques.
  - Intègre l'horloge dynamique et la date du jour rafraîchies chaque seconde (`Dimanche 19 juillet • 17:50:22`).
  - Intègre le sélecteur de mode sombre/clair et le bouton de pliage de la sidebar.

---

## 3. Typographie (Typography)

- **Police principale (Fonts)** : Pile de polices système sans-serif locale pour garantir une compilation réussie hors-ligne :
  `font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;`
- **Titres de Page** : `text-2xl font-bold tracking-tight text-text-main` (taille 1.5rem, graisse 700).
- **Titres de Cartes / Sections** : `text-base font-bold text-text-main` (taille 1rem, graisse 700).
- **Valeurs Numériques / Métriques** : `text-2xl font-bold text-text-main tracking-tight` (taille 1.5rem).
- **Libellés de Listes** : `text-sm font-semibold text-text-secondary uppercase tracking-wider` (taille 0.875rem).

---

## 4. Effets Visuels & Interactions (Effects)

- **Effet de Navigation « Limelight » (Sidebar)** :
  - L'onglet de navigation actif présente une fine barre verticale verte émeraude (`w-1.5 h-6 bg-brand-primary rounded-full absolute left-0`) avec une ombre lumineuse verte (`shadow-[0_0_10px_rgba(0,176,96,0.8)]`).
  - Le fond de l'onglet actif est mis en valeur par un vert émeraude translucide (`bg-brand-primary/10 text-brand-primary`).
  - Les onglets inactifs se colorent subtilement au survol (`hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-text-main`).
- **Effet de Lumière Spatiale sur les Cartes KPIs** :
  - Au survol du curseur, les cartes de statistiques changent de couleur de fond et s'entourent d'un liseré vert tout en projetant un halo lumineux vert translucide :
    `hover:bg-emerald-50/10 dark:hover:bg-emerald-950/5 hover:border-brand-primary/40 dark:hover:border-brand-primary/30 hover:shadow-[0_0_20px_rgba(0,176,96,0.06)] dark:hover:shadow-[0_0_25px_rgba(0,176,96,0.12)]`
- **Ombres de Base (Shadows)** :
  - Cartes et panneaux standards : `shadow-premium`
  - Survol de cartes et graphiques : `shadow-premium-lg`

---

## 5. Animations & États de Chargement (Animations)

- **Effet de Chargement « Scale Loading » de Composant** :
  - Ne jamais utiliser d'overlays opaques avec des icônes de chargement rotatives génériques sur toute la page.
  - À la place, afficher un squelette de chargement (skeleton loader) qui mime la forme du composant final et animent leur mise à l'échelle en pulsation :
    - **Classe CSS** : `animate-scale-pulse` (pulse d'opacité combiné à une variation d'échelle de `0.97` à `1.0`).
- **Transitions Uniformes** :
  - Les modifications d'états (boutons, liens, transitions de thèmes) doivent utiliser les classes de transitions Tailwind : `transition-all duration-300` ou `transition duration-200`.

---

## 6. Composants Structuraux Clés

- **Tableaux (Recent Transactions Responsives)** :
  - Ne pas inclure de colonne d'action générique (Action / Détails) pour épurer la table.
  - **Responsivité Mobile** : Le tableau doit être enveloppé dans un conteneur horizontalement défilable (`overflow-x-auto`).
  - **Maintien des Colonnes (Nowrap)** : Les cellules et entêtes appliquent la classe `whitespace-nowrap` pour éviter des retours à la ligne disgracieux et préserver l'alignement sur petit écran.
  - En-tête : `bg-slate-50 dark:bg-slate-800/40 border-b border-border-subtle text-text-secondary text-xs font-semibold uppercase tracking-wider whitespace-nowrap`.
  - Lignes de tableau : `divide-y divide-slate-100 dark:divide-slate-800/40`.
- **Champs de Saisie & Dropdowns** :
  - Doivent utiliser des coins généreux (`rounded-xl` ou `rounded-2xl`).
- **Boutons & Onglets** :
  - Utiliser des profils arrondis complets (`rounded-full`).
