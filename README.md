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
- (Post-release) Recurring transactions.
- (Post-release) Monthly budgeting.

## Tech stack

- NextJS as based frontend framework
- IndexedDB for data persistence.
- TanStack as handle caching, loading, and errors, as an abstraction layer on top of IndexedDB.
- Zustand as UI state management.
- Tailwind CSS

## Running

Run `yarn && yarn dev` from the root directory.

## Environment variable

This project does NOT require any setup for environment variable.

## Support and Contribution

To get support, provide feedback, or contribute, please open a PR for this repository, or contact me via email or BlueSky.
