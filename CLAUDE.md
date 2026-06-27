# CLAUDE.md — figmaprojects (Project Progress Tracker)

A React 18 + TypeScript SPA built with Vite, originally scaffolded from Figma Make. This is a **Project Intelligence Workspace** — a project management system for NGOs and civil society organizations, tracking projects, activities, indicators, risks, documents, and AI-generated reports.

**Figma source:** https://www.figma.com/design/ZolD6mEBLco3eQRAp42IT2/Project-Progress-Tracker

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (peer dep) + TypeScript |
| Build | Vite 6 + `@tailwindcss/vite` + `@vitejs/plugin-react` |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI (full suite) + shadcn/ui conventions |
| Icons | Lucide React + MUI icons |
| Routing | react-router v7 |
| Animation | Motion (Framer Motion v12) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Payments | Stripe (via Supabase Edge Functions) |
| Package manager | **pnpm** (never npm or yarn) |
| Deployment | Vercel |

## Development Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Production build (output: dist/)
pnpm build
```

### Environment Variables

Copy `.env.example` to `.env`:

```
VITE_SUPABASE_URL=https://jorpfsrvhnelnboupiyx.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Both variables are required — the app will fail to initialize without them.

## Source Structure

```
src/
├── main.tsx                        # Entry point — mounts App into #root
├── app/
│   ├── App.tsx                     # Root: ErrorBoundary + AuthProvider + BrowserRouter + Routes
│   └── components/
│       ├── FilterBar.tsx           # Reusable filter/search bar
│       ├── ProjectCard.tsx         # Project card for list/dashboard views
│       ├── ProjectOverview.tsx     # Project detail overview panel
│       ├── StatsCards.tsx          # Summary stat cards
│       ├── figma/                  # Auto-generated Figma Make components (do not hand-edit)
│       └── ui/                     # shadcn/ui primitive wrappers
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # Main layout shell (sidebar + <Outlet />)
│   │   └── Sidebar.tsx             # Navigation sidebar
│   ├── projects/                   # Project-specific shared components
│   └── UpgradeModal.tsx            # Billing upgrade modal
├── contexts/
│   └── AuthContext.tsx             # Supabase auth session context + useAuth() hook
├── lib/
│   ├── supabase.ts                 # Typed Supabase client (uses Database from types.ts)
│   ├── types.ts                    # TypeScript interfaces for all DB tables
│   ├── stripe.ts                   # Stripe integration helpers
│   └── utils.ts                    # cn() helper (clsx + tailwind-merge)
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Projects.tsx
│   ├── ProjectDetail.tsx
│   ├── Activities.tsx
│   ├── Indicators.tsx
│   ├── Risks.tsx
│   ├── Documents.tsx
│   ├── AIAgents.tsx
│   ├── Outputs.tsx
│   ├── CivilSocietyOS.tsx
│   └── Billing.tsx
├── styles/
└── imports/
```

## Routing

All routes under `/` require authentication — unauthenticated users are redirected to `/login`.

```
/login                        → Login (redirects to /dashboard if already authenticated)
/                             → redirect to /dashboard
/dashboard                    → Dashboard
/projects                     → Projects list
/projects/:id                 → ProjectDetail
  /projects/:id/activities    → Activities
  /projects/:id/indicators    → Indicators
  /projects/:id/risks         → Risks
  /projects/:id/documents     → Documents
  /projects/:id/agents        → AIAgents
  /projects/:id/outputs       → Outputs
/civil-society                → CivilSocietyOS
/billing                      → Billing
*                             → redirect to /dashboard
```

`ProjectDetail` uses a nested route — child pages render via `<Outlet />` inside it.

## Authentication

- Handled entirely by Supabase Auth
- `AuthContext.tsx` wraps the entire app and exposes `{ session, loading }` via `useAuth()`
- `ProtectedRoute` in `App.tsx` gates all non-login routes; shows a loading spinner while auth state resolves
- All Supabase queries use `src/lib/supabase.ts` — a typed client created with `createClient<Database>`
- Never access `supabase.auth` directly in page components — use `useAuth()` instead

## Database Schema (Supabase PostgreSQL)

