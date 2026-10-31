export type Role = 'ADMIN' | 'INTERNAL_STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  companyName: string;
  role: Role;
  isActive: boolean;
  department?: string;
  resetToken?: string;
  resetTokenExpiresAt?: string;
  createdAt: string;
}

export type ProductType = 'SUBSCRIPTION_SOFTWARE' | 'ADD_ON' | 'SERVICE';

export interface ProductVariant {
  id: string;
  productId: string;
  attributeName: string; // e.g. 'Brand'
  attributeValue: string; // e.g. 'Odoo'
  priceDelta: number; // e.g. +560.00
  skuSuffix: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes: string;
  isActive: boolean;
  variants: ProductVariant[];
}

export type BillingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Plan {
  id: string;
  code: string;
  name: string;
  price: number;
  billingPeriod: BillingPeriod;
  intervalCount: number;
  minQuantity: number;
  availableFrom: string;
  availableTo?: string | null;
  autoCloseOnExpiry: boolean;
  allowEarlyClose: boolean;
  allowPause: boolean;
  allowRenewal: boolean;
  isActive: boolean;
}

export type PaymentTerms = 'IMMEDIATE' | 'NET_15' | 'NET_30' | 'NET_45';

export interface QuotationTemplateLine {
  productId: string;
  variantId?: string;
  quantity: number;
  description: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  planId: string;
  validityDays: number;
  paymentTerms: PaymentTerms;
  defaultLines: QuotationTemplateLine[];
}

export interface TaxRule {
  id: string;
  name: string;
  ratePercent: number;
  fixedFee: number;
  appliesToProductType: 'ALL' | ProductType;
  region: string;
  isActive: boolean;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type DiscountScope = 'ENTIRE_SUBSCRIPTION' | 'SPECIFIC_PRODUCTS';

export interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  applicableProductIds: string[];
  minPurchaseAmount: number;
  minQuantity: number;
  startDate: string;
  endDate: string;
  maxUsageLimit: number;
  currentUsageCount: number;
  isActive: boolean;
}

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface SubscriptionLine {
  id: string;
  subscriptionId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantLabel?: string;
  quantity: number;
  baseUnitPrice: number;
  variantDelta: number;
  unitPrice: number;
  taxRuleId?: string;
  taxRatePercent: number;
  taxAmount: number;
  discountAmount: number;
  lineSubtotal: number;
  lineTotal: number;
}

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  planId: string;
  planName?: string;
  templateId?: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  nextBillingDate: string;
  quoteValidUntil?: string;
  paymentTerms: PaymentTerms;
  discountRuleId?: string;
  pausedAt?: string;
  totalPausedDays: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lines: SubscriptionLine[];
}

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  productId: string;
  variantName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxName: string;
  taxAmount: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  subscriptionNumber?: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  billingCycleKey: string;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  subtotal: number;
  discountAppliedId?: string;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  ledgerHash: string;
  previousLedgerHash: string;
  sentAt?: string;
  paidAt?: string;
  lines: InvoiceLine[];
}

export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'WIRE' | 'UPI_ACH' | 'CHECK' | 'CASH';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerId: string;
  customerName?: string;
  method: PaymentMethod;
  amount: number;
  paymentDate: string;
  reference: string;
  notes?: string;
  recordedBy: string;
}

export interface OutboxEmail {
  id: string;
  toEmail: string;
  subject: string;
  category: 'PASSWORD_RESET' | 'INVOICE_DISPATCH' | 'QUOTE_SENT' | 'OVERDUE_REMINDER';
  htmlPreview: string;
  actionUrl?: string;
  createdAt: string;
  isRead: boolean;
}

export type SimulatedEmail = OutboxEmail;

export interface AuditLedgerEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorRole: string;
  payloadJson: string;
  cryptographicHash: string;
  previousHash: string;
  createdAt: string;
}

export interface BankStatementRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  reference: string;
  matchedInvoiceIds?: string[];
  matchConfidence?: number;
  matchType?: 'EXACT' | 'SPLIT' | 'FUZZY_NAME';
  status: 'PENDING' | 'RECONCILED' | 'IGNORED';
}

