# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atomic Ledger is a personal finance app using double-entry bookkeeping. Every transaction moves money FROM one category TO another (e.g., "Para ne Banke" → "Qiraja"). Content is in Albanian.

## Tech Stack

- **Next.js 16** (App Router) with React 19, TypeScript 5 (strict mode)
- **Prisma 7** with SQLite (better-sqlite3 adapter), file-based at `prisma/dev.db`
- **Tailwind CSS 4** with shadcn/ui (new-york style, oklch colors)
- **Zod 4** for validation schemas shared between client and server

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx tsx prisma/seed.ts "Name" "email@test.com" "password"  # Seed database
npx prisma db push   # Push schema changes to SQLite
```

## Architecture

- **All pages are client components** (`"use client"`) — `app/page.tsx`, `app/categories/page.tsx`, `app/transactions/page.tsx`, `app/ai/page.tsx`
- **API routes** under `app/api/` — currently only auth (login/logout) is implemented
- **Prisma client singleton** in `lib/prisma.ts` using BetterSqlite3 adapter
- **Validation schemas** in `lib/validation.ts` — Zod schemas for categories (4 types: ASSET, LIABILITY, REVENUE, EXPENSE) and transactions
- **UI components** in `components/ui/` are shadcn/ui generated; custom components (`sidebar.tsx`, `navbar.tsx`) are in `components/`
- **Path alias**: `@/*` maps to the project root

## Data Model

The core pattern is double-entry bookkeeping:
- **User** owns Categories, Transactions, and Messages
- **Category** has a type (ASSET | LIABILITY | REVENUE | EXPENSE)
- **Transaction** has `fromCategoryId` and `toCategoryId` (must differ), with an `aiGenerated` flag
- **Message** stores AI chat history (role: USER | ASSISTANT)

All IDs use cuid. All data is scoped to `userId`.

## Current State

Pages use hardcoded mock data — backend API endpoints for categories, transactions, and AI chat are not yet implemented. Auth uses SHA256 password hashing with HTTP-only session cookies (7-day expiry).
