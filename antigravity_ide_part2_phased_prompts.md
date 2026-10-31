# Antigravity IDE — Part 2: Ultra-Detailed Phased Execution Prompts (Phases 1 to 6)

> **How to Use in Antigravity IDE:**
> Copy and paste each phase below **one at a time** into the Antigravity IDE Agent chat. Wait for the agent to complete and verify the build for each phase before sending the next prompt. Every prompt below contains exact file paths, mathematical formulas, state transition rules, UI component architectures, and acceptance checks so the agent builds a complete, production-ready system without placeholders.

---

## PHASE 1 PROMPT: Project Foundation, Indexed Database Architecture & High-Speed Seed Engine

```markdown
You are acting as a Principal Full-Stack Architect and Staff Backend Engineer. We are executing **Phase 1** of **Brightloop OS** (the Subscription Management, Recurring Billing & Autonomous Revenue Platform for Brightloop Software).

### OBJECTIVE
Initialize the production application architecture, implement the complete normalized database schema (or transactional in-memory/SQLite/PostgreSQL persistence layer with composite indexes), build the exact financial math utilities (`Decimal`-safe), and create a deterministic Seed & Stress-Test Engine that pre-populates Brightloop Software's full operational dataset plus a 2,500-subscription high-volume benchmark generator.

### 1. CORE DATA MODELS & INDEXED SCHEMA
Create a strongly typed schema and data access layer (`src/lib/db/schema.ts` & `src/lib/db/store.ts` or `prisma/schema.prisma`) supporting the following entities and constraints:

1. **Users & RBAC (`users`)**:
   - `id`, `email` (Strictly `UNIQUE`, lowercase-normalized), `passwordHash`, `fullName`, `companyName`, `role` (`'ADMIN' | 'INTERNAL_STAFF' | 'CUSTOMER'`), `isActive`, `resetToken`, `resetTokenExpiresAt`, `createdAt`.
   - Pre-seed 3 switchable accounts:
     - Admin: `elena.vance@brightloop.io` (`Role: ADMIN`)
     - Internal Staff: `marcus.chen@brightloop.io` (`Role: INTERNAL_STAFF`)
     - Customer: `billing@acmecorp.com` (`Role: CUSTOMER`, plus 12 additional realistic B2B customer accounts).

2. **Products & Dynamic Attribute Variants (`products`, `product_variants`)**:
   - `Product`: `id`, `sku` (`UNIQUE`), `name`, `type` (`'SUBSCRIPTION_SOFTWARE' | 'ADD_ON' | 'SERVICE'`), `salesPrice` (number/Decimal), `costPrice` (number/Decimal), `notes`, `isActive`.
   - `ProductVariant`: `id`, `productId`, `attributeName` (e.g., `'Brand'`, `'Deployment'`, `'Support Tier'`), `attributeValue` (e.g., `'Odoo'`, `'Standard'`, `'Dedicated Cloud'`), `priceDelta` (exact additive price modifier).
   - **Mandatory Brightloop Scene Requirement**: Include the flagship product `"Brightloop Core ERP Suite"` with a `'Brand'` variant where choosing `'Odoo'` adds exactly **`+560.00`** to the unit sales price (`effectiveUnitPrice = product.salesPrice + variant.priceDelta`).

3. **Recurring Plans (`plans`)**:
   - `id`, `code`, `name`, `price`, `billingPeriod` (`'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'`), `intervalCount` (default `1`), `minQuantity` (integer >= 1), `availableFrom` (ISO date), `availableTo` (ISO date or null).
   - **4 Plan-by-Plan Lifecycle Governance Flags (Admin-controlled booleans)**:
     - `autoCloseOnExpiry`: boolean (if true, billing engine automatically transitions subscription to `CLOSED` when `currentDate >= expiryDate`)
     - `allowEarlyClose`: boolean (permits early termination before `expiryDate`)
     - `allowPause`: boolean (permits pausing an `ACTIVE` subscription and shifting `expiryDate` and `nextBillingDate` forward)
     - `allowRenewal`: boolean (permits manual/automatic renewal into a new contract term)

4. **Quotation Templates (`quotation_templates`)**:
   - `id`, `name`, `description`, `planId`, `validityDays` (e.g., `14`, `30`), `paymentTerms` (`'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_45'`), `defaultLines` (array of `{ productId, variantId, quantity, description }`).

5. **Tax Rules (`tax_rules`)**:
   - `id`, `name` (e.g., `'GST / VAT Standard 18%'`, `'Digital Services SaaS Tax 8.5%'`, `'Zero-Rated Export 0%'`), `ratePercent`, `fixedFee`, `appliesToProductType` (`'ALL' | 'SUBSCRIPTION_SOFTWARE' | 'ADD_ON' | 'SERVICE'`), `region`, `isActive`.

6. **Discount Rules (`discount_rules`)**:
   - `id`, `code`, `name`, `type` (`'PERCENTAGE' | 'FIXED_AMOUNT'`), `value`, `scope` (`'ENTIRE_SUBSCRIPTION' | 'SPECIFIC_PRODUCTS'`), `applicableProductIds` (string[]), `minPurchaseAmount`, `minQuantity` (minimum seats/units), `startDate`, `endDate`, `maxUsageLimit` (integer), `currentUsageCount` (integer), `isActive`.

7. **Subscriptions & Subscription Lines (`subscriptions`, `subscription_lines`)**:
   - `id`, `subscriptionNumber` (`UNIQUE`, formatted `SUB-2026-XXXX`), `customerId`, `planId`, `templateId`, `status` (`'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED'`), `startDate`, `expiryDate`, `nextBillingDate`, `quoteValidUntil`, `paymentTerms`, `discountRuleId`, `pausedAt`, `totalPausedDays`, `subtotal`, `discountTotal`, `taxTotal`, `grandTotal`, `notes`, `createdAt`, `updatedAt`.
   - `SubscriptionLine`: `id`, `subscriptionId`, `productId`, `variantId`, `productName`, `variantLabel`, `quantity`, `baseUnitPrice`, `variantDelta`, `unitPrice` (`baseUnitPrice + variantDelta`), `taxRuleId`, `taxRatePercent`, `taxAmount`, `discountAmount`, `lineSubtotal`, `lineTotal`.
   - **Composite Indexes**: Index by `(status, nextBillingDate)` and `(customerId, status)` for `<50ms` lookup across thousands of rows.

8. **Invoices, Invoice Lines & Cryptographic Ledger (`invoices`, `invoice_lines`, `audit_ledger`)**:
   - `Invoice`: `id`, `invoiceNumber` (`UNIQUE`, formatted `INV-2026-XXXXX`), `subscriptionId`, `customerId`, `billingCycleKey` (`UNIQUE` per `subscriptionId`, e.g., `${subscriptionId}_${periodStart}_${periodEnd}`), `periodStart`, `periodEnd`, `issueDate`, `dueDate`, `status` (`'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED'`), `subtotal`, `discountAppliedId`, `discountTotal`, `taxTotal`, `grandTotal`, `amountPaid`, `amountDue`, `ledgerHash` (SHA-256), `previousLedgerHash` (SHA-256), `sentAt`, `paidAt`.
   - `Payment`: `id`, `paymentNumber` (`PAY-2026-XXXXX`), `invoiceId`, `customerId`, `method` (`'BANK_TRANSFER' | 'CREDIT_CARD' | 'WIRE' | 'UPI_ACH' | 'CHECK' | 'CASH'`), `amount`, `paymentDate`, `reference`, `notes`, `recordedBy`.
   - `SimulatedEmailOutbox`: `id`, `toEmail`, `subject`, `category` (`'PASSWORD_RESET' | 'INVOICE_DISPATCH' | 'QUOTE_SENT' | 'OVERDUE_REMINDER'`), `htmlPreview`, `actionUrl`, `createdAt`, `isRead`.

### 2. FINANCIAL MATH & CRYPTOGRAPHIC HASH ENGINE (`src/lib/finance/engine.ts`)
- Build pure, deterministic calculation helpers that round strictly to 2 decimal places using integer minor-unit arithmetic (`Math.round((val + Number.EPSILON) * 100) / 100`).
- Build the SHA-256 Hash-Chain generator:
  `computeLedgerHash(prevHash, subscriptionId, billingCycleKey, grandTotal, timestamp)` so every generated invoice links cryptographically to the prior invoice and guarantees zero double-billing.

### 3. DELIVERABLES FOR PHASE 1
- Complete project setup, global layout shell with "Precision FinTech Industrial" styling (slate/obsidian palette, tabular numerals, crisp 1px borders), and the persistent data store + API layer.
- Verify that the project compiles cleanly with zero TypeScript errors before moving to Phase 2.
```

