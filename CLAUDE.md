# Pangolog

Personal expense tracker PWA. See `.docs/spec.md` and `.docs/plan.md` for full details.

## Tech Stack
- Next.js, Tailwind, HeroUI (UI library), Biome (linting)
- Zustand (global state), TanStack Query (data layer), IndexedDB (persistence)
- Google Drive (optional cloud sync), Vercel (deployment)

## Architecture
- TanStack Query = source of truth for UI
- IndexedDB = local cache/persistence
- Google Drive = remote backup (optional)
- Amounts stored as minor units (integers), e.g. 100 = $1.00 or 100 VND
- Soft deletes via `deletedAt`, purged after 30 days

## Key Concepts
- **Small Dimes**: daily transactions, queried/stored by month (`2026-02.json`)
- **Big Bucks**: large/irregular transactions, queried/stored by year (`2026-bucks.json`)
- `dimes` and `bucks` are intentionally separated tables, despite similarity.

## Routes
- `/` — landing page (new users) or redirect to `/log` (returning users)
- `/log` — transaction view
- `/categories` — category management
- `/summary` — pie charts
- `/settings` — currency, sync config

## Data Model
4 IndexedDB stores: `dimes`, `bucks`, `categories`, `recurring-rules`
- Global UI state in localStorage (theme, sync status, view toggles)
- Synced settings in localStorage (currency symbol, prefix/suffix)

## Conventions
- Biome for linting/formatting
- Monospace-heavy minimalist design
- No hard deletes — always soft delete with `deletedAt`
- Currency is cosmetic only (user-set string, no conversion logic)

## Convention
- Use 4 space indentation
- Use only `yarn`
- Use `camelCase` for hooks and `PascalCase` for components
- Use the term `Dialog` instead of `Modal`

## Current Progress
- Phase 1a (basic setup): done
- Phase 1b (route structure): done
- Phase 1c (IndexedDB): done
- Phase 1d (main layout + navbar): done
