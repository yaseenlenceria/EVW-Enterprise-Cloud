# EVW Cloud ERP Blueprint (Vape-First → Global SaaS)

## 1) System Architecture (Cloud-Native, Vape-First, Multi-Region Ready)

### Layered View
```
Client Layer (React 18, Vite, Tailwind, shadcn/ui)
  ↳ Auth & Session (Supabase Auth or JWT; PKR-aware)
  ↳ UX Shell (multi-branch switcher, i18n, theming)
API Layer (REST + Edge Functions)
  ↳ Domain services: Inventory, Invoicing, Payments, Expenses, Analytics, Stock Audit, Credits, WhatsApp, Backups
  ↳ BFF façade for web + mobile (rate-limited, typed responses)
Data Layer (PostgreSQL/Supabase)
  ↳ Vape schema: brands, flavors, strengths, batches, expiry, multi-tier pricing
  ↳ Finance: invoices, payments, expenses, P&L, profit analytics
  ↳ Ops: activity logs, stock audits, backups, tenants/branches
Integration Layer
  ↳ WhatsApp Cloud API, Payment rails (Bank/JazzCash/EasyPaisa), PDF/Label/QR services, Observability (Sentry, PostHog)
Infrastructure
  ↳ Vercel (frontend), Supabase (DB+Auth+Storage), Cloudflare (DNS/CDN/WAF), Object storage (backups)
```

### Reference Deployment (Pakistan → Multi-Region)
- **Primary**: `PK-East` (Supabase + Vercel region aligned) with daily encrypted backups to R2/S3.
- **Edge Expansion**: add `UAE-West` / `EU-West` read replicas; promote to multi-region with Supabase WAL streaming when expanding.
- **Tenant Isolation**: schema-per-tenant or `tenant_id` + RLS; start single-tenant for MVP, migrate to multi-tenant with [06-GLOBAL-SCALABILITY-STRATEGY](./06-GLOBAL-SCALABILITY-STRATEGY.md) guidelines.

### Availability & Resilience
- **Stateless frontend** (cacheable assets, service worker for offline invoicing drafts).
- **DB Resilience**: PITR backups, read replica for reporting, RLS for isolation, pgcrypto for sensitive fields (bank details).
- **Observability**: Sentry (front/back), OpenTelemetry traces on Edge Functions, uptime ping (every 30s).

## 2) Core Database Schema (High-SKU Vape Model)
Key tables (PostgreSQL/Supabase):
- `brands`, `products`, `flavors`, `strengths`, `batches` (expiry, lot), `price_tiers` (retail/wholesale/bulk), `stock_levels` (by location), `stock_adjustments`, `stock_audits` (variance & justification).
- `customers` (tags, credit limit, terms, WhatsApp number), `invoices` (EVW branding refs), `invoice_items`, `payments` (cash/bank/JazzCash/EasyPaisa, partial), `expenses`, `expense_receipts`.
- `profit_snapshots` (per day/month), `activity_logs`, `backup_points`, `tenants`, `branches`, `users`, `roles`, `permissions`.
- Indexes: `(tenant_id, sku_code)`, `(barcode)`, `(batch_id, expires_at)`, `(customer_id, next_payment_due)`; GIN on tags/search vectors for fast flavor/strength search.

## 3) API Strategy & Key Endpoints
- **Pattern**: REST-first with predictable nouns + versioning (`/v1`). Use BFF functions for UI-specific aggregation to keep the frontend thin.
- **Auth**: Supabase Auth JWT; headers: `Authorization: Bearer <token>` + `x-tenant-id`.
- **Examples (condensed)**
  - `POST /v1/auth/login` → issue JWT; `POST /v1/auth/impersonate` (admin)
  - `GET /v1/products?search=watermelon&branch=lahore` (fast search via GIN & trigram)
  - `POST /v1/invoices` (body: customer, items with flavor/strength/batch, pricing tier, bank details, discounts, taxes)
  - `POST /v1/invoices/{id}/payments` (cash/bank/JazzCash/EasyPaisa, partial allowed)
  - `POST /v1/stock-audits` (start session) → `POST /v1/stock-audits/{id}/variance`
  - `POST /v1/whatsapp/send` (invoice PDF + payment instructions)
  - `GET /v1/analytics/profit?period=month&channel=retail|wholesale`

## 4) Vape-Specific ERP Modules (MVP Scope)
- **Inventory**: SKU builder (brand/series/flavor/mg/size), batch & expiry, QR/barcode, low-stock alerts, valuation (FIFO/weighted avg).
- **Invoicing**: EVW logo/bank (PK), wholesale/retail/bulk pricing, profit per invoice, discounts/tax, POS & A4 PDF, WhatsApp share.
- **Expenses**: categories, receipt upload, month close, P&L integration.
- **Payments & Credit**: credit limits, due dates, partial payments, reminders, outstanding balance tracker.
- **Analytics**: daily sales, monthly revenue, gross → net profit, top/slow movers, inventory value, brand/category profitability.
- **Stock Audit**: physical vs system stock, damaged/missing logging, approval trail, audit history.
- **Activity Logs**: invoice creation, stock edits, deletions, export CSV, admin audit panel.
- **Backups**: daily encrypted snapshots, restore points, retention tiers.