---

## PHASE 2 PROMPT: Identity, Strict Password Policy, Simulated Email Outbox & 3-Tier RBAC

```markdown
We are now executing **Phase 2** of **Brightloop OS**: Identity, Authentication, Password Reset Flow, and 3-Tier Role-Based Access Control (Scene 1: "A new customer signs up").

### OBJECTIVE
Build the complete authentication experience, real-time password policy enforcement, password reset workflow with an interactive in-app Email Outbox Drawer, Admin-only Staff Management console, and a floating Demo Persona Switcher.

### 1. SIGN-UP, LOGIN & PASSWORD POLICY VALIDATOR
1. **Unique Email Enforcement**:
   - Check email uniqueness case-insensitively on both client blur and server submission. If an email already exists, return a clear validation error: `"An account with this email address already exists at Brightloop."`
2. **Strict Password Policy Engine**:
   - Enforce the exact Brightloop rule on Sign-Up and Password Reset:
     - **More than 8 characters** (`password.length >= 9`)
     - **At least 1 uppercase letter** (`/[A-Z]/`)
     - **At least 1 lowercase letter** (`/[a-z]/`)
     - **At least 1 special character** (`/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/`)
   - Render a live 4-pill visual checklist under the password field that turns emerald green as each rule is satisfied, and block submission until all 4 rules pass.
3. **Forgot Password & In-App Simulated Email Outbox**:
   - When a user submits their registered email on `"Forgot Password"`, generate a single-use cryptographic reset token (`resetToken`, valid for 15 minutes) and dispatch a reset email into the **Simulated Email Outbox Drawer** (accessible via a top-nav mail icon with an unread badge counter).
   - Clicking `"Reset My Password"` inside that email opens the Reset Password view, verifies the token, enforces the 4 password rules, updates the password hash, and invalidates the token.

### 2. THREE-TIER ROLE-BASED ACCESS CONTROL (RBAC)
Enforce role permissions across navigation, UI action buttons, and API handlers:
- **`ADMIN` (Full Platform Control)**:
  - Exclusive access to: **Staff Management (`Add New Staff Member`)**, **Product & Variant Creation/Editing**, **Recurring Plan Configuration**, **Tax Rule Configuration**, and **Discount Rule Configuration**.
- **`INTERNAL_STAFF` (Day-to-Day Operations)**:
  - Access to: **Quotation Templates & Subscriptions**, **Billing Day Batch Engine**, **Invoices (Confirm, Cancel, Send, Print)**, **Payments & Bank Reconciliation**, and **Finance Overview**.
  - Must **NOT** be able to add staff, create/edit plans, create/edit products, or create/edit tax and discount rules (show a locked `"Admin Only"` badge and reject unauthorized API mutations with `403 Forbidden`).
- **`CUSTOMER` (Isolated Self-Service Portal)**:
  - Strictly scoped to `customerId === currentUser.id`.
  - Sees only their own Quotations, Active/Paused/Closed Subscriptions, Invoices, Payment History, Add-On Toggles, and Smart-Ramp Discount Optimizer.

### 3. PERSISTENT TOP-BAR PERSONA SWITCHER & STAFF CREATOR
- Build a top-header **Live Role & Persona Switcher** allowing 1-click switching between:
  1. `Elena Vance (ADMIN)`
  2. `Marcus Chen (INTERNAL_STAFF)`
  3. `Acme Corp (CUSTOMER)`
  4. `Sign Up / Auth Modal (Test New Customer Registration & Password Reset)`
- Build the **Internal Staff Management Modal/Page** (accessible only to `ADMIN`) where the Admin can add a new staff member with name, unique email, department, and compliant password.
```

