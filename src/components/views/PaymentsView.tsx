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

      showToast('BANK WIRE RECONCILED! INVOICE MARKED PAID IN FULL.', 'success');
      await fetchPaymentsAndBankData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Reconciliation failed', 'error');
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Header */}
      <div className="bg-[#000000] p-6 border-b-4 border-[#cc0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
              PAYMENTS RECONCILER // <span className="text-[#cc0000]">AI MATCHER</span>
            </h1>
            <span className="px-2 py-0.5 bg-[#cc0000] text-white text-[11px] font-['Bebas_Neue'] tracking-widest uppercase">
              AUTO-SOLVER
            </span>
          </div>
          <p className="text-xs text-[#f2f0eb] font-mono">
            Scene 6 & Novelty #4: Multi-Method Settlements &bull; Subset-Sum Solver &bull; 1-Click Bank Statement Settlement
          </p>
        </div>
      </div>

      {/* NOVELTY #4: AI-ASSISTED BANK STATEMENT RECONCILER */}
      <div className="p-8 bg-[#000000] border-2 border-[#cc0000] relative con-wedge space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#1a1a1a] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#cc0000] text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
                  SMART BANK STATEMENT RECONCILER &bull; SPLIT MATCHER
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-white text-black font-['Bebas_Neue'] tracking-wider uppercase font-bold">
                  NOVELTY #4
                </span>
              </div>
              <p className="text-xs text-[#f2f0eb]">
                Probabilistic subset-sum matcher links deposits and lumped wires to open confirmed invoices.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-white bg-[#cc0000] px-3 py-1 font-bold uppercase tracking-wider">
            3 UNRECONCILED WIRE ENTRIES DETECTED
          </div>
        </div>

        {/* Bank Statement Rows */}
        <div className="space-y-3 pt-2">
          {bankRows.map((row) => (
            <div
              key={row.id}
              className="p-4 bg-[#1a1a1a] border-l-6 border-[#cc0000] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs transition-colors hover:bg-[#2d2d2d]"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#6b6b6b]">{row.date}</span>
                  <span className="font-bold text-white text-sm">{row.description}</span>
                </div>
                <div className="text-[11px] text-[#f2f0eb]">
                  REF: <code className="text-white">{row.reference}</code> | WIRE AMOUNT: <strong className="text-[#cc0000] font-bold text-sm">{formatCurrency(row.amount)}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-['Bebas_Neue'] tracking-wider uppercase font-bold ${
                      row.status === 'RECONCILED'
                        ? 'bg-[#000000] text-[#6b6b6b]'
                        : 'bg-[#cc0000] text-white'
                    }`}
                  >
                    {row.matchConfidence}% MATCH CERTAINTY
                  </span>
                  <div className="text-[10px] text-[#6b6b6b] mt-0.5">
                    TARGET: {row.matchedInvoiceIds?.join(', ') || 'SOLVER'}
                  </div>
                </div>

                {row.status === 'RECONCILED' ? (
                  <span className="px-3 py-1.5 bg-[#000000] text-white text-xs font-['Bebas_Neue'] tracking-wider uppercase flex items-center gap-1 border border-[#cc0000]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#cc0000]" />
                    RECONCILED
                  </span>
                ) : (
                  <button
                    onClick={() => handleReconcileRow(row.id)}
                    disabled={reconcilingId === row.id}
                    className="con-btn !py-2 !px-4 text-xs disabled:opacity-50"
                  >
                    <span>
                      <Zap className="w-3.5 h-3.5 mr-1" />
                      {reconcilingId === row.id ? 'MATCHING...' : 'RECONCILE IN 1-CLICK'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Payments Ledger Table */}
      <div className="bg-[#2d2d2d] border-l-6 border-[#cc0000] shadow-xl overflow-hidden">
        <div className="p-4 bg-[#000000] border-b-2 border-[#cc0000] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#cc0000]" />
            <h3 className="text-xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
              VERIFIED DOUBLE-ENTRY PAYMENT LEDGER
            </h3>
          </div>
          <span className="text-xs font-mono text-[#f2f0eb]">TOTAL RECORDS: {payments.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-[#000000] text-[#f2f0eb] uppercase font-['Bebas_Neue'] tracking-wider text-sm border-b-2 border-[#1a1a1a]">
              <tr>
                <th className="py-3 px-4">PAYMENT #</th>
                <th className="py-3 px-4">INVOICE #</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">METHOD</th>
                <th className="py-3 px-4">DATE</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">REFERENCE</th>
                <th className="py-3 px-4 text-right">RECORDED BY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{p.paymentNumber}</td>
                  <td className="py-3 px-4 text-[#cc0000] font-bold">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 text-[#f2f0eb] font-sans font-bold">{p.customerName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-[#000000] text-white text-[10px] uppercase font-bold border border-[#2d2d2d]">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{p.paymentDate}</td>
                  <td className="py-3 px-4 font-bold text-white text-sm">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4 text-[#6b6b6b] text-[11px] truncate max-w-xs">{p.reference}</td>
                  <td className="py-3 px-4 text-right text-[#f2f0eb]">{p.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
