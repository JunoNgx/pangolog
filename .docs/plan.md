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
- [ ] Category management view: Drag and drop priority ordering functionality
    - [ ] Reorder UI with drag handles
    - [ ] Save new order to IndexedDB
    - [ ] Update transaction form category order

### Phase 2b: Summary view
- [ ] Summary view
    - [ ] Display pie charts

### Phase 2c: Setting view
- [ ] Settings view
    - [ ] Custom display unit
        - [ ] Custom currency symbol input
        - [ ] Prefix/suffix toggle
    - [ ] Google Drive connection UI
        - [ ] Connect button
        - [ ] Connection status
        - [ ] Disconnect option

### Phase 2d: Dark/Light theme switcher
- [ ] Theme switcher
    - [ ] Location: navbar
    - [ ] Options:
        - [ ] Dark theme
        - [ ] Light theme
        - [ ] Use system settings

### Phase 2e: Setup Progressive Web App
- [ ] Setup manifest
- [ ] Setup metadata
- [ ] Setup placeholder imagefile for icons

## Phase 3: Drive sync

### Phase 3a: OAuth
- [ ] Google OAuth setup
    - [ ] Create Google Cloud project
    - [ ] Configure OAuth consent screen
    - [ ] Get client ID and secret
- [ ] Implement OAuth flow
    - [ ] Popup authentication
    - [ ] Token storage in IndexedDB
    - [ ] Token refresh handling

### Phase 3b: Drive file structure
- [ ] Define Drive file organization
    - [ ] Create appDataFolder
    - [ ] File naming convention: `YYYY-MM.json` (dimes)
    - [ ] File naming convention: `YYYY-bucks.json` (bucks)
    - [ ] `categories.json`
    - [ ] `settings.json`

### Phase 3c: Sync logic
- [ ] Upload logic
    - [ ] Serialize data to JSON
    - [ ] Create/update Drive files
    - [ ] Handle rate limits with retry
- [ ] Download logic
    - [ ] List files in appDataFolder
    - [ ] Download and parse JSON
    - [ ] Merge with local data
- [ ] Sync triggers
    - [ ] 30s debounced after changes
    - [ ] On visibilitychange (tab close)
    - [ ] Manual sync button

### Phase 3d: Misc implementations
- [ ] Implement "last write wins" with updatedAt
    - [ ] Compare timestamps
    - [ ] Resolve conflicts automatically
    - [ ] Log conflicts for debugging
- [ ] 30-day purge job
    - [ ] Find records with deletedAt < 30 days
    - [ ] Remove from IndexedDB
    - [ ] Remove from Drive on next sync

- [ ] Connection status indicator
- [ ] Last sync time display
- [ ] Manual sync button
- [ ] Error notifications

## Phase 4: Data mobility

### Export
- [ ] JSON export
    - [ ] Complete data export
    - [ ] Pretty print option
- [ ] CSV export
    - [ ] Flatten nested data
    - [ ] Handle categories separately
- [ ] Share/Download functionality

### Import
- [ ] File upload component
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