---

## PHASE 3 PROMPT: Product Catalog (+560 Odoo Variant), Recurring Plans, Quote-to-Subscription & Chronos™ Time-Machine

```markdown
We are now executing **Phase 3** of **Brightloop OS**: Products, Variants, Recurring Plans, Quotation Templates, the 5-Stage Subscription Lifecycle, and **Novel Feature #1: Chronos™ Interactive Billing Time-Machine** (Scenes 2 & 3).

### OBJECTIVE
Build the complete catalog and subscription lifecycle engine so Brightloop Admins can launch products/variants and plans, Sales Reps can convert quotation templates into sequenced subscriptions in one click, and users can scrub forward in time with Chronos™ to preview future billing cycles.

### 1. PRODUCT & DYNAMIC VARIANT ENGINE (`ADMIN` Write, `STAFF` Read)
- Create a Product Management view displaying: `Name`, `SKU`, `Product Type` (`Subscription Software`, `Add-On`, `Service`), `Base Sales Price`, `Cost Price`, **Live Gross Margin % Badge** (`((salesPrice - costPrice) / salesPrice) * 100`), `Internal Notes`, and `Variants`.
- **Dynamic Attribute Variant Builder**:
  - Allow adding variants by attribute (e.g., `Brand`, `Edition`, `Deployment`).
  - Pre-configure and highlight the exact scenario from the brief: **Brand: `Odoo` $\rightarrow$ Price Delta: `+560.00`** (alongside `Standard [+0]` and `Enterprise Cloud [+1,200]`).
  - Whenever a product + variant is selected on a Quotation Template or Subscription Line, automatically compute `Unit Price = Base Sales Price + Variant Price Delta` and recalculate line taxes and totals immediately.

### 2. RECURRING PLAN ENGINE (`ADMIN` Write, `STAFF` Read)
- Build the Plan Configuration studio with:
  - `Plan Name & Code`, `Base Plan Fee`, `Billing Frequency` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), `Minimum Seat/Unit Quantity`, and `Availability Window` (`availableFrom` to `availableTo`).
  - **4 Granular Lifecycle Governance Switches (Plan-by-Plan)**:
    - `[x] Auto-Close on Expiry` (closes automatically when contract end date is reached)
    - `[x] Allow Early Closure` (can be closed prior to expiry)
    - `[x] Allow Pause / Resume` (can pause billing and shift dates)
    - `[x] Allow Renewal` (can renew into a subsequent term)
  - Display visual policy badges on every plan card so staff and customers immediately know which lifecycle actions are permitted.

### 3. QUOTATION TEMPLATES & 5-STAGE SUBSCRIPTION STATE MACHINE
1. **1-Click Quote Instantiation**:
   - Sales reps select a **Quotation Template** (which pre-fills the Plan, Validity Days, Payment Terms, and default Product/Variant lines), choose a Customer, and click `"Create Quotation from Template"`.
   - Enforce `line.quantity >= plan.minQuantity` and verify the current date is within `plan.availableFrom` and `plan.availableTo`.
2. **Subscription Record & Visual 5-Stage Pipeline**:
   - Auto-assign a sequential number (`SUB-2026-0001`, `SUB-2026-0002`, etc.).
   - Display a prominent interactive **5-Stage Lifecycle Stepper**:
     `1. DRAFT` $\longrightarrow$ `2. QUOTATION (Valid for N Days)` $\longrightarrow$ `3. CONFIRMED` $\longrightarrow$ `4. ACTIVE` $\longrightarrow$ `5. CLOSED` (plus conditional `PAUSED` badge if `plan.allowPause` is true).
   - Provide contextual action buttons at each stage (`Send Quotation`, `Confirm Order`, `Activate Subscription`, `Pause Billing` [if plan allows], `Resume`, `Renew` [if plan allows], `Close Subscription` [if plan allows early close or expired]).

### 4. NOVEL FEATURE #1: CHRONOS™ INTERACTIVE BILLING TIME-MACHINE
- Embed a **"Chronos™ Future Billing Simulator"** panel inside the Subscription & Quote detail drawer.
- Include an interactive timeline slider (`Today`, `+1 Month`, `+3 Months`, `+6 Months`, `+12 Months / Expiry`) and what-if simulation toggles (`Simulate +5 Extra Seats`, `Toggle Add-On`, `Simulate 15-Day Pause`).
- As the user drags the timeline slider, dynamically render the projected timeline of future invoices, showing exact future billing dates, when a time-limited discount will automatically drop off, when `autoCloseOnExpiry` will trigger, and total projected contract value (TCV).
```

