# SmarTax Malaysia's AI-Powered Tax Relief Finder

> Stop leaving money on the table. SmarTax finds every ringgit you're owed.

## The Problem

Malaysian taxpayers leave an estimated **RM 2.3 billion** in unclaimed reliefs every year not because they're ineligible, but because the system is too complex to navigate. The average individual only claims 4 of 18 available reliefs.

## What SmarTax Does

Upload your EA Form → answer 8 questions → see exactly how much money you missed, with one-click LHDN citations.

### Three Personas, One Platform

| Persona | Pain Point | SmarTax Solution |
|---------|-----------|-------------------|
| **Aminah** (salaried) | Doesn't know which reliefs apply | Wizard surfaces all 18 reliefs with eligibility check |
| **Razak** (SME owner) | Capital allowance confusion | P&L upload → AI extracts claimable expenses |
| **Jia Wen** (freelancer) | No payslips, manual calculation | Guided income declaration + deduction finder |

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes (serverless)
- **AI**: OpenAI GPT-4 (primary)
- **Database**: Supabase (PostgreSQL + pgvector for RAG)
- **Auth**: Supabase Auth
- **PDF Processing**: pdf-parse

## Architecture Highlights

- **RAG Pipeline**: LHDN Public Rulings chunked → embedded → stored in pgvector. Every relief recommendation links to the exact ruling.
- **Pure Tax Engine**: Deterministic calculator in `lib/tax/engine.ts` — no AI in the math, only in discovery.
- **Scenario Simulator**: "What if I maxed my EPF?" sliders show real-time tax delta.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase and OpenAI API keys

# 3. Seed the database
npm run seed        # Load reliefs master list
npm run ingest      # Index LHDN rulings into pgvector

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Key Features

- **Missed Money Moment**: Hero screen shows "You could have saved RM X,XXX" with breakdown
- **Citation Badges**: Every relief links directly to LHDN ruling (no hallucination risk)
- **BM / EN Toggle**: Full bilingual support
- **PWA**: Installable on mobile for tax season use
- **Scenario Simulator**: Pre-year-end planning with real-time tax delta

## Folder Structure

```
app/           Next.js App Router pages + API routes
components/    React components (tax/, ui/, layout/, shared/)
lib/           Business logic (tax engine, GLM client, RAG, PDF)
types/         TypeScript interfaces
scripts/       DB seed + ingestion scripts
docs/          Architecture, API docs, demo script
```

## Demo Flow (5 min)

See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the full pitch flow.

## Team

Built at UMH Hackathon 2026.
