# Antigravity IDE Master Prompt: Brightloop Subscription & Recurring Revenue Operating System

> **Usage Instructions for Antigravity IDE:**
> 1. Paste **Part 1 (Master System Prompt)** as your initial project bootstrap prompt or save it as `.antigravity/rules.md` / `PROJECT_SPEC.md` in your workspace root so the agent maintains full architectural context across every file.
> 2. Execute the **Part 2 (Phased Execution Prompts)** sequentially in the Antigravity IDE Agent chat to build, verify, and polish each layer without hitting context limits.

---

## Part 1: Master System & Architecture Prompt (Copy-Paste into Antigravity IDE)

```markdown
# ROLE & OBJECTIVE
You are a Principal Full-Stack Architect, Staff Distributed Systems Engineer, Principal FinTech Product Designer, and Project Lead. We are building **Brightloop OS** — an enterprise-grade, next-generation Subscription Management, Recurring Billing, and Autonomous Revenue Operating System for **Brightloop Software**.

Brightloop Software sells B2B/B2C subscription software (billed daily, weekly, monthly, or yearly), toggleable add-ons, and multi-variant products (e.g., Brand variants where selecting the "Odoo" brand dynamically adds +560 to the base unit price). Customers range from small shops on monthly plans to enterprise contracts on annual terms. Today, their operations suffer from spreadsheet tracking, missed renewals, hand-typed invoices, manual bank statement reconciliation, and days-long quarterly reporting.

Your mission is to build a unified, zero-leakage, sub-2-second response platform that satisfies 100% of the core operational scenes while introducing **five industry-first, internationally novel FinTech capabilities** that have never been combined in a commercial subscription engine before.

---

# 1. TECH STACK & PERFORMANCE BACKBONE (SUB-2-SECOND SLA)
Build a production-ready, full-stack monorepo or clean modular application using:
- **Frontend**: Next.js 14+ (App Router), TypeScript (Strict), Tailwind CSS, shadcn/ui + Radix Primitives, Lucide Icons, Framer Motion (micro-interactions), TanStack Table v8 (virtualized tables for 10,000+ rows), Recharts / Tremor (real-time financial telemetry), and Command-K (`cmdk`) global action bar.
- **Backend & API**: Next.js Server Actions / Route Handlers or NestJS/Fastify TypeScript API with Zod end-to-end schema validation, REST + Server-Sent Events (SSE) for live billing run progress.
- **Database & ORM**: PostgreSQL + Prisma ORM (or Drizzle ORM) with strict ACID transactions, `SELECT ... FOR UPDATE SKIP LOCKED` concurrency guards, composite B-Tree indexes on `(status, next_billing_date, customer_id)`, and materialized summary views so dashboards with 10,000+ subscriptions and 50,000+ invoices load in **< 200ms** (strictly well under the 2.0-second SLA).
- **Financial Precision**: Store all monetary values in integer minor units (cents/paise) or `DECIMAL(18, 4)` using `decimal.js`—never standard IEEE 754 floating-point math.
- **Idempotency & Auditability**: Every billing run, invoice generation, discount application, and payment recording must use deterministic idempotency keys (`hash(subscription_id + billing_period_start + billing_period_end)`) and write to an immutable double-entry financial ledger.

---

# 2. FIVE INTERNATIONAL-MARKET-FIRST NOVEL FEATURES (DIFFERENTIATORS)
Integrate these 5 novel capabilities natively into the core workflow (not as mocked placeholders, but as working interactive engines with real math and state):

### Novelty 1: Chronos™ Interactive Billing Time-Machine & Proration Simulator
- Unlike traditional billing tools where admins fear changing plans or discounts because they cannot foresee future invoices, **Chronos™** provides a timeline scrubber on every Subscription and Quotation.
- Users and admins can scrub forward +30, +90, or +365 days—or simulate mid-cycle seat upgrades, add-on toggles, pause/resume windows, and discount expirations—to inspect the exact future generated invoices, tax cascades, and discount burn-down before committing changes.

### Novelty 2: Zero-Leakage Cryptographic Idempotency Ledger (Hash-Chained Billing Engine)
- To guarantee that **nothing is ever billed twice or skipped** on Billing Day, every invoice and payment is recorded as an immutable ledger entry containing a SHA-256 cryptographic hash of `(previous_ledger_hash + subscription_id + period_start + period_end + line_items_json + total_amount)`.
- A unique database constraint on `(subscription_id, billing_cycle_key)` prevents duplicate billing even if two admins click "Run Billing Engine" simultaneously. The UI features a live **"Ledger Integrity Verifier"** badge that proves zero duplicate or skipped billing cycles across the entire company history.

### Novelty 3: Elastic Seat & Add-On Smart-Ramp Optimizer (Reverse-Discount Engine)
- Standard systems require customers to ask sales reps for volume discounts. Brightloop OS includes an algorithmic **Smart-Ramp Detector**: when a customer adds seats or add-ons (or views their portal), the engine evaluates active Admin Discount Rules and displays a live interactive banner: *"Add 2 more seats to unlock the 15% Tier-2 Volume Discount—saving $420/yr net!"* and automatically previews the next invoice impact.

### Novelty 4: AI-Assisted Probabilistic Bank-Statement Reconciliation & Split-Payment Matcher
- Solves the "scrolling through bank statements" pain point. Staff can upload/paste raw CSV bank rows or messy wire transfer memos, or record manual payments.
- An intelligent deterministic + fuzzy subset-sum solver matches partial payments, lumped multi-invoice wire transfers, or reference-less deposits to open `CONFIRMED` invoices by evaluating exact/near amounts, customer history, and date proximity, offering 1-click reconciliation with audit notes.

### Novelty 5: Self-Healing Renewal & Pause/Resume Micro-Contract Portal
- When a customer attempts to cancel or misses a payment on a plan that allows pausing/early closure, the Customer Portal dynamically calculates a **Pause-Instead-of-Churn Micro-Offer** (e.g., pausing billing for 30 days while preserving configuration and extending contract expiry automatically by `pause_duration_days`) or an instant 1-click term switch (Monthly → Annual with automatic proration credit).

---

# 3. COMPLETE DOMAIN REQUIREMENTS & SCENE-BY-SCENE MAPPING

### Scene 1: Identity, Security & Strict RBAC ("A new customer signs up")
1. **Self-Service Customer Sign-Up & Auth**:
   - Email uniqueness strictly enforced at DB and API levels (`UNIQUE(email)`).
   - Strict Password Policy validator (real-time visual checklist + backend regex):
     - Length **strictly > 8 characters** (minimum 9 characters: `.{9,}`)
     - At least 1 uppercase letter (`[A-Z]`)
     - At least 1 lowercase letter (`[a-z]`)
     - At least 1 special character (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`)
   - Password hashing via Argon2id / bcrypt.
   - **Forgot Password Flow**: Generates a cryptographically signed, time-limited (15-min) single-use reset token, sends/logs a reset link to the registered email, and renders an in-app **Simulated Email Outbox Drawer** so evaluators can test the exact reset email link immediately without external SMTP setup.