---

## PHASE 4 PROMPT: Zero-Touch Batch Billing Day Engine, Cryptographic Idempotency Ledger, Taxes, Discounts & Printable Invoices

```markdown
We are now executing **Phase 4** of **Brightloop OS**: Automated Batch Billing Day, Admin Tax & Discount Engines, Invoice Lifecycle, and **Novel Feature #2: Zero-Leakage Cryptographic Idempotency Ledger** (Scenes 4 & 5).

### OBJECTIVE
Eliminate manual invoice typing forever. Build the Admin Tax & Discount Rule engines, the 1-click "Billing Day" batch generator with cryptographic idempotency (ensuring nothing is ever billed twice or skipped), and the full Invoice workbench (`Draft -> Confirmed -> Paid`) with printable/downloadable tax invoices.

### 1. ADMIN TAX RULES & AUTONOMOUS DISCOUNT ENGINE (`ADMIN` Only)
1. **Tax Rule Configuration**:
   - Create/toggle tax rules with `Name`, `Percentage Rate` (or fixed fee), `Applicable Product Type`, and `Region`. Automatically calculate tax per subscription/invoice line.
2. **Autonomous Discount Rule Engine (Scene 5: "A customer asks for a better price")**:
   - Only `ADMIN` can create or modify Discount Rules:
     - `Discount Type`: Fixed Amount (`$ / ₹`) or Percentage (`%`)
     - `Conditions`: Minimum Purchase Subtotal (`minPurchaseAmount`) OR Minimum Seat/Unit Quantity (`minQuantity`)
     - `Validity Window`: `startDate` and `endDate`
     - `Usage Cap`: `maxUsageLimit` (total times it can be redeemed across invoices) and `currentUsageCount`
     - `Target Scope`: Specific Products (`SPECIFIC_PRODUCTS`) or Whole Subscription (`ENTIRE_SUBSCRIPTION`)
   - **Self-Applying & Self-Stopping Logic**:
     - When an eligible discount is attached to a subscription (or auto-matched by seat count), the Billing Engine automatically applies it on the next generated invoice and increments `currentUsageCount`.
     - If `billingDate > discount.endDate` OR `discount.currentUsageCount >= discount.maxUsageLimit`, the engine automatically stops applying the discount and logs an explanation note on the invoice (`"Discount VOL-15 expired/exhausted — reverted to standard rate"`).

### 2. "BILLING DAY" BATCH ENGINE & NOVELTY #2: CRYPTOGRAPHIC IDEMPOTENCY LEDGER
- Build a dedicated **"Billing Day Command Center"** where Staff/Admin can select a Target Billing Date (defaulting to Today or simulating next month's billing run) and click **"Execute Batch Billing Run"**.
- **Engine Execution Pipeline**:
  1. Scan all `ACTIVE` subscriptions.
  2. For subscriptions where `currentDate >= expiryDate` and `plan.autoCloseOnExpiry === true`, automatically transition status to `CLOSED` and log the lifecycle event.
  3. For all `ACTIVE` subscriptions where `nextBillingDate <= targetBillingDate`:
     - Compute deterministic `billingCycleKey = "${subscription.id}_${periodStart}_${periodEnd}"`.
     - **Idempotency Guard**: Check if an invoice with `billingCycleKey` already exists. If it exists, **skip it cleanly with zero duplication** and increment `skippedAlreadyBilledCount`.
     - If not yet billed, generate the pre-populated Invoice with customer details, product/variant lines, automatic tax rules, and valid active discounts, advance `nextBillingDate` by the plan's interval (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), and compute the **SHA-256 Ledger Hash** (`sha256(previousLedgerHash + subscriptionId + billingCycleKey + grandTotal)`).
- Display a live **"Cryptographic Ledger Integrity Badge"** showing: `100% Verified Chain • 0 Double-Bills • 0 Skipped Cycles`. Even if the user clicks "Execute Batch Billing Run" 5 times in a row, prove visually that 0 duplicate invoices are created.

### 3. INVOICE LIFECYCLE & PRINTABLE / DOWNLOADABLE TAX INVOICE
- Each invoice progresses through: `DRAFT` $\longrightarrow$ `CONFIRMED` $\longrightarrow$ `PAID` (with `CANCELLED` branch).
- Provide 1-click actions on every invoice:
  - **Confirm Invoice** (locks invoice numbers & posts to AR ledger)
  - **Cancel Invoice** (voids draft/confirmed invoice with reason)
  - **Send Invoice** (dispatches formatted invoice email into the Simulated Email Outbox Drawer & marks `sentAt`)
  - **Print / Download PDF Invoice** (opens a high-contrast, print-ready tax invoice modal with company letterhead, subscription reference, variant breakdown, discount badge, tax summary, SHA-256 ledger verification seal, and `window.print()` / PDF export).
```

