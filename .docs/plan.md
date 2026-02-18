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


### Phase 1g: implement default route and setup important settings
- [x] User onboarding flow
    - [ ] Root page checks IndexedDB for existing data
    - [x] Set localStorage flag on first transaction creation
    - [x] Redirect returning users to /log
    - [x] Show landing page for new users

### Phase 1h: polishing
- [ ] Polishing
    - [ ] Toast notifications
    - [x] Loading skeletons
    - [ ] Empty states

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
- [ ] Summary view
    - [ ] Display pie charts

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
- [x] Download logic
    - [x] List files in Pangolog Drive folder
    - [x] Download and parse JSON
    - [x] Merge with local data
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
- [ ] Error notifications (toast) — deferred to Phase 1h

### Phase 3e: Initialise seed data upon entering the app
- [ ] Should use the time user enters the app as creation datetime
- [ ] Categories
    - [ ] Food
    - [ ] Videogame
    - [ ] Grocery
- [ ] Small dimes
    - [ ] Eggs, $5, category Grocery
    - [ ] Sandwich, $10, category Food
- [ ] Big bucks
    - [ ] What Remains of Edith Finch, $20, Videogame

## Phase 4: Data mobility

### Phase 4a: Export
- [ ] JSON export
    - [ ] Complete data export
    - [ ] Pretty print option
- [ ] CSV export
    - [ ] Flatten nested data
    - [ ] Handle categories separately

### Phase 4b: Import
- [ ] JSON import
    - [ ] Validate schema
    - [ ] Preview changes
    - [ ] Handle conflicts (overwrite/merge)
- [ ] CSV import
    - [ ] Parse CSV with headers
    - [ ] Map to data model
    - [ ] Create missing categories
- [ ] Import summary
    - [ ] Show counts added/updated
    - [ ] Error reporting

## Phase 5: Recurring transactions
- [ ] Recurring rules UI

## Phase 6: Additional features
- [ ] Magic input for quick adding

## Phase 7: Amendment
- [ ] Should rename `createdAt` to `transactionDatetime`