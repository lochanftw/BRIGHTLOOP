'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Payment, BankStatementRow } from '@/types';
import { formatCurrency } from '@/lib/finance/engine';
import {
  CreditCard,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  Zap,
  ShieldCheck
} from 'lucide-react';

export function PaymentsView() {
  const { currentUser, showToast, setQueryLatencyMs } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bankRows, setBankRows] = useState<BankStatementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  const fetchPaymentsAndBankData = async () => {
    const start = performance.now();
    try {
      const [payRes, bankRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/reconciliation'),
      ]);
      const payData = await payRes.json();
      const bankData = await bankRes.json();

      if (payData.items) setPayments(payData.items);
      if (bankData.items) setBankRows(bankData.items);
      setQueryLatencyMs(round2(performance.now() - start));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  function round2(num: number) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  useEffect(() => {
    fetchPaymentsAndBankData();
  }, []);

  const handleReconcileRow = async (rowId: string) => {
    setReconcilingId(rowId);
    try {
      const res = await fetch('/api/reconciliation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId, actor: currentUser.fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reconciliation failed');

      showToast('Bank wire matched and reconciled! Invoice marked PAID.', 'success');
      await fetchPaymentsAndBankData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Reconciliation failed', 'error');
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
            Payment Records & AI Bank Statement Reconciler
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            AUTO-MATCHING
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Scene 6 & Novelty #4: Multi-method cash collections, subset-sum matching, and 1-click bank statement reconciliation.
        </p>
      </div>

      {/* NOVELTY #4: AI-ASSISTED BANK STATEMENT RECONCILER */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-emerald-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  Smart Bank Statement Reconciler & Split-Payment Solver
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  NOVELTY #4
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Eliminates scrolling through bank statements. Probabilistic subset-sum matcher links deposits to open invoices.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
            3 Unreconciled Wires Detected
          </div>
        </div>

        {/* Bank Statement Rows */}
        <div className="space-y-3 pt-2">
          {bankRows.map((row) => (
            <div
              key={row.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{row.date}</span>
                  <span className="font-bold text-slate-100">{row.description}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Ref: <code className="text-slate-400">{row.reference}</code> | Wire Deposit: <strong className="text-emerald-400 font-bold">{formatCurrency(row.amount)}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.status === 'RECONCILED'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {row.matchConfidence}% Match Confidence
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Target: {row.matchedInvoiceIds?.join(', ') || 'Auto-Solver'}
                  </div>
                </div>

                {row.status === 'RECONCILED' ? (
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Reconciled
                  </span>
                ) : (
                  <button
                    onClick={() => handleReconcileRow(row.id)}
                    disabled={reconcilingId === row.id}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-sans flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {reconcilingId === row.id ? 'Matching...' : 'Reconcile in 1-Click'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Payments Ledger Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100 font-mono">
              Verified Double-Entry Payment Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Records: {payments.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Payment #</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-mono">
                    No payment records in ledger
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200">{p.paymentNumber}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">{p.customerName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.paymentDate}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] truncate max-w-xs">{p.reference}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{p.recordedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