---

## PHASE 5 PROMPT: Multi-Method Payments, Probabilistic Bank Reconciliation & Customer Self-Service Portal

```markdown
We are now executing **Phase 5** of **Brightloop OS**: Payment Recording, AR Overdue Chasing, **Novel Feature #4 (AI-Assisted Bank Statement Reconciliation)**, the **Customer Self-Service Portal**, **Novel Feature #3 (Elastic Seat Smart-Ramp Optimizer)**, and **Novel Feature #5 (Self-Healing Pause/Renewal Micro-Contracts)** (Scene 6 & Customer Portal).

### OBJECTIVE
Connect the cash collection loop so every incoming payment is matched to the right invoice, overdue invoices are surfaced before they become lost revenue, and customers can self-manage their own subscriptions, add-ons, seats, and invoices without emailing anyone.

### 1. MULTI-METHOD PAYMENTS & OVERDUE AR WORKBENCH (Scene 6: "The money comes in")
1. **Record Payment Modal & Drawer**:
   - Allow Staff/Admin (and Customer via Portal Checkout) to record a payment against any `CONFIRMED` invoice with:
     - `Payment Method`: Bank Transfer, Credit Card, Wire, UPI / ACH, Check, or Cash
     - `Amount` (supports full payment or partial installment payment)
     - `Payment Date`, `Reference Number`, and `Audit Note`.
   - Automatically recalculate `invoice.amountPaid` and `invoice.amountDue`. When `amountDue === 0`, automatically transition the invoice status to `PAID`.
2. **Paid vs. Outstanding vs. Overdue Segmentation**:
   - Provide instant filter tabs on the Invoices & Payments view: `All`, `Paid`, `Outstanding (Current)`, and `Overdue (Past Due Date)` with 1-click **"Send Overdue Dunning Notice"** (dispatches reminder to the Email Outbox and logs follow-up).

### 2. NOVEL FEATURE #4: PROBABILISTIC BANK-STATEMENT & SPLIT-PAYMENT MATCHER
- Build an interactive **"Smart Bank Statement Reconciler"** panel inside the Payments tab.
- Provide pre-loaded realistic raw bank statement lines (or allow pasting custom CSV lines) containing messy descriptions, lumped wire amounts (e.g., one wire covering two separate invoices for the same customer), or missing invoice numbers.
- Run a deterministic + subset-sum matching algorithm that scores each bank row against open `CONFIRMED` invoices by customer name similarity, exact/combined invoice totals, and date proximity, displaying a confidence badge (`99% Exact Match`, `94% Multi-Invoice Split Match`) and a **"Reconcile & Mark Paid in 1 Click"** button.

### 3. CUSTOMER SELF-SERVICE PORTAL (`CUSTOMER` Role View)
When logged in as (or switched to) a `CUSTOMER`, render a dedicated, clean **Customer Self-Service Portal** featuring:
1. **My Subscriptions & Plan-Governed Controls**:
   - View active/paused/quoted subscriptions, billing frequency, next renewal date, and itemized lines.
   - **Self-Service Add-On & Seat Switcher**: Customers can toggle optional Add-On products on/off or adjust seat quantities directly, immediately seeing the updated recurring price.
   - **Plan-Governed Lifecycle Actions**:
     - Show **"Accept Quotation"** if status is `QUOTATION`.
     - Show **"Pause Subscription"** only if `plan.allowPause === true`.
     - Show **"Renew Subscription"** only if `plan.allowRenewal === true`.
     - Show **"Close / Cancel Early"** only if `plan.allowEarlyClose === true`.
2. **Novel Feature #3: Elastic Seat Smart-Ramp Optimizer**:
   - Automatically compare the customer's current seat count/spend against active Admin Discount Rules. Display an interactive recommendation card in the portal: e.g., *"Smart-Ramp Opportunity: You currently have 8 seats. Adding 2 more seats unlocks the 'Enterprise 10+ Seats 15% Discount', lowering your effective per-seat cost and saving $640/year!"* with a **"Preview & Upgrade"** button.
3. **Novel Feature #5: Self-Healing Pause-Instead-of-Churn Micro-Contract**:
   - When a customer on a pause-eligible plan clicks `"Close / Cancel Early"`, intercept churn with a **Self-Healing Retention Modal** offering a 1-click **30-Day Billing Pause** that freezes charges immediately and automatically extends `expiryDate` and `nextBillingDate` by 30 days.
4. **My Invoices & Payments**:
   - Customers can view only their own invoices (`CONFIRMED`, `PAID`, `OVERDUE`), pay an open invoice online in 1 click, or open the Printable Tax Invoice.
```

