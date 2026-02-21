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
- `crypto.randomUUID()` requires a secure context (HTTPS). `localhost` qualifies but local network IP over HTTP does not. Use `generateId()` from `src/lib/db/uuid.ts` for all record ID generation.
- After a full DB reset (`clearAllData`), the page must reload to clear the cached `dbPromise` module state, otherwise subsequent DB operations fail.
- `HexColorPicker` from `react-colorful` has a fixed inline `width` (200px) by default. Override with `style={{ width: "100%" }}` to make it fill its container on mobile.
- Next.js re-injects `viewport` metadata (including `themeColor`) into `<head>` on every client-side navigation, overwriting any dynamically-set `<meta name="theme-color">`. Do not define `themeColor` in the `viewport` export if it is managed dynamically (e.g. by `ThemeColorSync` in `providers.tsx`).

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
- Phase 1h (toast notifications): done - sonner; deletion undo, Google Drive connection, manual sync success/failure; auto-syncs are silent; DB mutation errors surface via toast
- Phase 4a (JSON export/import): done - includes display settings; error reporting deferred
- Phase 5a (recurring rules DB layer): done - RecurringRule types, DB v2 with indexes, CRUD functions, hooks
- Phase 5b (recurring route): done - /recurring route, placeholder client, navbar entry with Repeat icon
- Phase 5c (recurring runner): done - useRecurringRunner hook, RecurringRulesManager component mounted in layout; monthly/yearly dayOfMonth is clamped to last day of month to handle short months (e.g. 31st in April)
- Phase 5d (recurring UI): done - RecurringList, RecurringRuleDialog, RecurringClient with sort/filter controls; CategoryPicker extracted as shared component
- Phase 5e (recurring export/import): done - recurringRules field added to export; import handles it as optional for backwards compatibility with old export files
- Phase 5f (recurring sync): done - recurring-rules.json synced to Drive alongside categories; mergeRecords last-write-wins applies
