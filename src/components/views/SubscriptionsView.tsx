'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Subscription, QuotationTemplate, Plan, Product, User } from '@/types';
import { formatCurrency } from '@/lib/finance/engine';
import {
  Layers,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Sliders,
  Send,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export function SubscriptionsView() {
  const { currentUser, showToast, refreshOutbox, setQueryLatencyMs } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  // Template modal
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customSeats, setCustomSeats] = useState(5);
  const [includeOdooVariant, setIncludeOdooVariant] = useState(true);

  // Chronos Time Machine state
  const [chronosCycles, setChronosCycles] = useState(6);
  const [chronosAdditionalSeats, setChronosAdditionalSeats] = useState(0);
  const [chronosPauseDays, setChronosPauseDays] = useState(0);
  const [chronosData, setChronosData] = useState<any>(null);
  const [chronosLoading, setChronosLoading] = useState(false);

  const fetchSubscriptions = async () => {
    const start = performance.now();
    try {
      const res = await fetch(`/api/subscriptions?status=${filterStatus}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.items) {
        setSubscriptions(data.items);
        setQueryLatencyMs(data.queryLatencyMs);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogData = async () => {
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
        setPlans(data.plans || []);
        setProducts(data.products || []);
        setCustomers((data.users || []).filter((u: User) => u.role === 'CUSTOMER'));
        if (data.templates && data.templates.length > 0) {
          setSelectedTemplateId(data.templates[0].id);
        }
        if (data.users && data.users.length > 0) {
          const cust = data.users.find((u: User) => u.role === 'CUSTOMER');
          if (cust) setSelectedCustomerId(cust.id);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchCatalogData();
  }, [filterStatus, searchQuery]);

  // Load Chronos when a subscription is selected
  const loadChronos = async (subId: string) => {
    setChronosLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subId}/chronos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cyclesAhead: chronosCycles,
          additionalSeats: chronosAdditionalSeats,
          pauseDays: chronosPauseDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChronosData(data.simulation);
      }
    } catch {
      // Fallback
    } finally {
      setChronosLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSub) {
      loadChronos(selectedSub.id);
    }
  }, [selectedSub, chronosCycles, chronosAdditionalSeats, chronosPauseDays]);

  const handleStateTransition = async (action: string, status?: string) => {
    if (!selectedSub) return;
    try {
      const res = await fetch(`/api/subscriptions/${selectedSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transition failed');

      showToast(`Subscription ${selectedSub.subscriptionNumber} updated to ${data.subscription.status}`, 'success');
      setSelectedSub(data.subscription);
      await fetchSubscriptions();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  const handleCreateFromTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const tmpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tmpl) return;

    try {
      const erpProd = products.find((p) => p.sku === 'BL-ERP-01') || products[0];
      const odooVar = erpProd?.variants.find((v) => v.attributeValue === 'Odoo');

      const lines = [
        {
          productId: erpProd.id,
          variantId: includeOdooVariant ? odooVar?.id : undefined,
          quantity: customSeats,
        },
      ];

      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          planId: tmpl.planId,
          templateId: tmpl.id,
          lines,
          paymentTerms: tmpl.paymentTerms,
          notes: `Created from blueprint: ${tmpl.name}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Creation failed');

      showToast(`Created ${data.subscription.subscriptionNumber} in DRAFT status!`, 'success');
      setOpenCreateModal(false);
      setSelectedSub(data.subscription);
      await fetchSubscriptions();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Creation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
            Subscription Lifecycle & Blueprint Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            5-Stage State Machine, Dynamic Odoo (+560) variant pricing, and Chronos™ Future Billing Simulator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenCreateModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New from Quotation Blueprint
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          {['ALL', 'ACTIVE', 'CONFIRMED', 'QUOTATION', 'PAUSED', 'DRAFT', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded font-mono text-[11px] transition-colors shrink-0 ${
                filterStatus === s
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
          placeholder="Search by SUB-2026, customer or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-72 font-mono"
        />
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Subscription #</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Plan & Cadence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        {sub.subscriptionNumber}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300">
                        <div>{sub.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sub.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{sub.planName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : sub.status === 'CONFIRMED'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                              : sub.status === 'QUOTATION'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              : sub.status === 'PAUSED'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                              : sub.status === 'CLOSED'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{sub.nextBillingDate}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{formatCurrency(sub.grandTotal)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSub(sub);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono transition-colors"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Subscription Drawer & Chronos Simulator */}
      {selectedSub && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-6 animate-in fade-in">
          {/* Header of Drawer */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold font-mono text-slate-100">{selectedSub.subscriptionNumber}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                  {selectedSub.planName}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Customer: <strong className="text-slate-200">{selectedSub.customerName}</strong> ({selectedSub.customerEmail})
              </p>
            </div>

            {/* Stage Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedSub.status === 'DRAFT' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'QUOTATION')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Quotation
                </button>
              )}

              {selectedSub.status === 'QUOTATION' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'CONFIRMED')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Quotation
                </button>
              )}

              {selectedSub.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Activate Recurring Billing
                </button>
              )}

              {selectedSub.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={() => handleStateTransition('PAUSE')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    Pause Billing
                  </button>
                  <button
                    onClick={() => handleStateTransition('CLOSE')}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Close Early
                  </button>
                </>
              )}

              {selectedSub.status === 'PAUSED' && (
                <button
                  onClick={() => handleStateTransition('RESUME')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Resume Billing Cycle
                </button>
              )}

              {selectedSub.status === 'CLOSED' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'ACTIVE')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Renew Contract
                </button>
              )}
            </div>
          </div>

          {/* 5-Stage Visual Stepper Pipeline */}
          <div>
            <div className="text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
              5-Stage Lifecycle State Machine Stepper
            </div>
            <div className="grid grid-cols-5 gap-2 font-mono text-xs">
              {[
                { stage: 'DRAFT', label: '1. Draft' },
                { stage: 'QUOTATION', label: '2. Quotation' },
                { stage: 'CONFIRMED', label: '3. Confirmed' },
                { stage: 'ACTIVE', label: '4. Active' },
                { stage: 'CLOSED', label: '5. Closed' },
              ].map((step, idx) => {
                const stages = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'];
                const currentIdx = stages.indexOf(selectedSub.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = selectedSub.status === step.stage;

                return (
                  <div
                    key={step.stage}
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      isCurrent
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-950'
                        : isPassed
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    <div>{step.label}</div>
                    {isCurrent && <div className="text-[10px] text-emerald-400 mt-0.5">CURRENT STATE</div>}
                  </div>
                );
              })}
            </div>
            {selectedSub.status === 'PAUSED' && (
              <div className="mt-2 p-2 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center justify-between">
                <span>Status: PAUSED sub-state active. Billing frozen and renewal dates shifted forward.</span>
                <span>Paused Days: {selectedSub.totalPausedDays}</span>
              </div>
            )}
          </div>

          {/* Itemized Line Items */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono mb-3">
              Itemized Line Items & Variant Pricing Matrix
            </h4>
            <div className="space-y-2 font-mono text-xs">
              {selectedSub.lines.map((l) => (
                <div
                  key={l.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-100 flex items-center gap-2">
                      {l.productName}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                        {l.variantLabel || 'Standard'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Qty: {l.quantity} × {formatCurrency(l.unitPrice)} (Base {formatCurrency(l.baseUnitPrice)} + Delta {formatCurrency(l.variantDelta)})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-100">{formatCurrency(l.lineTotal)}</div>
                    <div className="text-[10px] text-slate-400">incl. tax ({l.taxRatePercent}%)</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between font-mono text-xs">
              <span className="text-slate-400">Subtotal: {formatCurrency(selectedSub.subtotal)} | Tax: {formatCurrency(selectedSub.taxTotal)}</span>
              <span className="text-sm font-bold text-emerald-400">Grand Total: {formatCurrency(selectedSub.grandTotal)} / cycle</span>
            </div>
          </div>

          {/* NOVELTY FEATURE #1: CHRONOS™ INTERACTIVE TIME-MACHINE */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-emerald-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                    Chronos™ Interactive Billing Time-Machine & Proration Simulator
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      NOVELTY #1
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Scrub forward in time to inspect future invoices, proration, and discount burn-down.
                  </p>
                </div>
              </div>

              {chronosData && (
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-400">Projected Total Contract Value (TCV)</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {formatCurrency(chronosData.projectedTCV)}
                  </div>
                </div>
              )}
            </div>

            {/* Time Machine Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                  <span>Future Timeline Scrubber</span>
                  <span className="text-emerald-400 font-bold">+{chronosCycles} Cycles</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={chronosCycles}
                  onChange={(e) => setChronosCycles(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                  <span>What-If: Add Extra Seats</span>
                  <span className="text-emerald-400 font-bold">+{chronosAdditionalSeats} Seats</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={chronosAdditionalSeats}
                  onChange={(e) => setChronosAdditionalSeats(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1 flex items-center justify-between">
                  <span>What-If: Shift/Pause Window</span>
                  <span className="text-emerald-400 font-bold">+{chronosPauseDays} Days</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={15}
                  value={chronosPauseDays}
                  onChange={(e) => setChronosPauseDays(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>

            {/* Chronos Projected Invoices Timeline */}
            <div className="pt-2">
              <div className="text-xs font-mono text-slate-400 mb-2">
                Projected Billing Runs ({chronosData?.timeline?.length || 0} Future Cycles):
              </div>

              {chronosLoading ? (
                <div className="text-center py-6 text-slate-500 text-xs font-mono">
                  Simulating future cycles...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chronosData?.timeline?.map((cycle: any) => (
                    <div
                      key={cycle.cycleIndex}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span className="font-semibold text-slate-200">Cycle #{cycle.cycleIndex}</span>
                        <span>{cycle.billingDate}</span>
                      </div>
                      <div className="text-base font-bold text-slate-100 my-1">
                        {formatCurrency(cycle.grandTotal)}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Disc: {cycle.discountAmount > 0 ? `-${formatCurrency(cycle.discountAmount)}` : 'None'}</span>
                        <span className="text-emerald-400">{cycle.discountNote}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-800 flex justify-between">
                        <span>Cumulative TCV:</span>
                        <span className="text-slate-300 font-semibold">{formatCurrency(cycle.cumulativeTCV)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Quotation Template Modal */}
      {openCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-lg font-bold text-slate-100 font-mono mb-1">
              Create Subscription from Quotation Blueprint
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Instantiate a new contract in 1 click with automatic validity terms and variant calculation.
            </p>

            <form onSubmit={handleCreateFromTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Select Quotation Blueprint</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Customer Account</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName || c.fullName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Seat / Unit Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={customSeats}
                    onChange={(e) => setCustomSeats(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Variant Configuration</label>
                  <label className="flex items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOdooVariant}
                      onChange={(e) => setIncludeOdooVariant(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span className="text-xs text-slate-200 font-mono">Odoo Brand (+560.00)</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Price Preview */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
                <div className="text-slate-400">Dynamic Pricing Preview:</div>
                <div className="text-sm font-bold text-emerald-300 mt-1">
                  Base $1,200 {includeOdooVariant ? '+ $560.00 Odoo = $1,760' : '+ $0 Standard = $1,200'} × {customSeats} Seats ={' '}
                  {formatCurrency((includeOdooVariant ? 1760 : 1200) * customSeats)} + 8.5% tax
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono shadow-sm"
                >
                  Instantiate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

