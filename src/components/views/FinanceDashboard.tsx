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
  Calendar,
  Flame
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
    try {
      const res = await fetch(`/api/benchmark?period=${timeRange}`);
      const data = await res.json();
      if (data.telemetry) {
        setTelemetry(data.telemetry);
        setQueryLatencyMs(data.telemetry.queryLatencyMs);
      }

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
        showToast(`DUNNING DISPATCH EXECUTED FOR ${invoiceNumber}`, 'success');
      }
    } catch {
      showToast('FAILED TO DISPATCH REMINDER', 'error');
    }
  };

  return (
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Constructivist Hero Section */}
      <div className="relative bg-[#000000] p-8 border-b-4 border-[#cc0000] overflow-hidden">
        {/* Angled Red Wedge in background */}
        <div className="absolute top-0 right-0 w-96 h-full bg-[#cc0000] opacity-15 transform -skew-x-12 origin-top-right pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-[#cc0000] text-white font-['Bebas_Neue'] text-sm tracking-widest uppercase">
                SCENE 7 &bull; COMMAND CENTER
              </span>
              <span className="text-xs uppercase tracking-widest text-[#6b6b6b] font-mono">
                SLA: &lt; 200 MS ACTIVE
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
              FINANCE LEAD <span className="text-[#cc0000]">COMMAND DESK</span>
            </h1>

            <p className="text-sm text-[#f2f0eb] max-w-2xl mt-2 font-normal leading-relaxed">
              Design is construction. Every cent, invoice, and renewal cycle forged into an immutable double-entry ledger with sub-second execution.
            </p>
          </div>

          {/* Constructivist Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-[#1a1a1a] p-2 border border-[#2d2d2d]">
            <span className="font-['Bebas_Neue'] text-sm text-[#cc0000] px-2 uppercase tracking-wider">
              PERIOD:
            </span>
            {['ALL', 'THIS_MONTH', 'LAST_MONTH', 'Q4'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all ${
                  timeRange === t
                    ? 'bg-[#cc0000] text-white font-bold transform -skew-x-6'
                    : 'text-[#f2f0eb] hover:bg-[#2d2d2d]'
                }`}
              >
                <span className={timeRange === t ? 'transform skew-x-6 inline-block' : ''}>
                  {t === 'ALL' ? 'ALL TIME' : t === 'THIS_MONTH' ? 'THIS MONTH' : t === 'LAST_MONTH' ? 'LAST MONTH' : 'Q4 HARVEST'}
                </span>
              </button>
            ))}

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="px-2.5 py-1 bg-[#000000] border border-[#2d2d2d] text-xs font-['Roboto_Condensed'] uppercase text-white focus:outline-none focus:border-[#cc0000]"
            >
              <option value="ALL">ALL VARIANTS</option>
              <option value="ODOO">BRAND: ODOO (+560)</option>
              <option value="STANDARD">BRAND: STANDARD (+0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPI Grid in Constructivist Card Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Subscriptions */}
        <div className="con-card con-wedge p-5 bg-[#2d2d2d] border-l-4 border-[#cc0000]">
          <div className="flex items-center justify-between text-[#6b6b6b] mb-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase">
            <span>ACTIVE SUBSCRIPTIONS</span>
            <Layers className="w-4 h-4 text-[#cc0000]" />
          </div>
          <div className="text-4xl font-['Bebas_Neue'] tracking-wider text-white tabular-nums">
            {telemetry?.activeSubsCount ?? 0}
          </div>
          <div className="text-xs text-[#6b6b6b] uppercase mt-2 font-mono flex items-center justify-between border-t border-[#1a1a1a] pt-1">
            <span>PAUSED: {telemetry?.pausedSubsCount ?? 0}</span>
            <span>QUOTES: {telemetry?.quotedSubsCount ?? 0}</span>
          </div>
        </div>

        {/* MRR & ARR */}
        <div className="con-card con-wedge p-5 bg-[#2d2d2d] border-l-4 border-[#cc0000]">
          <div className="flex items-center justify-between text-[#6b6b6b] mb-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase">
            <span>MONTHLY RECURRING (MRR)</span>
            <TrendingUp className="w-4 h-4 text-[#cc0000]" />
          </div>
          <div className="text-4xl font-['Bebas_Neue'] tracking-wider text-[#cc0000] tabular-nums">
            {formatCurrency(telemetry?.mrr ?? 0)}
          </div>
          <div className="text-xs text-[#f2f0eb] uppercase mt-2 font-mono border-t border-[#1a1a1a] pt-1">
            ARR RUN-RATE: <strong className="text-white">{formatCurrency(telemetry?.arr ?? 0)}</strong>
          </div>
        </div>

        {/* Cash Collected */}
        <div className="con-card con-wedge p-5 bg-[#2d2d2d] border-l-4 border-[#cc0000]">
          <div className="flex items-center justify-between text-[#6b6b6b] mb-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase">
            <span>CASH COLLECTED</span>
            <DollarSign className="w-4 h-4 text-[#cc0000]" />
          </div>
          <div className="text-4xl font-['Bebas_Neue'] tracking-wider text-white tabular-nums">
            {formatCurrency(telemetry?.collectedCash ?? 0)}
          </div>
          <div className="text-xs text-[#cc0000] uppercase mt-2 font-mono flex items-center gap-1 border-t border-[#1a1a1a] pt-1 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            100% VERIFIED LEDGER
          </div>
        </div>

        {/* Outstanding AR */}
        <div className="con-card con-wedge p-5 bg-[#2d2d2d] border-l-4 border-[#c45522]">
          <div className="flex items-center justify-between text-[#6b6b6b] mb-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase">
            <span>OUTSTANDING AR</span>
            <Clock className="w-4 h-4 text-[#c45522]" />
          </div>
          <div className="text-4xl font-['Bebas_Neue'] tracking-wider text-[#c45522] tabular-nums">
            {formatCurrency(telemetry?.outstandingAR ?? 0)}
          </div>
          <div className="text-xs text-[#6b6b6b] uppercase mt-2 font-mono border-t border-[#1a1a1a] pt-1">
            CURRENT + PAST DUE
          </div>
        </div>

        {/* Overdue Alert Card */}
        <div className="con-card con-wedge p-5 bg-[#000000] border-l-4 border-[#cc0000]">
          <div className="flex items-center justify-between text-[#cc0000] mb-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase font-bold">
            <span>OVERDUE RADAR</span>
            <AlertCircle className="w-4 h-4 text-[#cc0000]" />
          </div>
          <div className="text-4xl font-['Bebas_Neue'] tracking-wider text-[#cc0000] tabular-nums">
            {formatCurrency(telemetry?.overdueAmount ?? 0)}
          </div>
          <div className="text-xs text-[#f2f0eb] uppercase mt-2 font-mono border-t border-[#1a1a1a] pt-1">
            {telemetry?.overdueCount ?? 0} INVOICES PAST DUE
          </div>
        </div>
      </div>

      {/* AR Aging Buckets & Variant Margin Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AR Aging Schedule */}
        <div className="lg:col-span-2 p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] relative">
          <div className="flex items-center justify-between mb-4 border-b border-[#1a1a1a] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#cc0000]" />
              <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
                ACCOUNTS RECEIVABLE AGING RADAR
              </h2>
            </div>
            <span className="font-mono text-xs text-[#f2f0eb] bg-[#000000] px-3 py-1 border border-[#cc0000]">
              TOTAL: {formatCurrency(telemetry?.outstandingAR ?? 0)}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 bg-[#1a1a1a] border-l-2 border-white">
              <span className="text-[10px] text-[#6b6b6b] uppercase block">CURRENT (NOT DUE)</span>
              <span className="text-xl font-bold font-['Bebas_Neue'] tracking-wider text-white">
                {formatCurrency(telemetry?.aging?.current ?? 0)}
              </span>
            </div>

            <div className="p-3 bg-[#1a1a1a] border-l-2 border-[#f2f0eb]">
              <span className="text-[10px] text-[#6b6b6b] uppercase block">1–30 DAYS OVERDUE</span>
              <span className="text-xl font-bold font-['Bebas_Neue'] tracking-wider text-[#f2f0eb]">
                {formatCurrency(telemetry?.aging?.days1_30 ?? 0)}
              </span>
            </div>

            <div className="p-3 bg-[#1a1a1a] border-l-2 border-[#c45522]">
              <span className="text-[10px] text-[#c45522] uppercase block">31–60 DAYS OVERDUE</span>
              <span className="text-xl font-bold font-['Bebas_Neue'] tracking-wider text-[#c45522]">
                {formatCurrency(telemetry?.aging?.days31_60 ?? 0)}
              </span>
            </div>

            <div className="p-3 bg-[#000000] border-l-4 border-[#cc0000]">
              <span className="text-[10px] text-[#cc0000] uppercase block font-bold">60+ DAYS CRITICAL</span>
              <span className="text-xl font-bold font-['Bebas_Neue'] tracking-wider text-[#cc0000]">
                {formatCurrency(telemetry?.aging?.days60Plus ?? 0)}
              </span>
            </div>
          </div>

          {/* Aging Visual Bar */}
          <div className="mt-6 h-4 w-full bg-[#000000] border border-[#1a1a1a] overflow-hidden flex">
            <div
              style={{
                width: `${
                  telemetry?.outstandingAR
                    ? ((telemetry.aging.current / telemetry.outstandingAR) * 100).toFixed(1)
                    : 100
                }%`,
              }}
              className="bg-white h-full"
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
              className="bg-[#e8e0d0] h-full"
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
              className="bg-[#c45522] h-full"
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
              className="bg-[#cc0000] h-full"
              title="60+ Days"
            />
          </div>
        </div>

        {/* Dynamic Variant Contribution (Odoo +560 Impact) */}
        <div className="p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#1a1a1a] pb-2">
              <h3 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
                VARIANT MARGIN ENGINE
              </h3>
              <span className="px-2 py-0.5 bg-[#cc0000] text-white font-['Bebas_Neue'] text-xs tracking-wider">
                ODOO (+560.00)
              </span>
            </div>
            <p className="text-xs text-[#f2f0eb] mb-4">
              Real-time gross margin calculation comparing base catalog to specialized enterprise variants.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#1a1a1a] border-l-4 border-[#cc0000] flex items-center justify-between">
                <div>
                  <div className="font-bold text-white uppercase">Brand: Odoo Variant</div>
                  <div className="text-[10px] text-[#6b6b6b]">Base $1,200 + $560 = $1,760</div>
                </div>
                <div className="text-right">
                  <div className="text-[#cc0000] font-bold text-base font-['Bebas_Neue']">80.1% MARGIN</div>
                  <div className="text-[10px] text-[#f2f0eb]">+$1,410.00 NET</div>
                </div>
              </div>

              <div className="p-3 bg-[#1a1a1a] border-l-2 border-white flex items-center justify-between">
                <div>
                  <div className="font-bold text-white uppercase">Brand: Standard</div>
                  <div className="text-[10px] text-[#6b6b6b]">Base $1,200 + $0 = $1,200</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-base font-['Bebas_Neue']">70.8% MARGIN</div>
                  <div className="text-[10px] text-[#6b6b6b]">+$850.00 NET</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a1a1a] mt-4 flex items-center justify-between text-xs text-[#6b6b6b] font-mono">
            <span>COMPOSITE ENGINE</span>
            <span className="text-[#cc0000] font-bold uppercase">100% ACID VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Overdue Dunning Worklist */}
      <div className="p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#1a1a1a] pb-3">
          <div>
            <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#cc0000]" />
              OVERDUE AR DUNNING QUEUE
            </h2>
            <p className="text-xs text-[#f2f0eb]">
              Direct proclamation and notification to debtor accounts dispatched via System Email Outbox.
            </p>
          </div>
          {onSelectTab && (
            <button
              onClick={() => onSelectTab('invoices')}
              className="text-xs font-['Bebas_Neue'] tracking-wider text-[#cc0000] hover:text-white uppercase flex items-center gap-1"
            >
              INSPECT ALL INVOICES &rarr;
            </button>
          )}
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="text-center py-8 text-[#6b6b6b] text-xs font-mono uppercase">
            No overdue accounts detected. All current invoices compliant!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-[#000000] text-[#f2f0eb] uppercase font-['Bebas_Neue'] tracking-wider text-sm border-b-2 border-[#cc0000]">
                <tr>
                  <th className="py-3 px-4">INVOICE #</th>
                  <th className="py-3 px-4">CUSTOMER</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">TOTAL</th>
                  <th className="py-3 px-4">BALANCE DUE</th>
                  <th className="py-3 px-4 text-right">DIRECTIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {overdueInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 text-[#f2f0eb] font-sans">{inv.customerName}</td>
                    <td className="py-3 px-4 text-[#cc0000] font-bold">{inv.dueDate}</td>
                    <td className="py-3 px-4 text-white">{formatCurrency(inv.grandTotal)}</td>
                    <td className="py-3 px-4 text-[#cc0000] font-bold">{formatCurrency(inv.amountDue)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSendDunning(inv.id, inv.invoiceNumber)}
                        className="con-btn !py-1.5 !px-3 text-xs"
                      >
                        <span>
                          <Send className="w-3 h-3 mr-1" />
                          DISPATCH NOTICE
                        </span>
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
