# Implementation plan: Pangolog

## Phase 1: MVP

### Phase 1a: basic setup
- [x] Setup Next.js project with required stacks
    - [x] HeroUI
    - [x] TanStack
    - [x] Zustand
    - [x] Tailwind
- [x] Configure Biome

### Phase 1b: route structure setup
- [x] Setup basic route structure
    - `/`: landing page
    - `/log`: transaction view
    - `/categories`: category management
    - `/summary`: summary view
    - `/settings`: settings

### Phase 1c: IndexedDB setup
- [x] IndexedDB schema implementation
    - [x] Define database version 1
    - [x] Create object stores: dimes, bucks, categories, settings
    - [x] Create indexes for queries (month, year, categoryId)
    - [x] Implement wrapper functions (get, put, delete, query)
        - [x] Small dimes
        - [x] Big bucks
        - [x] Categories
        - [x] Soft deletion
        - [x] Query by month for dimes
        - [x] Query by year for bucks

### Phase 1d: main layout
- [x] Layout
    - Main view
    - Navbar for route switching

### Phase 1e: category view
- [x] Category management view UI
    - [x] List of categories
    - [x] Add category button
    - [x] New category dialog
        - [x] Name input
        - [x] Color picker (hex)
        - [x] Emoji picker
        - [x] Income-only checkbox
        - [x] Big-buck-only checkbox
    - [x] Category CRUD
        - [x] Create category
        - [x] Edit category
        - [x] Soft delete (prevent if transactions exist)

### Phase 1f: transaction view
- [x] Transaction view UI
    - [x] List of transactions
    - [x] Add transaction button
    - [x] New transaction dialog
        - [x] Amount input (with decimal handling)
        - [x] Income/expense toggle
        - [x] Dime/buck toggle (disabled on edit)
        - [x] Category selector with accordion (7 visible)
        - [x] Description input
    - [x] Transaction view list configuration
        - [x] Month picker
        - [x] Big Bucks only
        - [x] Inclusion of Big Bucks in Small Dimes
    - [x] CRUD operations
        - [x] Create transaction
        - [x] Edit transaction
        - [x] Soft delete (set deletedAt)
        - [x] Permanent delete (after 30 days)
    - [x] Filter transactions by Categories (dropdown, includes Uncategorised, Check/Uncheck all)

