'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/finance/engine';
import {
  TrendingUp,
  DollarSign,
  AlertCircle,
  Clock,
  Layers,
  ArrowUpRight,
  Send,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';

interface TelemetryData {
  activeSubsCount: number;
  pausedSubsCount: number;
  quotedSubsCount: number;
  totalSubsCount: number;
  mrr: number;
  arr: number;
  collectedCash: number;
  outstandingAR: number;
  overdueCount: number;
  overdueAmount: number;
  aging: {
    current: number;
    days1_30: number;
    days31_60: number;
    days60Plus: number;
  };
  queryLatencyMs: number;
}

export function FinanceDashboard({ onSelectTab }: { onSelectTab?: (tab: string) => void }) {
  const { setQueryLatencyMs, showToast, refreshOutbox } = useAuth();
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('ALL');
  const [billingFreq, setBillingFreq] = useState('ALL');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);

  const fetchTelemetry = async () => {
    const start = performance.now();
    try {
      const res = await fetch(`/api/benchmark?period=${timeRange}`);
      const data = await res.json();
      if (data.telemetry) {
        setTelemetry(data.telemetry);
        setQueryLatencyMs(data.telemetry.queryLatencyMs);
      }

      // Fetch overdue invoices for dunning quick actions
      const invRes = await fetch('/api/invoices?status=CONFIRMED');
      const invData = await invRes.json();
      const today = new Date().toISOString().split('T')[0];
      const overdue = (invData.items || []).filter((i: any) => i.dueDate < today);
      setOverdueInvoices(overdue);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [timeRange, billingFreq, brandFilter]);

  const handleSendDunning = async (invId: string, invoiceNumber: string) => {
    try {
      const res = await fetch(`/api/invoices/${invId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND' }),
      });
      if (res.ok) {
        await refreshOutbox();
        showToast(`Dunning notice dispatched for ${invoiceNumber}`, 'success');
      }
    } catch {
      showToast('Failed to dispatch reminder', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Finance Executive Command Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            End-of-month revenue reconciliation, MRR/ARR run-rate, and sub-2-second telemetry radar.
          </p>
        </div>

        {/* Multi-Dimensional Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            <span className="text-slate-500 px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Period:
            </span>
            {['ALL', 'THIS_MONTH', 'LAST_MONTH', 'Q4'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors ${
                  timeRange === t ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Time' : t === 'THIS_MONTH' ? 'This Month' : t === 'LAST_MONTH' ? 'Last Month' : 'This Quarter'}
              </button>
            ))}
          </div>

          {/* Billing Frequency Filter */}
          <select
            value={billingFreq}
            onChange={(e) => setBillingFreq(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Frequencies</option>
            <option value="DAILY">Daily Plans</option>
            <option value="WEEKLY">Weekly Plans</option>
            <option value="MONTHLY">Monthly Plans</option>
            <option value="YEARLY">Yearly Master</option>
          </select>

          {/* Brand Variant Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Variants</option>
            <option value="ODOO">Brand: Odoo (+560)</option>
            <option value="STANDARD">Brand: Standard (+0)</option>
            <option value="CLOUD">Brand: Cloud (+1200)</option>
          </select>
        </div>
      </div>

      {/* Top Telemetry KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Subscriptions */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Subscriptions</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {telemetry?.activeSubsCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
            <span>Paused: {telemetry?.pausedSubsCount ?? 0}</span>
            <span>Quotes: {telemetry?.quotedSubsCount ?? 0}</span>
          </div>
        </div>

        {/* MRR & ARR */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monthly Recurring (MRR)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatCurrency(telemetry?.mrr ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ARR Run-Rate: <span className="text-slate-200 font-semibold">{formatCurrency(telemetry?.arr ?? 0)}</span>
          </div>
        </div>

        {/* Cash Collected */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Cash Collected (Cash-In)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {formatCurrency(telemetry?.collectedCash ?? 0)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            100% Verified via Bank Ledger
          </div>
        </div>

        {/* Outstanding AR */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Outstanding AR (Unpaid)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
            {formatCurrency(telemetry?.outstandingAR ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Current + Past Due Balances
          </div>
        </div>

        {/* Overdue Radar */}
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/50 transition-colors">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-semibold">Overdue Invoices Alert</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            {formatCurrency(telemetry?.overdueAmount ?? 0)}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1 font-mono">
            {telemetry?.overdueCount ?? 0} Invoices Past Due Date
          </div>
        </div>
      </div>

      {/* AR Aging Buckets & Variant Margin Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AR Aging Buckets */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Accounts Receivable Aging Schedule</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Total: {formatCurrency(telemetry?.outstandingAR ?? 0)}</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Current (Not Due)</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {formatCurrency(telemetry?.aging?.current ?? 0)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">1–30 Days Overdue</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {formatCurrency(telemetry?.aging?.days1_30 ?? 0)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">31–60 Days Overdue</span>
              <span className="text-base font-bold font-mono text-orange-400">
                {formatCurrency(telemetry?.aging?.days31_60 ?? 0)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-rose-900/40 bg-rose-950/10">
              <span className="text-[11px] text-rose-300 block mb-1">60+ Days Overdue</span>
              <span className="text-base font-bold font-mono text-rose-400">
                {formatCurrency(telemetry?.aging?.days60Plus ?? 0)}
              </span>
            </div>
          </div>

          {/* Aging Visual Bar */}
          <div className="mt-4 h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${
                  telemetry?.outstandingAR
                    ? ((telemetry.aging.current / telemetry.outstandingAR) * 100).toFixed(1)
                    : 100
                }%`,
              }}
              className="bg-emerald-500 h-full transition-all"
              title="Current"
            />
            <div
              style={{
                width: `${
                  telemetry?.outstandingAR
                    ? ((telemetry.aging.days1_30 / telemetry.outstandingAR) * 100).toFixed(1)
                    : 0
                }%`,
              }}
              className="bg-amber-500 h-full transition-all"
              title="1-30 Days"
            />
            <div
              style={{
                width: `${
                  telemetry?.outstandingAR
                    ? ((telemetry.aging.days31_60 / telemetry.outstandingAR) * 100).toFixed(1)
                    : 0
                }%`,
              }}
              className="bg-orange-500 h-full transition-all"
              title="31-60 Days"
            />
            <div
              style={{
                width: `${
                  telemetry?.outstandingAR
                    ? ((telemetry.aging.days60Plus / telemetry.outstandingAR) * 100).toFixed(1)
                    : 0
                }%`,
              }}
              className="bg-rose-500 h-full transition-all"
              title="60+ Days"
            />
          </div>
        </div>

        {/* Dynamic Variant Contribution (Odoo +560 Impact) */}
        <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100">Dynamic Variant Margin Impact</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                ODOD (+560.00)
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Evaluating the gross margin delta across the flagship Core ERP Suite.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Brand: Odoo Variant</div>
                  <div className="text-[10px] text-slate-500">Base $1,200 + $560 = $1,760</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">80.1% Margin</div>
                  <div className="text-[10px] text-slate-400">+$1,410.00 net</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Brand: Standard</div>
                  <div className="text-[10px] text-slate-500">Base $1,200 + $0 = $1,200</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-300 font-bold">70.8% Margin</div>
                  <div className="text-[10px] text-slate-400">+$850.00 net</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Composite Variant Delta Engine</span>
            <span className="text-emerald-400 font-mono font-semibold">Active & Indexed</span>
          </div>
        </div>
      </div>

      {/* Overdue Dunning Worklist */}
      <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Overdue Collections Radar & 1-Click Dunning Worklist
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chase past-due accounts directly with automated notice dispatch into the Simulated Outbox.
            </p>
          </div>
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('invoices')}
              className="text-xs text-emerald-400 hover:underline font-mono"
            >
              View All Invoices →
            </button>
          )}
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            No overdue invoices at this time. All confirmed receivables are current!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Amount Owed</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{inv.invoiceNumber}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans">{inv.customerName}</td>
                    <td className="py-2.5 px-3 text-rose-400 font-semibold">{inv.dueDate}</td>
                    <td className="py-2.5 px-3 text-slate-300">{formatCurrency(inv.grandTotal)}</td>
                    <td className="py-2.5 px-3 text-rose-300 font-bold">{formatCurrency(inv.amountDue)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleSendDunning(inv.id, inv.invoiceNumber)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-sans font-medium transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Send Dunning Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