2. **Three-Tier Role-Based Access Control (RBAC)**:
   - `ADMIN`: Full platform control. Only role allowed to create/manage Staff accounts, configure Products/Variants, create Recurring Plans, configure Tax Rules, and create Discount Rules.
   - `INTERNAL_STAFF`: Day-to-day operations. Can manage quotations, advance subscriptions (`Draft -> Quotation -> Confirmed -> Active -> Closed`), trigger/review billing runs, confirm/cancel/send/print invoices, record payments, and view operational reports. Cannot create staff, plans, taxes, or discount rules.
   - `CUSTOMER`: Isolated Self-Service Portal. Can only view and manage their own subscriptions (toggle add-ons, pause/resume/close/renew according to plan permissions), accept quotations, view/download their own invoices, and see their payment history.

### Scene 2: Products, Dynamic Variants & Recurring Plans ("Launching a new plan")
1. **Product & Variant Catalog (`ADMIN` only write)**:
   - Product fields: `id`, `sku`, `name`, `productType` (`SUBSCRIPTION_SOFTWARE`, `ADD_ON`, `SERVICE`), `baseSalesPrice`, `costPrice`, `internalNotes`, `isActive`.
   - **Attribute & Variant Pricing Matrix**: Support arbitrary variant attributes (e.g., Attribute: `Brand`, Values: `Standard` [+0], `Odoo` [**+560**], `Enterprise Cloud` [+1200]). When a variant is selected on a quote or subscription line, the effective unit price automatically computes as `baseSalesPrice + sum(variantPriceDeltas)` and displays the margin against `costPrice`.