### Phase 1g: implement default route and setup important settings
- [x] User onboarding flow
    - [won't do] Root page checks IndexedDB for existing data
    - [x] Set localStorage flag on first transaction creation
    - [x] Redirect returning users to /log
    - [x] Show landing page for new users

### Phase 1h: polishing
- [x] Polishing
    - [x] Toast notifications
    - [x] Loading skeletons
    - [x] Empty states

### Phase 1j: Responsive design
- [x] Responsive design
    - [x] Navbar in mobile

### Phase 1k: Hotkey shortcut
- [x] Hotkey shortcut: `Cmd/Ctrl + Enter`
    - [x] Transaction view: open the create new Transaction dialog
    - [x] Category view: open the create new Category dialog

## Phase 2: Advanced features

### Phase 2a: drag and drop
- [x] Category management view: Drag and drop priority ordering functionality
    - [x] Reorder UI with drag handles
    - [x] Save new order to IndexedDB
    - [x] Update transaction form category order

### Phase 2b: Summary view
- [x] Summary view
    - [x] Switch: month and yearly
    - [x] Checkbox: include Big Bucks in yearly view
    - [x] Switch: viewing Big Bucks only in the year view

### Phase 2c: Setting view
- [x] Settings view
    - [x] Custom display unit
        - [x] Custom currency symbol input
        - [x] Prefix/suffix toggle
    - [x] Google Drive connection UI
        - [x] Connect button
        - [x] Connection status
        - [x] Disconnect option

### Phase 2d: Dark/Light theme switcher
- [x] Theme switcher
    - [x] Location: navbar
    - [x] Options:
        - [x] Dark theme
        - [s] Light theme
        - [x] Use system settings

### Phase 2e: Setup Progressive Web App
- [x] Setup favicon for the site
- [x] Setup manifest
- [x] Setup metadata
- [x] Setup placeholder imagefile for icons

### Phase 2f: Header and utility panel layout
- [x] A list of to the app's routes (e.g. `/log`, `/settings`)
    - [x] Position: on top of main view, similar to tab list/tab switch
    - [x] Has icon and label
    - [x] Current route is indicated
    - [x] Mobile layout: floating at the bottom of the viewport

- [x] Utility panel
    - [x] Position: to the right of the header
    - [x] Sync indicator
    - [x] Theme switcher

### Phase 2g: Offline functionality
- [x] Implement service worker to cache app shell

## Phase 3: Drive sync

### Phase 3a: OAuth
- [x] Google OAuth setup
    - [x] Create Google Cloud project
    - [x] Configure OAuth consent screen
    - [x] Get client ID and secret
- [x] Implement OAuth flow
    - [x] Popup authentication
    - [x] Token storage in localStorage (via Zustand)
    - [x] Token refresh handling

### Phase 3b: Drive file structure
- [x] Define Drive file organization
    - [x] Create `Pangolog` folder in Drive root (visible to user)
    - [x] File naming convention: `YYYY-MM.json` (dimes)
    - [x] File naming convention: `YYYY-bucks.json` (bucks)
    - [x] `categories.json`
    - [x] `settings.json`

### Phase 3c: Sync logic
- [x] Upload logic
    - [x] Serialize data to JSON
    - [x] Create/update Drive files
    - [x] Upload display settings (customCurrency, isPrefixCurrency) to settings.json
- [x] Download logic
    - [x] List files in Pangolog Drive folder
    - [x] Download and parse JSON
    - [x] Merge with local data
    - [x] Merge display settings from settings.json (last-write-wins)
- [x] Sync triggers
    - [x] 30s debounced after changes
    - [x] On visibilitychange (tab close)
    - [x] Manual sync button

### Phase 3d: Misc implementations
- [x] Implement "last write wins" with updatedAt
    - [x] Compare timestamps
    - [x] Resolve conflicts automatically
    - [x] Log conflicts for debugging
- [x] 30-day purge job
    - [x] Find records with deletedAt older than 30 days
    - [x] Remove from IndexedDB before each sync
    - [x] Removed records excluded from next Drive upload
- [x] Connection status indicator (dot in navbar: green/blue/red)
- [x] Last sync time display (settings page)
- [x] Manual sync button (settings page)
- [x] Error notifications (toast) - deferred to Phase 1h

### Phase 3e: Implement demo data

#### Phase 3e-1: demo data
- [x] Implement demo data as part of migration

#### Phase 3e-2: clear data options
- [x] Clear local records: hard-deletes all records in all tables
- [x] Reset app: wipes all tables and localStorage data, hidden behind Debug section

#### Phase 3e-3: opt-in demo data banner
- [x] Remove automatic seeding from IDB migration
- [x] Implement `shouldShowDemoDataBanner` in `localSettingsStore` (default true, persisted)
- [x] Implement `DemoDataBanner`.
- [x] Show banner on `/log` and `/manage` (categories) for new users with "Load sample data" and "Dismiss" options
    - [x] Load sample data: seeds demo data as regular records, sets `shouldShowDemoDataBanner` to false
    - [x] Dismiss: sets `shouldShowDemoDataBanner` to false
- [x] Fix Zustand persist SSR hydration: add `StoreHydration` to `providers.tsx`

## Phase 4: Data mobility

### Phase 4a: JSON export/import
- [x] JSON export
    - [x] Complete data export
    - [x] Pretty print option
    - [x] Store both Transactions and Categories in a single file
- [x] JSON import
    - [x] Validate schema
    - [x] Preview changes
    - [x] Handle conflicts (overwrite/merge)
- [x] Import summary
    - [x] Show counts added/updated
    - [x] Error reporting


### Phase 4b: CSV export/import - canceled, will not implement
- [ ] CSV export
    - [ ] Flatten nested data
    - [ ] Handle categories separately
- [ ] CSV import
    - [ ] Parse CSV with headers
    - [ ] Map to data model
    - [ ] Create missing categories
- [ ] Import summary
    - [ ] Show counts added/updated
    - [ ] Error reporting

## Phase 5: Recurring transactions

### Phase 5a: DB implementation
- [x] Implementation of IndexedDB models
- [x] Implementation of indexes
- [x] Implementation of CRUD hooks

### Phase 5b: route
- [x] Implement route `/recurring`
- [x] Add navbar entry

### Phase 5c: runner hook
- [x] Implement RecurringRulesManager
    - [x] Look for rules with `nextGenerationAt` in the past
    - [x] Advance `nextGenerationAt` until it reaches the future
    - [x] Create one single item for each rule, ignoring previous gaps
    - [x] Invalidate TanStackQuery cache after creation to refresh the data immediately

### Phase 5d: UI
- [x] Overview list of items
- [x] Dialog UI to create/edit
- [x] Sorting option UI

### Phase 5e: Export/Import
- [x] Update import logic
- [x] Update export logic

### Phase 5f: Sync logic
- [x] Upload logic
- [x] Download logic

## Phase 6: Additional features
- [ ] Magic input for quick adding

## Phase 7: Help route

### Phase 7a: Technical part
- [x] Implementation of route `/help`
- [x] UI to access route from settings route `/settings`
- [x] UI to return to previous page

### Phase 7b: Content
- [x] Implement content

### Phase 7c: Hotkey shortcuts
- [x] `Ctrl/Cmd + B`: `/log` and `/summary`: toggle between Small Dimes and Big Bucks
- [x] `Ctrl/Cmd + I`: `/log` and `/summary`: toggle `Include Big Bucks`
- [x] `Ctrl/Cmd + B`: `/manage`: toggle between tabs

### Phase 8: migration for optimised table structure

This phase will render existing cloud data and json files obsolete and incompatible.

### Phase 8a: IDB
- [x] Implement object store for transactions
- [x] Implement indexing for transaction queries (by year and month)
- [x] Implement CRUD wrapper function for transactions
- [x] Implement `useTransactions` hook

### Phase 8b: Implement migration script
- [x] Implement migration to move data from `dimes` and `bucks` to `transactions`

### Phase 8c: Update hooks and views
- [x] Replace `useDimes`, `useBucks`, `useBucksByMonth`, `useDimesByYear` with unified `useTransactions` hook(s)
- [x] Update `/log` view to use new hooks
- [x] Update `/summary` view to use new hooks

### Phase 8c-2: Allow transaction type switch
- [x] Implement UI to allow converting between types

### Phase 8d: Update recurring rules
- [x] Update recurring rules logic to create new transactions correctly

### Phase 8e: Update JSON export/import
- [x] Update export logic: single `transactions` array instead of separate `dimes`/`bucks`
- [x] Update import logic: handle new format only; silently ignore old `dimes`/`bucks` fields if present

### Phase 8f: Update sync logic
- [x] Ignore existing `YYYY-MM.json` and `YYYY-bucks.json` Drive files without migration
- [x] Replace upload logic with `YYYY.json` per-year files
- [x] Replace download logic to fetch `YYYY.json` files
- [x] Smart sync: skip download if Drive `modifiedTime` <= `lastSyncTime`
- [x] Smart sync: only upload years with local mutations since `lastSyncTime`

### Phase 8g: Delete old logic
- [x] Delete IDB stores for dimes and bucks
- [x] Delete dimes and bucks hooks

## Task 9: Cloud autobackup

### Task 9a: Drive client
- [x] Add `backupFileName(year, month): string` → `backup-YYYY-MM.json` to drive client

### Task 9b: Backup logic
- [x] After each successful sync, check if `backup-YYYY-MM.json` for the current month exists in the Pangolog Drive folder
- [x] If not, serialize all data (same format as JSON export: transactions, categories, recurringRules, settings) and upload it
- [x] Skip silently if backup already exists for the current month

### Task 9c: Implement UI
- [x] Implement `isAutobackupEnabled` in `localSettingsStore`
- [x] Implement toggle checkbox in settings
- [x] Implement note informing the user that monthly backups accumulate and they should clean up old ones manually


### Task 10: transaction search

#### Task 10a: preparation
- [x] Rename `getAllTransactionsForSync` to `getAllTransactions`

#### Task 10b: implement a hook
- [x] Implement `useAllTransactions` hook in `useTransactions`

#### Task 10c: implement UI
- [x] Implement search bar
- [x] Implement conditions to display viewing controls
- [x] Implement conditions to display search results

### Task 10d: search mode
- [x] Implement search mode UI

### Task 11d: empty mode
- [ ] Implement an easter egg animation when both small dimes and big bucks are unchecked in Transactions or Summary view

## Task 12 (bug): Fix duplicate recurring transactions across devices

GitHub issue: pangolog#10

Root cause: two devices can both see a rule as due before either syncs, each generating a transaction with a different UUID. Since sync merges by ID, both survive. Fix: tag runner-generated transactions with `ruleId` + `rulePeriod`, then deduplicate post-sync.

### Task 12a: Add fields to Transaction type and update all callers
- [x] Add `ruleId: string | null` and `rulePeriod: string | null` to `Transaction` type
- [x] Pass `ruleId: null, rulePeriod: null` in `TransactionDialog` (manual transactions)
- [x] Pass `ruleId: null, rulePeriod: null` in `demo.ts` (seed transactions)

### Task 12b-migration: DB migration for ruleId and rulePeriod
- [x] Bump DB version and set `ruleId: null, rulePeriod: null` on all existing transactions

### Task 12b: Update recurring runner
- [x] Compute `rulePeriod` from the scheduled date based on rule frequency:
    - daily/weekly: `YYYY-MM-DD`
    - monthly: `YYYY-MM`
    - yearly: `YYYY`
- [x] Pass `ruleId: rule.id` and computed `rulePeriod` when calling `createTransaction`

### Task 12c: Post-sync deduplication
- [x] Normalize incoming Drive transactions: default missing `ruleId`/`rulePeriod` to `null` before storing
- [x] After sync merges remote transactions locally, run a dedup pass
- [x] Group non-deleted transactions by `(ruleId, rulePeriod)`, skip where `ruleId` is null
- [x] For each group with more than one entry, soft-delete all but the one with the earliest `updatedAt`
- [x] Persist soft-deletes to IDB

### Task 12d: Update export/import
- [x] Include `ruleId` and `rulePeriod` in JSON export
- [x] Normalize incoming transactions on import: default missing `ruleId`/`rulePeriod` to `null` before storing

### Task 12e: Make ruleId and rulePeriod optional
- [x] Change `ruleId` and `rulePeriod` in `Transaction` type to `ruleId?: string` and `rulePeriod?: string`
- [x] Remove explicit `ruleId: null, rulePeriod: null` from `TransactionDialog`
- [x] Remove explicit `ruleId: null, rulePeriod: null` from `demo.ts`
- [x] Revert DB v5 migration (no longer needed - absent and undefined are equivalent in IDB)
- [x] Update dedup check in `sync.ts` to use `!t.ruleId` or `t.ruleId == null`
- [x] Remove normalization from `sync.ts` and `import.ts` (no longer needed)

## Task 13: Fix identified code weaknesses

### Task 13a: Fix SubmitEvent type in form submit handlers
- [x] Change `handleSubmit(e: React.SyntheticEvent)` to `handleSubmit(e: SubmitEvent)` in `TransactionDialog.tsx` and `RecurringRuleDialog.tsx`
- `SubmitEvent` is the correct native type for a form submit handler. `React.SyntheticEvent` is a generic synthetic event type that doesn't communicate intent. `CategoryDialog.tsx` already uses the correct pattern and should be used as reference.

### Task 13b: Fix resolveTransactedAt in TransactionDialog
- [x] Remove redundant `originalDateStr` local variable; compare `transactedAt` directly against `toDateInputValue(transaction.transactedAt)`
- The `transactedAt` state is initialized to `toDateInputValue(transaction.transactedAt)` in the `useEffect`. Re-deriving `originalDateStr` inside `resolveTransactedAt` is redundant and a source of potential timezone drift: if the stored ISO was written on a device in a different timezone (e.g. `2026-03-28T23:00:00+07:00`), `toDateInputValue` calls `.toLocal()` before `.toISODate()`, which may produce a different date on the current device. A false negative causes `fromDateInputValue` to be called, silently rewriting the time component to 12:00 local. The fix makes the invariant explicit: if the input string equals what we initialized it to, the user didn't change the date.

### Task 13c: Replace module-level isSyncing flag in useSync
- [won't do] Replace `let isSyncing = false` with `const isSyncingRef = { current: false }` and update all reads/writes to use `isSyncingRef.current`
- The module-level mutable boolean is invisible to React DevTools, won't reset on hot reload during development, and can't be observed or tested without calling the hook. A ref-like object keeps the cross-instance shared guard semantics (all hook instances share the same lock) while being semantically consistent with how React tracks mutable values that don't trigger re-renders.
    - Won't fix: the existing code is correct and the comment already explains its intent clearly. This would be a pure convention change with no logic impact.

### Task 13d: Fix settings sync TOCTOU in sync.ts
- [x] Re-read from `useProfileSettingsStore.getState()` after potentially calling `applyRemoteSettings`, before building `localSettings` for upload
- This is a time-of-check to time-of-use bug: `customCurrency`, `isPrefixCurrency`, and `settingsUpdatedAt` are destructured from store state (time of check) before the remote settings comparison. If remote is newer, `applyRemoteSettings` updates the store - but `localSettings` is then built from the original destructured variables, which are now stale (time of use). `upsertFile` then immediately overwrites the newer remote value with the losing local one. The fix is to call `useProfileSettingsStore.getState()` again after the conditional block to get the winning values before uploading.

## Task 17: Accessibility improvements

GitHub issue: pangolog#17

### Task 17a: `prefers-reduced-motion` support
- [x] Add `@media (prefers-reduced-motion: reduce)` rule to `src/app/globals.css`
- Covers `animate-spin` on SyncButton, all `transition-*` classes, and Sonner toast animations in one rule

### Task 17b: Skip-to-main-content link
- [x] Add visually-hidden skip link before `<AppNavbar />` in `src/app/(app)/layout.tsx`
- [x] Add `id="main-content"` to the `<main>` element
- Allows keyboard users to bypass navbar on every page

### Task 17c: `aria-label` on icon-only buttons
- [ ] `src/components/PeriodPicker.tsx`: add dynamic `aria-label` to prev/next chevron buttons (`"Previous month"` / `"Next month"` or `"Previous year"` / `"Next year"` based on `isYearly`)
- [ ] `src/app/(app)/manage/CategoryList.tsx`: add `aria-label={`Drag to reorder ${cat.name}`}` to drag handle button
- [ ] `src/components/CategoryDialog.tsx`: add `aria-label="Choose icon"` to emoji picker trigger, `aria-label={`Choose colour, currently ${colour}`}` to colour picker trigger, replace `title="Random colour"` with `aria-label="Random colour"` on random colour button

### Task 17d: `aria-live` region for SyncButton status text
- [ ] Wrap status text `<span>` in `aria-live="polite" aria-atomic="true"` in `src/components/SyncButton.tsx`
- [ ] Add `aria-label="Sync with Google Drive"` to the Button
- [ ] Add `aria-hidden="true"` to the RefreshCw icon
- Screen readers will announce sync status changes without user interaction

### Task 17e: Verify Sonner toast accessibility
- [x] Sonner v2.0.7 renders toasts inside `<ol aria-live="polite">` natively -- no changes needed