# Pangolog

## Overview

A minimalist, offline-first, and privacy-first personal expense tracker Progressive Web App.

## Features

- Offline-first principle, operational without an internet connection.
- Privacy-first cloud-sync, with data stored in user's Google Drive.
- Transaction list view with filter by month.
- Separation of regular daily (Small Dimes) and irregular large (Big Bucks) transactions.
- Assigning transactions to categories, with label, colour, and emoji-based icon.
- Overview and summary by month and year.
- Recurring transactions.

## Tech stack

- NextJS as based frontend framework
- IndexedDB for data persistence.
- TanStack as handle caching, loading, and errors, as an abstraction layer on top of IndexedDB.
- Zustand as UI state management.
- Tailwind CSS

## Running

Run `pnpm install && pnpm dev` from the root directory.

## Environment variable

### For Google Drive sync

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `IRON_SESSION_SECRET`

You would need

- A Google Clould project with Drive API enabled
- An OAuth 2.0 client ID, can typically be found in:
    - Google Cloud Console > APIs & Services > Credentials
    - Your OAuth 2.0 Client ID (exiting or new)
        - Type `Web application`
        - Configured `Authorised JavaScript origins`, typically `http://localhost:3000` if you are running locally, otherwise your deployed URL
        - Publishing to production, or configured test users
    - For `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: use client ID
    - For `GOOGLE_CLIENT_SECRET`: use a secret under the Client secrets section
- Execute in a terminal `openssl rand -base64 32` and use the output for `IRON_SESSION_SECRET`

### For SEO configuration

- `NEXT_PUBLIC_BASE_URL` (optional - defaults to the value in `src/lib/constants.ts`)

### Service worker

- `NEXT_PUBLIC_SW_ENABLED`

Only for service worker debugging during development.

## Support and Contribution

To get support, provide feedback, or contribute, please open a PR for this repository, or contact me via email or BlueSky.