2. **Recurring Plan Engine (`ADMIN` only write)**:
   - Plan fields: `name`, `basePrice`, `billingPeriodUnit` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), `billingIntervalCount` (default 1), `minQuantity`, `availableFromDate`, `availableToDate`.
   - **Lifecycle Governance Flags (Plan-by-Plan Admin Toggles)**:
     - `autoCloseOnExpiry` (boolean: closes automatically when `expiryDate` is reached)
     - `allowEarlyClose` (boolean: permits customer/staff to close before expiry)
     - `allowPause` (boolean: permits pausing billing cycle and shifting renewal dates)
     - `allowRenewal` (boolean: permits manual or auto-renewal into a new term)

### Scene 3: Quotation Templates & Subscription Lifecycle ("Turning a quote into a subscription")
1. **Quotation Templates**:
   - Reusable blueprints with pre-configured `planId`, `validityDays` (e.g., valid for 14 or 30 days), default `paymentTerms` (`IMMEDIATE`, `NET_15`, `NET_30`, `NET_45`), and pre-populated product/variant line items.
   - Sales reps (`INTERNAL_STAFF` or `ADMIN`) can instantiate a new Quote from a template in 1 click.
2. **Subscription Entity & Strict State Machine**:
   - Fields: `subscriptionNumber` (auto-sequenced, e.g., `SUB-2026-0001`), `customerId`, `planId`, `templateId`, `startDate`, `expiryDate`, `nextBillingDate`, `paymentTerms`, `status`, `pausedAt`, `cancellationReason`.
   - **Subscription Lines**: `productId`, `variantId` (e.g., Odoo Brand +560), `description`, `quantity` (enforced `>= plan.minQuantity`), `unitPrice`, `discountAmount`, `taxIds`, `taxAmount`, `lineSubtotal`, `lineTotal`.
   - **5-Stage Lifecycle State Machine**:
     `DRAFT` $\rightarrow$ `QUOTATION` (sent to customer, tracks quote expiry) $\rightarrow$ `CONFIRMED` (customer accepted / locked) $\rightarrow$ `ACTIVE` (live recurring billing enabled) $\rightarrow$ `CLOSED` (expired, cancelled, or completed; plus `PAUSED` sub-state if `plan.allowPause == true`).
   - Visual lifecycle progress stepper on every subscription record so any team member immediately sees where it stands.

### Scene 4: Automated Batch Billing & Tax Rules ("Billing day")
1. **Admin Tax Rule Engine**:
   - Admin defines Tax Rules (`name`, `ratePercentage` or `fixedFee`, `region/country`, `productTypeFilter`, `isCompound`, `isActive`).
   - Automatically applied to matching subscription lines during quotation and invoice generation.