---

## PHASE 6 PROMPT: Finance Lead Executive Command Center & Sub-2-Second Scale Benchmark

```markdown
We are now executing **Phase 6 (Final Phase)** of **Brightloop OS**: The Finance Lead Month-End Command Center, Multi-Dimensional Analytics, and the **<2-Second High-Volume Performance Benchmark Suite** (Scene 7: "The finance lead, at the end of the month").

### OBJECTIVE
Deliver a single executive command center that answers every question the finance lead has in milliseconds—even with thousands of subscriptions on the books—and verify the entire application end-to-end.

### 1. FINANCE LEAD EXECUTIVE COMMAND CENTER
Build the comprehensive Finance & Revenue Analytics dashboard featuring:
1. **Top-Line Financial Telemetry Cards (with Tabular Precision)**:
   - **Active Subscriptions**: Total count + breakdown by `Daily / Weekly / Monthly / Yearly` plans and `Paused / Quoted` pipeline.
   - **Monthly Recurring Revenue (MRR) & ARR**: Normalized recurring run-rate across all active frequencies.
   - **Revenue Collected (Cash In)**: Total verified payments collected in the selected period, broken down by Payment Method.
   - **Total Outstanding AR (Still Owed)**: Total unpaid balance across all `CONFIRMED` invoices (`Current` vs. `Overdue`).
   - **Overdue Invoices Alert Card**: Exact count and dollar value of past-due invoices with a 1-click filter to jump straight to the Overdue Dunning queue.
2. **Multi-Dimensional Instant Filters**:
   - Filter the entire dashboard and summary tables simultaneously by:
     - **Time Period**: `All Time`, `This Month`, `Last Month`, `This Quarter`, `Custom Window`
     - **Billing Frequency**: `All`, `Daily`, `Weekly`, `Monthly`, `Yearly`
     - **Brand / Variant**: `All`, `Odoo (+560)`, `Standard`, `Enterprise Cloud`
     - **Invoice / AR Status**: `All`, `Paid`, `Outstanding`, `Overdue`
3. **Visual Revenue & Aging Charts**:
   - Monthly Revenue Collected vs. Outstanding AR stacked bar chart.
   - Accounts Receivable Aging Buckets (`Current`, `1–30 Days Overdue`, `31–60 Days Overdue`, `60+ Days Overdue`).
   - Product & Variant Revenue Contribution breakdown (highlighting the `Odoo` variant margin contribution).

### 2. SUB-2-SECOND HIGH-VOLUME BENCHMARK ENGINE (THOUSANDS OF SUBSCRIPTIONS SLA)
- To prove compliance with *"With thousands of subscriptions on the books, every page should still respond in under two seconds"*:
  - Add a **"Scale & Latency Stress-Test Bar"** in the Finance Command Center and Header.
  - Include a **"Seed 2,500 Subscriptions & 5,000 Invoices"** button (and a `"Reset to Default Demo Data"` button).
  - Implement high-efficiency indexed filtering, memoized aggregation, and paginated/virtualized table rendering so that even when 2,500+ subscriptions and 5,000+ invoices are active in state, every page transition, filter change, and summary calculation completes in **< 150ms** (well under the 2,000ms threshold).
  - Display a live **Query Execution Telemetry Pill** (e.g., `Query Latency: 14.2 ms | 2,518 Subscriptions Indexed | SLA < 2000ms PASS`) that updates on every filter or search action.

### 3. FINAL END-TO-END AUDIT CHECKLIST
Verify that:
- [ ] New customer sign-up enforces unique email and `>8` chars + upper + lower + special password, and password reset works via the in-app Email Outbox.
- [ ] `ADMIN`, `INTERNAL_STAFF`, and `CUSTOMER` roles see only their authorized views and actions, and only `ADMIN` can add staff, products, plans, taxes, and discounts.
- [ ] Choosing the `Odoo` brand variant adds `+560` to the product price automatically.
- [ ] Subscriptions progress cleanly through `Draft -> Quotation -> Confirmed -> Active -> Closed` and support Chronos™ future billing simulation.
- [ ] Billing Day creates all due invoices in one batch with automatic taxes and discounts, never double-bills or skips via the SHA-256 Idempotency Ledger, and supports Confirm, Cancel, Send, and Print PDF.
- [ ] Discounts apply automatically when eligible and stop automatically when expired or usage-exhausted.
- [ ] Payments record method, amount, date, and note against invoices, reconcile via the Smart Bank Matcher, and update Paid vs. Overdue balances in real time.
- [ ] Finance Command Center loads and filters thousands of subscriptions in well under 2 seconds.
```
