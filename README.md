# 🇲🇾 SmarTax Malaysia — AI-Powered Tax Relief Intelligence Platform

> **Stop missing the ringgit you're entitled to.**
> SmarTax identifies every tax relief you may have overlooked — with verified LHDN-backed references.

---

## 🚨 The Problem

Malaysian taxpayers leave an estimated **RM 2.3 billion** in unclaimed reliefs every year.

Not because they are ineligible —
but because:

- Relief rules are fragmented across LHDN documents
- Eligibility conditions are complex and hard to interpret
- Manual calculation is tedious and error-prone

👉 The average taxpayer claims only **4 out of 18+ available reliefs**

---

## 🧠 What SmarTax Does

SmarTax turns tax relief discovery into a **structured, guided assessment system**:

```
Input tax details → Complete guided checks → Receive verified assessment
```

### Output includes:

- ✅ Eligible tax reliefs identified
- 💰 Estimated tax savings
- 📚 Direct LHDN citations for each claim
- 🔍 Clear explanation of eligibility logic

---

## 👥 Built for Real Taxpayer Scenarios

| Persona                  | Challenge                       | SmarTax Solution                             |
| ------------------------ | ------------------------------- | -------------------------------------------- |
| **Aminah (Salaried)**    | Doesn’t know applicable reliefs | Guided wizard surfaces all eligible claims   |
| **Razak (SME Owner)**    | Capital allowance confusion     | Upload P&L → AI extracts claimable expenses  |
| **Jia Wen (Freelancer)** | No payslips, manual tracking    | Guided income declaration + deduction finder |

---

## ⚙️ Core System Design

### 1. Hybrid Intelligence Architecture

SmarTax separates:

- 🧠 **AI (discovery layer)** → identifies potential reliefs
- 🧮 **Tax Engine (calculation layer)** → computes exact values

👉 No hallucinated numbers. Fully explainable outputs.

---

### 2. RAG-Based Reference System

- LHDN Public Rulings → chunked → embedded → stored in `pgvector`
- Every recommendation includes:
  - exact source reference
  - contextual explanation

👉 Results are **traceable and verifiable**

---

### 3. End-to-End Processing Flow

```
User Input / Upload
        ↓
OCR (Tesseract / PDF parser)
        ↓
Structured Data Extraction
        ↓
RAG Retrieval (LHDN context)
        ↓
OpenAI (eligibility reasoning)
        ↓
Deterministic Tax Engine
        ↓
Assessment Output (UI)
```

---

## ✨ Key Features

### 💡 Missed Money Detection

Instantly highlights:

> “You could have saved RM X,XXX”

---

### 📚 Citation-Backed Results

- Each relief links to LHDN guidance
- No black-box outputs
- Audit-friendly

---

### 🧪 Scenario Simulator

- “What if I increase EPF contribution?”
- Real-time tax savings delta

---

### 🌐 Bilingual Support

- Bahasa Malaysia 🇲🇾
- English 🇬🇧

---

### 📱 Progressive Web App (PWA)

- Installable on mobile
- Optimized for tax season use

---

## 🧱 Tech Stack

### Frontend

- Next.js 15 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Radix UI
- Framer Motion
- Lucide React

### Backend

- Next.js API Routes (serverless)
- Supabase Auth (SSR)

### AI Engine

- OpenAI API
- Tesseract.js (OCR)
- Custom RAG (retriever + chunker)
- Tiktoken

### Data Layer

- Supabase (PostgreSQL)
- pgvector (embeddings)

### Document Processing

- pdf-parse
- pdfjs-dist

### Deployment

- Vercel (frontend + backend)
- Supabase (database + auth)

---

## 🗂️ Project Structure

```
app/            Next.js App Router pages + API routes
components/     UI + domain components (tax/, ui/, layout/)
lib/            Core logic (tax engine, AI, OCR, RAG)
types/          TypeScript interfaces
scripts/        DB seed + ingestion pipelines
docs/           Architecture + demo scripts
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add Supabase + OpenAI keys

# Seed database
npm run seed
npm run ingest

# Run dev server
npm run dev
```

Open:
👉 http://localhost:3000

---

## 🧪 Demo Flow (5 Minutes)

See:

```
docs/DEMO_SCRIPT.md
```

Covers:

- Problem framing
- User walkthrough
- “Missed money” moment
- AI + RAG explanation

---

## 🏗️ System Architecture Summary

| Layer          | Responsibility                        |
| -------------- | ------------------------------------- |
| **Frontend**   | UI, user interaction, results display |
| **Backend**    | API logic, validation, orchestration  |
| **Database**   | Users, documents, assessments         |
| **AI Engine**  | OCR + reasoning + RAG                 |
| **Tax Engine** | Deterministic calculations            |
| **Deployment** | Vercel + Supabase                     |

---

## 🎯 Design Principles

- Clarity over complexity
- Deterministic over guesswork
- Reference-backed over black-box AI
- Structured workflows over calculators

---

## 👨‍💻 Team

Built at **UMH Hackathon 2026**

---

## 📌 Vision

To become Malaysia’s **default tax intelligence layer**,
where every taxpayer can clearly understand:

- what they’re eligible for
- why it applies
- how much they can save

---