2. **Zero-Touch Batch Billing Engine**:
   - Evaluates all `ACTIVE` subscriptions where `nextBillingDate <= targetBillingDate`.
   - Checks `autoCloseOnExpiry`: if `currentDate >= expiryDate`, transitions subscription to `CLOSED` automatically.
   - Generates pre-populated Invoices with customer snapshot, itemized product/variant lines, automatic tax breakdowns, and eligible active discounts.
   - **Strict Idempotency Guard**: Enforces `UNIQUE(subscription_id, billing_period_start, billing_period_end)`. Running the billing engine 10 times on the same day produces **zero duplicate invoices** and skips zero eligible subscriptions.
   - **Invoice State Machine & Actions**:
     - States: `DRAFT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PAID` (plus `CANCELLED`).
     - Actions available to Staff/Admin: **Confirm**, **Cancel**, **Send** (triggers simulated email + portal notification), and **Print / Download PDF** (clean, print-styled tax invoice layout).

### Scene 5: Autonomous Discount Engine ("A customer asks for a better price")
1. **Admin-Only Discount Rules**:
   - Fields: `code`, `name`, `discountType` (`FIXED_AMOUNT` or `PERCENTAGE`), `value`, `minPurchaseAmount`, `minSeatQuantity`, `startDate`, `endDate`, `maxTotalRedemptions`, `maxCyclesPerSubscription`, `currentRedemptions`, `scope` (`SPECIFIC_PRODUCTS` with product relation list, or `ENTIRE_SUBSCRIPTION`).
2. **Self-Applying & Self-Expiring Automation**:
   - During every Billing Run (and inside the Chronos™ preview), the engine evaluates attached or auto-qualified discount rules against each subscription:
     - Checks `currentDate BETWEEN startDate AND endDate`
     - Checks `currentRedemptions < maxTotalRedemptions`
     - Checks `subscription.quantity >= minSeatQuantity` and `subtotal >= minPurchaseAmount`
   - If valid, automatically injects the discount line onto the next invoice and increments usage counters atomically.
   - Once `endDate` passes or usage limits are exhausted, the discount automatically stops appearing on subsequent invoices without manual intervention.

### Scene 6: Multi-Method Payments & AR Tracking ("The money comes in")
1. **Payment Recording & Reconciliation**:
   - Record payments against any `CONFIRMED` invoice with: `paymentMethod` (`BANK_TRANSFER`, `CREDIT_CARD`, `UPI_ACH`, `CHECK`, `CASH`, `WIRE`), `amount`, `paymentDate`, `referenceNumber`, and `notes`.
   - Supports full payments, partial payments (tracking `amountPaid` and `amountDue`), and AI-assisted batch bank CSV reconciliation.
   - When `amountPaid >= invoiceTotal`, invoice automatically transitions from `CONFIRMED` to `PAID`.
2. **Accounts Receivable & Overdue Radar**:
   - Real-time computation of `dueDate` based on `paymentTerms`.
   - Instant visual segmentation of `PAID`, `OUTSTANDING (Current)`, and `OVERDUE (Past Due Date)` with 1-click "Chase / Send Dunning Reminder" workflow.

### Scene 7: Sub-2-Second Finance Executive Command Center ("The finance lead, at the end of the month")
1. **Executive Telemetry & Filters**:
   - Instant KPI cards: **Active Subscriptions Count**, **Monthly Recurring Revenue (MRR) & ARR**, **Total Collected Revenue (Cash In)**, **Total Outstanding AR (Still Owed)**, **Overdue Invoice Amount & Count**, and **Net Revenue Retention (NRR)**.
   - Multi-dimensional filters: Date Range (This Month, Last Month, Quarter, Custom), Plan Frequency (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), Product/Brand Variant, Customer Segment, and Invoice Status.
2. **Scale & Speed Benchmark Suite**:
   - Built-in **"Seed 2,500 Subscriptions & 10,000 Invoices Benchmark"** button in the Admin Developer Toolbar that populates realistic high-volume data and displays a live query execution timer (`ms`) proving every filter, table sort, and dashboard aggregation completes in **< 200ms** (well below the 2-second requirement).

---

