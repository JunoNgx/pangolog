# Implementation plan: Pangolog

## Phase 1: MVP
- [ ] Setup Next.js project with required stacks
    - [ ] HeroUI
    - [ ] TanStack
    - [ ] Zustand
    - [ ] Tailwind
- [ ] Configure Biome
- [ ] Setup basic route structure
    - `/`: landing page
    - `/log`: transaction view
    - `/categories`: category management
    - `/summary`: summary view
    - `/settings`: settings

- [ ] IndexedDB schema implementation
    - [ ] Define database version 1
    - [ ] Create object stores: dimes, bucks, categories, settings
    - [ ] Create indexes for queries (month, year, categoryId)
    - [ ] Implement wrapper functions (get, put, delete, query)
        - [ ] Small dimes
        - [ ] Big bucks
        - [ ] Categories
        - [ ] Soft deletion
        - [ ] Query by month for dimes
        - [ ] Query by year for bucks

- [ ] Layout
    - Main view
    - Navbar for route switching

- [ ] Transaction view UI
    - [ ] List of transactions
    - [ ] Add transaction button
    - [ ] New transaction dialog
        - [ ] Amount input (with decimal handling)
        - [ ] Income/expense toggle
        - [ ] Dime/buck toggle (disabled on edit)
        - [ ] Category selector with accordion (7 visible)
        - [ ] Description input
    - [ ] Transaction view list configuration
        - [ ] Month picker
        - [ ] Big Bucks only
        - [ ] Inclusion of Big Bucks in Small Dimes
    - [ ] CRUD operations
        - [ ] Create transaction
        - [ ] Edit transaction
        - [ ] Soft delete (set deletedAt)
        - [ ] Permanent delete (after 30 days)

- [ ] Category management view UI
    - [ ] List of categories
    - [ ] Add category button
    - [ ] New category dialog
        - [ ] Name input
        - [ ] Color picker (hex)
        - [ ] Emoji picker
        - [ ] Income-only checkbox
        - [ ] Big-buck-only checkbox
    - [ ] Category CRUD
        - [ ] Create category
        - [ ] Edit category
        - [ ] Soft delete (prevent if transactions exist)

- [ ] User onboarding flow
    - [ ] Root page checks IndexedDB for existing data
    - [ ] Set localStorage flag on first transaction/category
    - [ ] Redirect returning users to /log
    - [ ] Show landing page for new users

- [ ] Polishing
    - [ ] Toast notifications
    - [ ] Loading skeletons
    - [ ] Empty states
    - [ ] Responsive design

## Phase 2: Advanced features
- [ ] Category management view: Drag and drop priority ordering functionality
    - [ ] Reorder UI with drag handles
    - [ ] Save new order to IndexedDB
    - [ ] Update transaction form category order
- [ ] Summary view
    - [ ] Display pie charts
- [ ] Settings view
    - [ ] Custom display unit
        - [ ] Custom currency symbol input
        - [ ] Prefix/suffix toggle
    - [ ] Google Drive connection UI
        - [ ] Connect button
        - [ ] Connection status
        - [ ] Disconnect option

## Phase 3: Drive sync
- [ ] Google OAuth setup
    - [ ] Create Google Cloud project
    - [ ] Configure OAuth consent screen
    - [ ] Get client ID and secret
- [ ] Implement OAuth flow
    - [ ] Popup authentication
    - [ ] Token storage in IndexedDB
    - [ ] Token refresh handling
- [ ] Define Drive file organization
    - [ ] Create appDataFolder
    - [ ] File naming convention: `YYYY-MM.json` (dimes)
    - [ ] File naming convention: `YYYY-bucks.json` (bucks)
    - [ ] `categories.json`
    - [ ] `settings.json`
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