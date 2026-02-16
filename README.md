# Atomic Ledger

A full-stack AI-powered journal entry tool that reimagines how accounting teams create and manage ledger entries. Built with Next.js.

## The Problem

In legacy ERPs, creating journal entries is slow and error-prone: clunky forms, no guardrails, zero intelligence. Accountants manually look up account codes, type debit/credit lines one by one, and hope the entry balances. It's a workflow that hasn't changed in 30 years.

## The Solution

Atomic Ledger brings AI into the core workflow. Describe a transaction in plain English — the AI structures it into a valid, balanced journal entry. Review, adjust, post. What used to take minutes now takes seconds.

## Features

### AI-Powered Entry Creation
Type a natural language description like _"Paid $2,400 rent for office lease"_ and the AI returns structured debit/credit lines with the correct accounts and amounts. One click to accept and post.

### Double-Entry Validation
Every journal entry is validated server-side before it hits the database. Debits must equal credits — no exceptions. The system rejects imbalanced entries at the API level, not just the UI.

### Anomaly Detection
Entries that deviate significantly from historical patterns get flagged automatically. Uses standard deviation scoring to surface transactions that look unusual — helping catch errors or fraud early.

### Live Ledger View
A reactive, sortable table of all posted entries with running balances and anomaly indicators. Filter by account, date range, or status.

### Chart of Accounts Management
Create and manage the account structure (Assets, Liabilities, Equity, Revenue, Expenses) that powers the entire ledger.

## Tech Stack

- **Framework:** Next.js 14 (App Router) — frontend and API in one project
- **Language:** TypeScript (end-to-end)
- **Database:** SQLite + Prisma ORM (real schema, real migrations, zero setup)
- **AI:** OpenAI API (natural language to structured journal entries)
- **Styling:** Tailwind CSS
- **Validation:** Zod (shared schemas between client and server)

## Project Structure

```
atomic-ledger/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── entries/
│   │   └── page.tsx                # Journal entry form + ledger view
│   ├── accounts/
│   │   └── page.tsx                # Chart of accounts
│   └── api/
│       ├── entries/
│       │   └── route.ts            # GET/POST journal entries
│       ├── accounts/
│       │   └── route.ts            # GET/POST accounts
│       └── ai/
│           └── suggest/
│               └── route.ts        # AI: natural language -> entry
├── lib/
│   ├── prisma.ts                   # Prisma client
│   ├── validation.ts               # Double-entry validation logic
│   └── anomaly.ts                  # Anomaly detection scoring
├── prisma/
│   └── schema.prisma               # Database schema
└── components/
    ├── EntryForm.tsx                # Journal entry form
    ├── LedgerTable.tsx              # Ledger view table
    ├── AISuggest.tsx                # AI suggestion input
    └── AccountSelect.tsx            # Account picker
```

## Getting Started

```bash
git clone <repo-url>
cd atomic-ledger
npm install
npx prisma db push
npx prisma generate
```

Seed the database with a default user and categories:

```bash
npx tsx prisma/seed.ts "Your Name" "your@email.com" "yourpassword"
```

This creates a user and 9 default categories (Para ne Banke, Para Cash, Qiraja, Rryma, Ushqimi, Benzina, Paga, Freelance, Kredia e Bankes).

Then start the dev server:

```bash
npm run dev
```

Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your-key-here
```

## Why I Built This

This project is inspired by DualEntry's mission to replace legacy ERPs with AI-native software. It demonstrates the core interaction loop: describe a transaction naturally, let AI do the heavy lifting, validate everything server-side, and present it in a clean, responsive UI.

Built in a weekend to prove the point: accounting software doesn't have to be painful.