# 4. COMPLETE DATABASE SCHEMA SPECIFICATION (PRISMA / POSTGRESQL)
Implement the following normalized, indexed relational schema:
- `User`: `id`, `email (unique)`, `passwordHash`, `fullName`, `companyName`, `role (ADMIN | INTERNAL_STAFF | CUSTOMER)`, `resetTokenHash`, `resetTokenExpiresAt`, `createdAt`
- `Product`: `id`, `sku (unique)`, `name`, `type (SOFTWARE | ADD_ON | SERVICE)`, `salesPrice`, `costPrice`, `notes`, `isActive`
- `ProductVariant`: `id`, `productId`, `attributeName` (e.g., "Brand"), `attributeValue` (e.g., "Odoo"), `priceDelta` (e.g., `560.00`), `skuSuffix`
- `Plan`: `id`, `name`, `code`, `price`, `billingPeriod (DAILY | WEEKLY | MONTHLY | YEARLY)`, `intervalCount`, `minQuantity`, `availableFrom`, `availableTo`, `autoCloseOnExpiry`, `allowEarlyClose`, `allowPause`, `allowRenewal`, `isActive`
- `QuotationTemplate`: `id`, `name`, `planId`, `validityDays`, `paymentTerms`, `notes`, `lines (JSON/Relation)`
- `TaxRule`: `id`, `name`, `ratePercent`, `fixedAmount`, `appliesToProductType`, `isActive`
- `DiscountRule`: `id`, `name`, `code`, `type (PERCENTAGE | FIXED)`, `value`, `scope (PRODUCT | SUBSCRIPTION)`, `minPurchaseAmount`, `minQuantity`, `startDate`, `endDate`, `maxUsageLimit`, `currentUsageCount`, `isActive`, `applicableProductIds`
- `Subscription`: `id`, `subscriptionNumber (unique)`, `customerId`, `planId`, `templateId`, `status (DRAFT | QUOTATION | CONFIRMED | ACTIVE | PAUSED | CLOSED)`, `startDate`, `expiryDate`, `nextBillingDate`, `quoteValidUntil`, `paymentTerms`, `discountRuleId`, `pausedAt`, `totalPausedDays`, `subtotal`, `taxTotal`, `discountTotal`, `grandTotal`, `createdAt`, `updatedAt`
  - *Indexes*: `@@index([status, nextBillingDate])`, `@@index([customerId, status])`
- `SubscriptionLine`: `id`, `subscriptionId`, `productId`, `variantId`, `quantity`, `baseUnitPrice`, `variantPriceDelta`, `effectiveUnitPrice`, `taxRuleId`, `taxAmount`, `discountAmount`, `lineTotal`
- `Invoice`: `id`, `invoiceNumber (unique)`, `subscriptionId`, `customerId`, `billingCycleKey (unique per subscription)`, `periodStart`, `periodEnd`, `issueDate`, `dueDate`, `status (DRAFT | CONFIRMED | PAID | CANCELLED)`, `subtotal`, `discountTotal`, `taxTotal`, `grandTotal`, `amountPaid`, `amountDue`, `ledgerHash`, `previousLedgerHash`, `sentAt`
  - *Indexes*: `@@unique([subscriptionId, billingCycleKey])`, `@@index([status, dueDate])`, `@@index([customerId, status])`
- `InvoiceLine`: `id`, `invoiceId`, `productId`, `variantName`, `description`, `quantity`, `unitPrice`, `discountAmount`, `taxName`, `taxAmount`, `lineTotal`
- `Payment`: `id`, `paymentNumber`, `invoiceId`, `customerId`, `method (BANK_TRANSFER | CREDIT_CARD | WIRE | UPI_ACH | CHECK | CASH)`, `amount`, `paymentDate`, `reference`, `notes`, `recordedByUserId`
- `AuditLedger`: `id`, `entityType`, `entityId`, `action`, `actorId`, `actorRole`, `payloadJson`, `cryptographicHash`, `createdAt`

---

