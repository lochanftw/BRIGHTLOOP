'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/finance/engine';
import {
  FileText,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';

export function InvoicesView() {
  const { showToast, refreshOutbox, setQueryLatencyMs, currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);

  // Record payment modal
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'BANK_TRANSFER' | 'CREDIT_CARD' | 'WIRE' | 'UPI_ACH' | 'CHECK' | 'CASH'>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const fetchInvoices = async () => {
    const start = performance.now();
    try {
      const res = await fetch(`/api/invoices?status=${statusFilter}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.items) {
        setInvoices(data.items);
        setQueryLatencyMs(data.queryLatencyMs);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, searchQuery]);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      if (action === 'SEND') {
        await refreshOutbox();
        showToast('Invoice sent to Simulated Email Outbox!', 'success');
      } else {
        showToast(`Invoice updated: ${action}`, 'success');
      }
      await fetchInvoices();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoice) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payInvoice.id,
          method: payMethod,
          amount: payAmount,
          reference: payRef || `PAY-MANUAL-${Date.now()}`,
          notes: payNotes,
          recordedBy: currentUser.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      showToast(`Payment of ${formatCurrency(payAmount)} recorded!`, 'success');
      setPayInvoice(null);
      await fetchInvoices();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Payment recording failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
            Invoice Management & AR Workbench
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review invoices, confirm draft batches, record multi-method payments, or print official tax invoices.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          {['ALL', 'CONFIRMED', 'PAID', 'DRAFT', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded font-mono text-[11px] transition-colors shrink-0 ${
                statusFilter === s
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Filter by INV-2026, customer or sub..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72 font-mono"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No matching invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isOverdue = inv.status === 'CONFIRMED' && inv.dueDate < today;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300">
                        <div>{inv.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{inv.subscriptionNumber}</div>
                      </td>
                      <td className={`py-3 px-4 font-mono ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {inv.dueDate} {isOverdue && '(OVERDUE)'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : inv.status === 'CONFIRMED'
                              ? isOverdue
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                              : inv.status === 'CANCELLED'
                              ? 'bg-slate-800 text-slate-500 border border-slate-700'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-200">{formatCurrency(inv.grandTotal)}</td>
                      <td className={`py-3 px-4 font-bold ${inv.amountDue > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {formatCurrency(inv.amountDue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'DRAFT' && (
                            <button
                              onClick={() => handleAction(inv.id, 'CONFIRM')}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-sans"
                            >
                              Confirm
                            </button>
                          )}

                          {inv.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => {
                                  setPayInvoice(inv);
                                  setPayAmount(inv.amountDue);
                                }}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-sans flex items-center gap-1"
                              >
                                <DollarSign className="w-3 h-3" />
                                Pay
                              </button>
                              <button
                                onClick={() => handleAction(inv.id, 'SEND')}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans flex items-center gap-1"
                                title="Send to simulated email outbox"
                              >
                                <Send className="w-3 h-3" />
                                Send
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setActivePrintInvoice(inv)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans flex items-center gap-1"
                            title="Print / View Tax Invoice"
                          >
                            <Printer className="w-3 h-3 text-emerald-400" />
                            Print
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-lg font-bold text-slate-100 font-mono mb-1">
              Record Payment against {payInvoice.invoiceNumber}
            </h2>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Balance Due: <strong className="text-emerald-400">{formatCurrency(payInvoice.amountDue)}</strong>
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="BANK_TRANSFER">Bank Wire / ACH Transfer</option>
                  <option value="CREDIT_CARD">Corporate Credit Card</option>
                  <option value="WIRE">SWIFT Wire Transfer</option>
                  <option value="UPI_ACH">UPI / Instant ACH</option>
                  <option value="CHECK">Certified Bank Check</option>
                  <option value="CASH">Cash Deposit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Payment Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={payInvoice.amountDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Bank Reference / Wire Number</label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-FED-992019"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Audit Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Reconciled via accounts portal"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayInvoice(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono shadow-sm"
                >
                  Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pixel-Perfect Printable Tax Invoice Modal */}
      {activePrintInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 my-8 relative print:p-0 print:m-0 print:shadow-none print:w-full">
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-slate-100 font-mono font-bold text-slate-700">
                  PRINT PREVIEW & PDF EXPORT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Tax Invoice
                </button>
                <button
                  onClick={() => setActivePrintInvoice(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tax Invoice Letterhead */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
              <div>
                <h1 className="text-2xl font-black font-mono tracking-tight text-slate-950">
                  BRIGHTLOOP SOFTWARE CORP
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  100 Financial Way, Suite 400 • San Francisco, CA 94105
                </p>
                <p className="text-xs text-slate-500 font-mono">Tax ID: US-EIN-94-3882910 • GSTIN: 27AABCB1234F1Z5</p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xl font-black text-slate-900">OFFICIAL TAX INVOICE</div>
                <div className="text-sm font-bold text-slate-700 mt-1">{activePrintInvoice.invoiceNumber}</div>
                <div className="text-xs text-slate-500 mt-0.5">Issue Date: {activePrintInvoice.issueDate}</div>
                <div className="text-xs text-slate-700 font-bold">Due Date: {activePrintInvoice.dueDate}</div>
              </div>
            </div>

            {/* Bill To & Subscription Info */}
            <div className="grid grid-cols-2 gap-8 my-6 text-xs">
              <div>
                <span className="font-mono text-slate-400 uppercase tracking-wider block mb-1">Billed To:</span>
                <div className="font-bold text-sm text-slate-900">{activePrintInvoice.customerName}</div>
                <div className="text-slate-600 font-mono">{activePrintInvoice.customerEmail}</div>
                <div className="text-slate-500 mt-1">Enterprise Subscription Billing Account</div>
              </div>

              <div className="font-mono">
                <span className="text-slate-400 uppercase tracking-wider block mb-1">Billing Details:</span>
                <div>Subscription Ref: <strong className="text-slate-900">{activePrintInvoice.subscriptionNumber}</strong></div>
                <div>Billing Period: {activePrintInvoice.periodStart} to {activePrintInvoice.periodEnd}</div>
                <div>Status: <span className="font-bold uppercase text-emerald-700">{activePrintInvoice.status}</span></div>
              </div>
            </div>

            {/* Invoice Line Items */}
            <table className="w-full text-xs text-left mb-6 font-mono">
              <thead className="bg-slate-100 text-slate-700 uppercase border-y border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Description & Variant Breakdown</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right">Tax Rate</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activePrintInvoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{l.description}</div>
                      {l.variantName && (
                        <div className="text-[11px] text-slate-600 mt-0.5">{l.variantName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700">{l.quantity}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{formatCurrency(l.unitPrice)}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{l.taxName}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatCurrency(l.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="flex justify-end mb-6 font-mono text-xs">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(activePrintInvoice.subtotal)}</span>
                </div>
                {activePrintInvoice.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Applied:</span>
                    <span>-{formatCurrency(activePrintInvoice.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax (8.5% SaaS):</span>
                  <span>{formatCurrency(activePrintInvoice.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t-2 border-slate-900">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(activePrintInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(activePrintInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-300">
                  <span>Amount Due:</span>
                  <span className="text-emerald-700">{formatCurrency(activePrintInvoice.amountDue)}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Ledger Seal */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero-Leakage Cryptographic Ledger Verification Seal
              </div>
              <div className="truncate">
                SHA-256 Hash: <code className="text-slate-800">{activePrintInvoice.ledgerHash || 'CHAIN_GEN_001'}</code>
              </div>
              <div className="truncate text-slate-500">
                Prev Hash: {activePrintInvoice.previousLedgerHash || 'GENESIS_CHAIN'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
