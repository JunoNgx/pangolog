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
- `/` - landing page (new users) or redirect to `/log` (returning users)
- `/log` - transaction view
- `/categories` - category management
- `/summary` - pie charts
- `/settings` - currency, sync config

## Data Model
4 IndexedDB stores: `dimes`, `bucks`, `categories`, `recurring-rules`
- Global UI state in localStorage (theme, sync status, view toggles)
- Synced settings in localStorage (currency symbol, prefix/suffix)

## Conventions
- Biome for linting/formatting
- Monospace-heavy minimalist design
- No hard deletes - always soft delete with `deletedAt`
- Currency is cosmetic only (user-set string, no conversion logic)
- Firefox fallback: `<input type="month">` is unsupported on Firefox desktop; detect with feature check and fall back to dual `<select>` dropdowns (month name + year)

## Maintainer's preferences
- Use 4 space indentation
- Prioritise using guard clause and early termination. Avoid `else` and deeply nested codes.
- Use only `yarn` to manage packages
- Use `camelCase` for hooks and `PascalCase` for components
- Use the term `Dialog` instead of `Modal`
- Complicated handler function, taking up more than one line, should be implemented separately outside of the template.
- Do not use the deprecated `FormEvent` and `React.FormEventHandler`
- Do not use em dash

### Tailwind classes
- Tailwind classes are to be wrapped in literal template, grouping classes into categories:
    - Container (e.g. `w-full`, `max-w-md`)
    - Inner structure (e.g. `flex flex-col`, `p-6 gap-4`)
    - Content style (e.g. `font-sans text-gray-900 dark:text-gray-100`)
    - Visual effects (e.g. `shadow-lg`, `border border-gray-200`, `dark:border-gray-700`)
    - Behaviours (e.g. `hover:shadow-xl`, `transition-shadow duration-300`, `focus-within:ring-2 focus-within:ring-primary-500`)
    - Computed classes
- Do not use pixel-unit classes, e.g. `size-[18px]`

Complete example:
```
const cardClasses = `
    /* CONTAINER */
    w-full max-w-md bg-white dark:bg-gray-800 rounded-xl

    /* INNER STRUCTURE */
    flex flex-col p-6 gap-4

    /* CONTENT STYLES */
    font-sans text-gray-900 dark:text-gray-100

    /* VISUAL EFFECTS */
    shadow-lg border border-gray-200 dark:border-gray-700

    /* BEHAVIOR */
    hover:shadow-xl transition-shadow duration-300 focus-within:ring-2 focus-within:ring-primary-500

    /* COMPUTED CLASSES */
    ${!isActive ? "bg-amber-600" : ""}
    ${!isDisabled ? "text-default-100" : "text-default-400"}
`;

Don't comment on the classes. Just keep one type of classes in its own line. Each computed class should be on its own line.
```

## Deviation from original plan
- `hasUsedBefore` is no longer used and users can freely access route.
- Default starting location will be set in PWA manifest.

## Known behaviours
- Zustand `persist` middleware hydrates asynchronously - on first render, persisted state (e.g. `isSeeded`, `authToken`) is at its default value. Gate logic that depends on persisted state behind `hasHydrated` from `useLocalSettingsStore`.
- React 18 automatic batching defers renders until the event loop yields. After calling a state setter inside an async function, use `await Promise.resolve()` to flush the render before continuing with heavy async work (e.g. Drive API calls).

## Linting behaviour
- This repository has a custom script `yarn efix` to fix linter issues. Run this instead of the usual standard linter script.
- Only run `yarn efix` (or `yarn lint`) on files you have directly modified. Never run it project-wide, as it reformats unrelated files and produces noisy diffs.
- To lint a specific file: `yarn biome check --write --unsafe <file>`

## Current Progress
- Phase 1a (basic setup): done
- Phase 1b (route structure): done
- Phase 1c (IndexedDB): done
- Phase 1d (main layout + navbar): done
- Phase 1e (category view): done
- Phase 2a (drag-and-drop category reordering): done
- Phase 1f (transaction view): done - includes category filter dropdown (Popover, Check/Uncheck all, Uncategorised option)
- Phase 2d (dark/light theme switcher): done
- Phase 1j (mobile responsiveness for navbar): done
- Phase 1k (create transaction and category hotkey): done
- Phase 2e (setup PWA and icons): done
- Phase 2b (summary view): done - segmented bar, no external chart lib; categories < 3% collapsed into "Other"; yearly view has Dimes/Big Bucks toggle
- Phase 2c (settings view): done
- Phase 2f (header and utility panel layout): done
- Phase 3a (OAuth setup): done
- Phase 3b (Drive file structure): done
- Phase 3c (Sync logic): done - includes settings.json sync (customCurrency, isPrefixCurrency)
- Phase 3d (Misc implementations): done
- Phase 3e (Seed data for new users): incomplete
- Phase 1h (toast notifications): done - sonner; deletion undo, Google Drive connection, manual sync success/failure; auto-syncs are silent
- Phase 4a (JSON export/import): done - includes display settings; error reporting deferred
