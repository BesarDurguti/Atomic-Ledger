# Atomic Ledger — User Flow

## Overview

Atomic Ledger is a personal finance tracker with AI assistance.
Users create their own spending categories, log transactions manually or through AI chat,
and get insights about their spending patterns.

---

## Pages

### 1. Dashboard (`/`)
- Shows summary stats: total transactions, total spent this month, number of categories
- Monthly spending breakdown by category (simple list or chart)
- Recent transactions (last 5-10)
- Anomaly alerts (unusually large transactions)
- Ledger status: balanced or imbalanced

### 2. Categories (`/categories`)
- User creates their own categories:
  - Para ne Banke (Asset)
  - Para Cash (Asset)
  - Qiraja (Expense)
  - Rryma (Expense)
  - Ushqimi (Expense)
  - Paga (Revenue)
  - etc.
- Each category has: name, type (Asset/Expense/Revenue/Liability), icon (optional)
- CRUD: create, edit, delete categories
- Cannot delete a category that has transactions

### 3. Transactions (`/transactions`)
- List of all transactions, sorted by date (newest first)
- Each transaction shows: date, description, amount, category, from → to
- Filter by category, date range
- Button: "New Transaction" opens the form

#### New Transaction Form
- Description: free text ("Pagova qiranë per shkurt")
- Amount: number input
- From: dropdown (select category — e.g., "Para ne Banke")
- To: dropdown (select category — e.g., "Qiraja")
- Date: date picker (defaults to today)
- Submit → backend validates double-entry (from and to must exist, amount > 0) → saves

### 4. AI Assistant (`/ai`)
- Chat interface
- User types naturally, AI responds

#### What AI can do:

**A) Create transactions from natural language:**
```
User: "Sot pagova 350 euro qira dhe 45 euro rryme"

AI: I created 2 transactions:
    1. Qiraja — 350€ (from Para ne Banke)
    2. Rryma  — 45€  (from Para ne Banke)

    [Save Both] [Edit] [Cancel]
```

**B) Answer questions about spending:**
```
User: "Sa kam shpenzu kete muaj?"

AI: This month you spent 1,240€ total:
    - Qiraja:    350€
    - Ushqimi:   320€
    - Benzina:   180€
    - Rryma:      45€
    - Tjera:     345€
```

**C) Compare and analyze:**
```
User: "A jam mire me buxhet kete muaj?"

AI: Last month you spent 1,100€. This month you're at 1,240€ (+12.7%).
    Biggest increase: Ushqimi — 320€ vs 210€ last month (+52%).
```

**D) Suggest categories:**
```
User: "Sapo bleva nje makine per 8,500€"

AI: I don't see a category for vehicle purchases.
    Want me to create "Automjeti" as an Asset category?

    [Yes, create it] [No, use existing category]
```

---

## Data Model

### Category (Account)
- id
- name (e.g., "Para ne Banke", "Qiraja")
- type: ASSET | LIABILITY | REVENUE | EXPENSE
- createdAt

### Transaction (Journal Entry)
- id
- description ("Pagova qiranë per shkurt")
- amount (350.00)
- fromCategoryId → Category (where money comes FROM)
- toCategoryId → Category (where money GOES)
- date
- aiGenerated (boolean — was this created by AI?)
- createdAt

### Message (AI Chat History)
- id
- role: USER | ASSISTANT
- content
- createdAt

---

## Double-Entry Logic

Every transaction moves money FROM one category TO another:

| Action | From (Credit) | To (Debit) |
|--------|---------------|------------|
| Pay rent | Para ne Banke | Qiraja |
| Receive salary | Paga | Para ne Banke |
| Buy groceries | Para Cash | Ushqimi |
| Pay electricity | Para ne Banke | Rryma |
| Take bank loan | Kredia | Para ne Banke |

The rule: Sum of all money IN = Sum of all money OUT. Always.

---

## API Endpoints

### Categories
- `GET /api/categories` — list all categories
- `POST /api/categories` — create a new category
- `PUT /api/categories/[id]` — update a category
- `DELETE /api/categories/[id]` — delete (only if no transactions)

### Transactions
- `GET /api/transactions` — list all (supports ?month=&category= filters)
- `POST /api/transactions` — create new transaction (validates double-entry)
- `DELETE /api/transactions/[id]` — delete a transaction

### AI
- `POST /api/ai/chat` — send a message, get AI response + optional actions

### Dashboard
- `GET /api/dashboard` — aggregated stats (totals, monthly breakdown, anomalies)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) — frontend + API
- **Language:** TypeScript
- **Database:** SQLite + Prisma
- **AI:** OpenAI API (GPT-4)
- **UI:** Tailwind CSS + shadcn/ui
- **Validation:** Zod