All tables have Row Level Security enabled. Projects are scoped to `created_by = auth.uid()`. All sub-tables (activities, indicators, risks, etc.) inherit access by checking that their `project_id` belongs to a project owned by the current user.

| Table | Purpose |
|---|---|
| `clients` | Donor/client organizations |
| `projects` | Core entity — name, status, budget, donor, dates, grant reference |
| `activities` | Project tasks with status (`planned`/`in_progress`/`completed`) and dates |
| `deliverables` | Outputs linked to activities |
| `indicators` | M&E metrics — baseline, target, actual values |
| `risks` | Risk register — likelihood, impact, risk level, mitigation strategy |
| `project_documents` | File metadata (actual files stored in `documents` storage bucket) |
| `reports` | Generated narrative reports with period dates |
| `ai_agents` | Agent registry — read-only for authenticated users, seeded by migration |
| `prompt_modules` | Versioned prompt templates per agent |
| `agent_runs` | Execution log — input/output JSON, status (`pending`/`running`/`completed`/`failed`) |

### Migrations

Located in `supabase/migrations/`, applied in chronological order:

1. `20260609000001_initial_schema.sql` — all tables, RLS policies, AI agent seed data, `documents` storage bucket
2. `20260609000002_fix_rls_performance_and_indexes.sql` — performance indexes on RLS sub-table queries
3. `20260617000001_profiles.sql` — user profiles table

Never modify existing migration files. Add new migrations with a timestamp prefix: `YYYYMMDDHHMMSS_description.sql`.

## Supabase Edge Functions

Located in `supabase/functions/`. Each is an independent Deno function deployed to the Supabase project:

| Function | Purpose |
|---|---|
| `me-agent` | M&E Intelligence Brief — analyzes indicator progress and activity completion |
| `compliance-agent` | Compliance & Risk Review — donor compliance, document gaps, risk exposure |
| `reporting-agent` | Donor Progress Report — generates formal narrative reports |
| `proposal-agent` | Proposal generation |
| `create-checkout-session` | Creates a Stripe checkout session for subscription purchase |
| `stripe-billing-portal` | Opens Stripe customer portal for subscription management |
| `stripe-webhook` | Handles Stripe webhook events (subscription lifecycle) |

AI agent invocations are tracked in the `agent_runs` table. The frontend triggers them from `AIAgents.tsx` and polls the table for status updates.

## Vite Configuration — Critical Rules

From `vite.config.ts` — these constraints must not be violated:

- **`figma:asset/` imports** resolve to `src/assets/` via a custom plugin. Do not remove or alter the `figmaAssetResolver` plugin.
- **Both `react()` and `tailwindcss()` plugins are required** — never remove either, even if Tailwind appears unused in a feature.
- **`assetsInclude`** covers `.svg` and `.csv` only — never add `.css`, `.tsx`, or `.ts` to this array.
- **`@` path alias** maps to `./src` — use `@/lib/...`, `@/components/...`, etc. throughout the codebase.

## Code Conventions

**Styling:**
- Tailwind utility classes only — no CSS modules, no inline `style` props for layout
- Use `cn()` from `src/lib/utils.ts` for conditional class merging
- The `default_shadcn_theme.css` at repo root documents the design token baseline

**TypeScript:**
- All database entity types are in `src/lib/types.ts` — import from there, never redeclare
- The `Database` interface in `types.ts` is the single source of truth for table shapes
- No `any` — use the typed Supabase client and the types from `types.ts`

**Data access:**
- Always import the Supabase client from `src/lib/supabase.ts`
- Never create a new `createClient()` instance in page/component files

**Package management:**
- Always use `pnpm` — never `npm install` or `yarn`
- pnpm overrides pin Vite to `6.3.5`; do not change this without updating `pnpm-lock.yaml`

**Testing:**
- No test suite currently present — verify changes manually via `pnpm dev`

## Deployment

Vercel config (`vercel.json`):
- Build command: `pnpm build`
- Output directory: `dist/`
- Framework: `vite`
- SPA rewrites: all paths → `index.html` (required for client-side routing)

Pushing to `main` triggers an automatic Vercel deployment.