# 5. UI/UX DESIGN SYSTEM ("PRECISION FINTECH INDUSTRIAL")
- **Aesthetic Persona**: Inspired by Stripe Billing, Linear, and Mercury Bank. High-contrast slate/obsidian dark-and-light adaptive theme, crisp 1px borders (`border-slate-200/80` / `dark:border-slate-800`), tabular monospace numbers (`font-variant-numeric: tabular-nums`) for all currency/dates/IDs, and status pills with semantic dot indicators.
- **Role-Switched Demo Header Bar**: Include a persistent top-right **"Live Persona Switcher"** (`Admin: Elena Vance`, `Internal Staff: Marcus Chen`, `Customer: Acme Corp`, plus `Sign Out / Test Sign-Up`) so evaluators can test all three RBAC views, permissions, and guardrails in one click without clearing cookies.
- **Zero Dead Buttons**: Every button—Confirm, Cancel, Send Invoice, Print PDF, Run Billing Day, Apply Discount, Record Payment, Reconcile Bank Statement, Pause Subscription, Chronos Time-Scrubber, and High-Volume Benchmark—must execute real state transitions and persist changes.
```

---

## Part 2: Step-by-Step Phase Prompts for Antigravity IDE

If you want Antigravity IDE to build the entire platform methodically without cutting corners or hitting token limits, feed these **6 sequential prompts** one after another as each phase finishes.

### Phase 1 Prompt: Project Scaffolding, Database Schema & Seed Engine
```markdown
Execute Phase 1 of Brightloop OS:
1. Initialize the Next.js 14+ (App Router, TypeScript) project with Tailwind CSS, shadcn/ui components, Lucide icons, and Prisma (SQLite/PostgreSQL configured for immediate local execution) or a persistent transactional store with sub-millisecond indexing.
2. Implement the complete database schema covering Users (ADMIN, INTERNAL_STAFF, CUSTOMER), Products, ProductVariants (specifically including the "Odoo" Brand variant that adds +560 to the sales price), Plans (Daily, Weekly, Monthly, Yearly with minQuantity, availability dates, and lifecycle flags: autoCloseOnExpiry, allowEarlyClose, allowPause, allowRenewal), QuotationTemplates, Subscriptions, SubscriptionLines, TaxRules, DiscountRules, Invoices, InvoiceLines, Payments, and the SHA-256 Hash-Chained AuditLedger.
3. Build a rich initial Seed Engine that pre-populates Brightloop Software's realistic catalog, active plans, quotation templates, tax rules, volume discount rules, and subscriptions across all 5 states (Draft, Quotation, Confirmed, Active, Closed), plus a high-speed bulk generator capable of seeding 2,500+ subscriptions to verify the <2-second response SLA.
```

### Phase 2 Prompt: Authentication, Password Policy Validator & 3-Tier RBAC
```markdown
Execute Phase 2 of Brightloop OS:
1. Build the Authentication system: Sign-Up, Sign-In, Forgot Password, and Reset Password pages.
2. Enforce strict email uniqueness and real-time + server-side password validation (> 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 special character) with an interactive strength/requirement meter.
3. Implement the Forgot Password flow with a time-limited token and an in-app "Simulated Email Outbox Drawer" so any user or evaluator can click the dispatched reset link directly inside the UI and reset their password end-to-end.
4. Enforce strict Role-Based Access Control (RBAC) across both middleware/API routes and UI navigation:
   - Only ADMIN can create/manage Internal Staff members, Products/Variants, Plans, Tax Rules, and Discount Rules.
   - INTERNAL_STAFF can manage quotes, subscriptions, billing runs, invoices, payments, and finance views, with Admin-only buttons disabled/hidden and protected on the server.
   - CUSTOMER is strictly scoped to the Customer Self-Service Portal seeing only their own subscriptions, quotes, invoices, and payments.