## 5) UI/UX Blueprint (Home + Dashboard + Operations)
- **Home/Login**: EVW-branded hero, secure login, PK localization; quick value props (PKR invoicing, flavor/strength SKUs, WhatsApp).
- **Dashboard**: cards for daily sales, receivables, inventory value; charts (Recharts) for revenue/profit; alerts for low stock & expiring batches.
- **Inventory Workspace**: SKU composer (brand/flavor/strength), price tiers, QR/barcode print, batch grid with expiry badges.
- **Invoice Workspace (POS/A4)**: search by SKU/barcode, pricing mode toggle (retail/wholesale/bulk), discount/tax, profit preview, WhatsApp/PDF buttons.
- **Expenses**: upload receipt, category tags, daily/monthly summaries, auto P&L.
- **Customers & Credit**: tags (Bulk buyer, Late payer), credit limit meters, payment timelines, WhatsApp reminder shortcuts.
- **Stock Audit**: guided count flow, variance flags, approval + export.

## 6) Tech Stack (Production Recommendation)
- **Frontend**: React 18 + TypeScript, Vite, TailwindCSS, shadcn/ui (Radix), React Query, Zustand for local state, Recharts for analytics, React-PDF for invoices, jsBarcode/QR for labels.
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime), Edge Functions (Deno) for webhook-style endpoints, pg_cron for scheduled backups.
- **Infra**: Vercel frontend, Supabase managed DB, Cloudflare DNS/WAF/CDN, object storage (R2/S3) for backups & receipts, PostHog + Sentry.
- **CI/CD**: GitHub Actions (lint, type-check, tests, preview deploys), Vercel preview for PRs; migrations via Supabase CLI.

## 7) Development Roadmap (Condensed)
- **Phase 0 (Week 0-1)**: Project setup, auth shell, design system, PKR/i18n baseline.
- **Phase 1 (Weeks 2-5)**: Inventory (SKU/batches/pricing tiers), POS invoicing with EVW branding, payments (cash/bank/JazzCash/EasyPaisa), expenses.
- **Phase 2 (Weeks 6-9)**: Analytics (sales/profit), customer credit, WhatsApp module, stock audit, activity logs.
- **Phase 3 (Weeks 10-12)**: Backups/restore points, multi-branch, export/import flows, performance tuning, accessibility + RTL.
- **Phase 4 (Weeks 13-16)**: UAE/KSA rollout readiness (currency/tax), sandbox tenants, billing/metering, SOC2-aligned logging.

## 8) Build Cost & MVP Timeline (Pakistan Launch)
| Team | Duration | Cost (USD) |
| --- | --- | --- |
| 1 PM + 1 UX | 2 weeks | $6,000 |
| 2 FE + 1 BE | 12 weeks | $72,000 |
| QA + Sec/DB reviews | 2 weeks | $8,000 |
| **Total (16 weeks)** |  | **$86,000** |

## 9) Scalability & Globalization Plan
- **Multi-tenant**: start single-tenant PK; migrate with tenant_id + RLS and tenant-scoped storage buckets.
- **Multi-currency**: money columns as `numeric`; rates cached (Open Exchange); invoice display localized (PKR, AED, SAR, GBP, MYR).
- **Multi-language**: i18n keys; Urdu/Arabic RTL layouts; dynamic import of locale bundles; number/date formatting per locale.
- **Multi-branch/country**: branch table with tax profiles; tax rules engine per country; per-branch stock and pricing; geo-routed edge functions.

## 10) Security, Compliance, and Backup Strategy
- **Access**: RBAC by role (Owner/Admin/Manager/Cashier/Auditor); MFA via Supabase; session timeouts; device/session list.
- **Data protection**: RLS everywhere; encrypt bank details with pgcrypto; signed URLs for receipts; audit trails immutable (append-only).
- **Backups**: daily full + hourly WAL; 30-day retention; restore to point-in-time or named restore points; encrypt backups at rest.
- **Monitoring**: Sentry errors, anomaly alerts on auth/role changes, log streaming to object storage.

## 11) Monetization (SaaS + Add-ons)
- **Core tiers**: Starter ($29/mo PK), Growth ($79), Scale ($149) with user/branch limits; overage for storage/invoices.
- **Add-ons**: WhatsApp automation, advanced analytics, backup retention upgrade, custom domains, premium support (SLA).
- **Billing**: Usage meter in DB, Stripe/Paddle for cards, invoicing for bank transfers; country-aware tax/VAT.

## 12) Example Entity Relationships (Vape Focus)
```
Tenant ─┬─ Branch ─┬─ StockLevels
        │         └─ StockAudits
        ├─ Users (Roles, ActivityLogs)
        ├─ Products ─┬─ Batches ─┬─ StockAdjustments
        │            └─ PriceTiers
        ├─ Customers ─┬─ Invoices ─┬─ InvoiceItems
        │             │            └─ Payments
        │             └─ CreditTerms
        └─ Expenses ── ExpenseReceipts
```