5. Add a floating "Demo Persona & RBAC Switcher" in the top bar for instant testing across Admin, Staff, and Customer accounts.
```

### Phase 3 Prompt: Product Catalog, Odoo (+560) Variant Engine, Plans & Quote-to-Subscription Workflow
```markdown
Execute Phase 3 of Brightloop OS:
1. Build the Admin Product & Variant Manager: create/edit products with name, type, sales price, cost price, margin badge, notes, and dynamic attribute variants (pre-configured with Brand: "Odoo" adding +560 to the base price).
2. Build the Admin Recurring Plan Builder: configure Daily, Weekly, Monthly, or Yearly billing intervals, minimum quantity, availability start/end dates, and the 4 granular lifecycle toggles (Auto-close on expiry, Allow early close, Allow pause, Allow renewal).
3. Build the Quotation Template Manager & Quote-to-Subscription Studio:
   - Allow Sales Reps (Staff/Admin) to create a subscription in 1 click from a Quotation Template with automatic validity dates and payment terms.
   - Dynamically calculate line items (Product base price + Variant delta + automatic Tax Rules - eligible Discount Rules) and enforce plan minimum quantities.
   - Implement the visual 5-stage state machine bar (`Draft -> Quotation -> Confirmed -> Active -> Closed`, plus `Paused` when permitted by the plan) with audit logging on every transition.
4. Integrate Novel Feature #1 (Chronos™ Billing Time-Machine): add an interactive timeline scrubber inside the Subscription view that previews exact future invoices, proration, and discount expirations across the next 12 billing cycles.
```

### Phase 4 Prompt: Idempotent Batch Billing Engine, Tax/Discount Automation & Printable Invoices
```markdown
Execute Phase 4 of Brightloop OS:
1. Build the Admin Tax Rules & Admin Discount Rules consoles:
   - Discount rules support Fixed Amount or Percentage, minimum purchase or seat quantity, start/end dates, maximum usage limits, and Product-specific vs. Whole-Subscription scope.
2. Build the "Billing Day" Batch Billing Engine & Novel Feature #2 (Zero-Leakage Cryptographic Idempotency Ledger):
   - In 1 click, process all ACTIVE subscriptions due for billing.
   - Automatically evaluate and apply eligible Discount Rules (decrementing remaining usage and automatically stopping when expired or exhausted) and Tax Rules.
   - Automatically transition expired subscriptions to CLOSED if `plan.autoCloseOnExpiry` is enabled.
   - Enforce deterministic idempotency (`subscriptionId + billingCycleKey`) and SHA-256 hash chaining so no subscription can ever be billed twice or skipped—even if triggered repeatedly on the same day.
3. Build the Invoice Management Console:
   - Support the full `Draft -> Confirmed -> Paid` (and `Cancelled`) lifecycle.
   - Implement Confirm, Cancel, Send (via Simulated Email Outbox), and a pixel-perfect Printable / Downloadable PDF Tax Invoice view.
```

### Phase 5 Prompt: Multi-Method Payments, Smart Reconciliation & Customer Self-Service Portal
```markdown
Execute Phase 5 of Brightloop OS:
1. Build the Payments & Accounts Receivable Console:
   - Record payments with Method (Bank Transfer, Card, Wire, UPI/ACH, Check, Cash), Amount, Date, and Notes against any Confirmed invoice.
   - Automatically update invoice balances (`amountPaid`, `amountDue`) and transition fully paid invoices to `PAID`.
   - Implement Novel Feature #4 (AI-Assisted Bank Statement Reconciliation): allow staff to paste or upload raw bank statement rows and automatically match them to outstanding/overdue invoices with 1-click confirmation.
2. Build the Customer Self-Service Portal (`CUSTOMER` role view):
   - Allow customers to view their active subscriptions, accept open quotations, toggle add-ons, and download/pay invoices without emailing support.
   - Enforce plan-level rules: only show "Pause", "Close Early", or "Renew" buttons if the underlying Plan permits them.
   - Integrate Novel Feature #3 (Elastic Seat Smart-Ramp Optimizer showing how many seats unlock the next volume discount tier) and Novel Feature #5 (Self-Healing Pause-Instead-of-Churn Micro-Contract workflow).
```

### Phase 6 Prompt: Finance Lead Command Center & Sub-2-Second Performance Benchmark
```markdown
Execute Phase 6 of Brightloop OS:
1. Build the Finance Executive Command Center ("End of the Month" Dashboard):
   - Display real-time KPIs: Active Subscriptions, MRR/ARR, Collected Revenue, Outstanding AR (Still Owed), Overdue Invoices count & value, and Discount Utilization.
   - Provide instant multi-faceted filtering by Date Range, Plan Frequency, Brand Variant, Customer, and Overdue Status, plus an interactive Overdue Dunning worklist.
2. Build the Performance & Scale Verification Suite:
   - Add a 1-click "Simulate 2,500 Subscriptions & Run Benchmark" stress test that measures and displays server query latency (`ms`) in a live telemetry pill, proving that every page, filter, and summary view responds in well under 2 seconds.
3. Run a full end-to-end verification pass across all 7 Brightloop scenes, ensuring zero TypeScript/build errors, responsive layout polish, and complete functional integrity.
```

---

## Part 3: Architecture & Novelty Blueprint Matrix

| Brightloop Scene | Core Requirement Addressed | International-Market Novelty Added | Technical Backbone & Safeguard |
| :--- | :--- | :--- | :--- |
| **1. New Customer Signs Up** | Unique email, `>8` chars + Upper + Lower + Special password, email reset link, 3-tier RBAC (`Admin`, `Staff`, `Customer`), Admin-only staff creation | **In-App Simulated SMTP Outbox + Instant RBAC Persona Switcher** for zero-friction verification | Argon2/bcrypt hashing, signed reset tokens, server-side RBAC guards on every route & action |
| **2. Launching a New Plan** | Products with sales/cost price, notes, variants (`Odoo` Brand = `+560`), Plans (`Daily/Weekly/Monthly/Yearly`), min qty, availability dates, lifecycle rules | **Live Margin & Variant Delta Calculator** showing real-time gross margin impact across variants | Decimal arithmetic (`DECIMAL(18,4)`), composite variant pricing engine, plan policy bitflags |
| **3. Quote to Subscription** | Reusable Quotation Templates, validity days, sequenced `SUB-XXXX`, payment terms, 5-stage state machine (`Draft` $\to$ `Quotation` $\to$ `Confirmed` $\to$ `Active` $\to$ `Closed`) | **Chronos™ Interactive Billing Time-Machine** to scrub forward in time and preview future invoices & proration | Deterministic state machine transitions with immutable audit trail and quote expiration checks |
| **4. Billing Day** | Automated batch invoicing for hundreds of due subscriptions, automatic Admin tax rules, `Draft` $\to$ `Confirmed` $\to$ `Paid`, Confirm/Cancel/Send/Print, zero double-billing | **Zero-Leakage Cryptographic Idempotency Ledger** (SHA-256 hash-chained billing cycles) | `UNIQUE(subscription_id, billing_cycle_key)` + transactional locking prevents duplicate or skipped invoices |
| **5. Better Price (Discounts)** | Admin-only discount rules (fixed/%, min qty/purchase, start/end dates, max usage limit, product vs. subscription scope), auto-apply & auto-stop | **Elastic Seat Smart-Ramp Optimizer** (proactively calculates net savings if customer adds seats to hit next tier) | Atomic usage counter increments during billing runs; automatic expiration cutoff |
| **6. The Money Comes In** | Record payments (method, amount, date, note) against invoices, real-time Paid vs. Outstanding & Overdue tracking | **Probabilistic Bank-Statement Matcher & Split-Payment Solver** for instant reconciliation | Subset-sum & reference matching engine; automatic `CONFIRMED` $\to$ `PAID` state transition |
| **7. Finance Lead Review** | Unified dashboard for active subscriptions, revenue in, revenue owed, overdue invoices, rich filters, **< 2-second response** with thousands of records | **Live Query Telemetry HUD & 2,500-Subscription Stress-Test Engine** + **Self-Healing Pause Micro-Contracts** | Composite DB indexes, server-side aggregation, and virtualized tables (`<200ms` p95 latency) |
