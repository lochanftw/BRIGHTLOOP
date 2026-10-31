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

      showToast(`TRANSITION COMMITTED: ${selectedSub.subscriptionNumber} &rarr; ${data.subscription.status}`, 'success');
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

      showToast(`CONSTRUCTED: ${data.subscription.subscriptionNumber} IN DRAFT STAGE`, 'success');
      setOpenCreateModal(false);
      setSelectedSub(data.subscription);
      await fetchSubscriptions();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Creation failed', 'error');
    }
  };

  return (
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Header */}
      <div className="bg-[#000000] p-6 border-b-4 border-[#cc0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
            SUBSCRIPTION PIPELINE // <span className="text-[#cc0000]">BLUEPRINT STUDIO</span>
          </h1>
          <p className="text-xs text-[#f2f0eb] mt-1 font-mono">
            5-Stage Architectural Machine &middot; Odoo (+560.00) Dynamic Variant Matrix &middot; Chronos&trade; Time-Machine
          </p>
        </div>

        <button
          onClick={() => setOpenCreateModal(true)}
          className="con-btn !py-2.5 !px-5 text-sm"
        >
          <span>
            <Plus className="w-4 h-4 mr-1.5" />
            NEW FROM BLUEPRINT
          </span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto bg-[#000000] border border-[#2d2d2d] p-1 text-xs">
          {['ALL', 'ACTIVE', 'CONFIRMED', 'QUOTATION', 'PAUSED', 'DRAFT', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all shrink-0 ${
                filterStatus === s
                  ? 'bg-[#cc0000] text-white font-bold'
                  : 'text-[#f2f0eb] hover:bg-[#1a1a1a]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="SEARCH SUB-2026, CUSTOMER, OR EMAIL..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-[#000000] border-2 border-[#2d2d2d] text-xs font-mono uppercase text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000] w-full sm:w-80"
        />
      </div>

      {/* Subscriptions Table */}
      <div className="bg-[#2d2d2d] border-l-6 border-[#cc0000] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-[#000000] text-[#f2f0eb] uppercase font-['Bebas_Neue'] tracking-wider text-sm border-b-2 border-[#cc0000]">
              <tr>
                <th className="py-3 px-4">SUBSCRIPTION #</th>
                <th className="py-3 px-4">CUSTOMER CADRE</th>
                <th className="py-3 px-4">CADENCE</th>
                <th className="py-3 px-4">STATE</th>
                <th className="py-3 px-4">NEXT BILLING</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4 text-right">INSPECTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6b6b6b] uppercase">
                    No subscriptions match query
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
                        isSelected ? 'bg-[#000000] border-l-4 border-[#cc0000]' : 'hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#cc0000]" />
                        {sub.subscriptionNumber}
                      </td>
                      <td className="py-3 px-4 font-sans text-white">
                        <div className="font-bold">{sub.customerName}</div>
                        <div className="text-[10px] text-[#6b6b6b] font-mono">{sub.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-[#f2f0eb] font-['Bebas_Neue'] text-sm tracking-wider">{sub.planName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-['Bebas_Neue'] tracking-widest uppercase font-bold ${
                            sub.status === 'ACTIVE'
                              ? 'bg-[#cc0000] text-white'
                              : sub.status === 'CONFIRMED'
                              ? 'bg-white text-black'
                              : sub.status === 'QUOTATION'
                              ? 'bg-[#c45522] text-white'
                              : sub.status === 'PAUSED'
                              ? 'bg-[#1a1a1a] text-[#f2f0eb] border border-[#cc0000]'
                              : 'bg-[#6b6b6b] text-black'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#f2f0eb]">{sub.nextBillingDate}</td>
                      <td className="py-3 px-4 font-bold text-[#cc0000] text-sm">{formatCurrency(sub.grandTotal)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSub(sub);
                          }}
                          className="con-btn-black !py-1 !px-2.5 text-xs font-['Bebas_Neue'] tracking-wider"
                        >
                          INSPECT &rarr;
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
        <div className="p-8 bg-[#000000] border-2 border-[#cc0000] space-y-6 shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#1a1a1a] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-['Bebas_Neue'] tracking-wider text-white">
                  {selectedSub.subscriptionNumber}
                </span>
                <span className="text-xs px-2.5 py-1 bg-[#cc0000] text-white font-['Bebas_Neue'] tracking-widest uppercase">
                  {selectedSub.planName}
                </span>
              </div>
              <p className="text-xs text-[#f2f0eb] font-mono">
                CADRE: <strong className="text-white">{selectedSub.customerName}</strong> ({selectedSub.customerEmail})
              </p>
            </div>

            {/* Stage Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedSub.status === 'DRAFT' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'QUOTATION')}
                  className="con-btn !py-2 !px-4 text-xs !bg-white !text-black hover:!bg-[#cc0000] hover:!text-white"
                >
                  <span>
                    <Send className="w-3.5 h-3.5 mr-1" />
                    SEND QUOTATION
                  </span>
                </button>
              )}

              {selectedSub.status === 'QUOTATION' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'CONFIRMED')}
                  className="con-btn !py-2 !px-4 text-xs"
                >
                  <span>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    CONFIRM ORDER
                  </span>
                </button>
              )}

              {selectedSub.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'ACTIVE')}
                  className="con-btn !py-2 !px-4 text-xs"
                >
                  <span>
                    <Play className="w-3.5 h-3.5 mr-1" />
                    ACTIVATE RECURRING RUNS
                  </span>
                </button>
              )}

              {selectedSub.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={() => handleStateTransition('PAUSE')}
                    className="con-btn-black !py-2 !px-3 text-xs"
                  >
                    <span>
                      <Pause className="w-3.5 h-3.5 mr-1 text-[#cc0000]" />
                      PAUSE BILLING
                    </span>
                  </button>
                  <button
                    onClick={() => handleStateTransition('CLOSE')}
                    className="con-btn-black !py-2 !px-3 text-xs hover:!bg-[#cc0000]"
                  >
                    <span>
                      <XCircle className="w-3.5 h-3.5 mr-1 text-[#cc0000]" />
                      CLOSE EARLY
                    </span>
                  </button>
                </>
              )}

              {selectedSub.status === 'PAUSED' && (
                <button
                  onClick={() => handleStateTransition('RESUME')}
                  className="con-btn !py-2 !px-4 text-xs"
                >
                  <span>
                    <Play className="w-3.5 h-3.5 mr-1" />
                    RESUME CONTRACT
                  </span>
                </button>
              )}

              {selectedSub.status === 'CLOSED' && (
                <button
                  onClick={() => handleStateTransition('TRANSITION', 'ACTIVE')}
                  className="con-btn-black !py-2 !px-4 text-xs"
                >
                  <span>
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    RENEW INTO NEW TERM
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* 5-Stage Stepper in Constructivist Poster Style */}
          <div>
            <div className="text-xs font-['Bebas_Neue'] tracking-widest text-[#6b6b6b] mb-2 uppercase">
              ARCHITECTURAL STATE MACHINE PIPELINE
            </div>
            <div className="grid grid-cols-5 gap-2 font-['Bebas_Neue'] tracking-wider text-sm">
              {[
                { stage: 'DRAFT', num: '01', label: 'DRAFT' },
                { stage: 'QUOTATION', num: '02', label: 'QUOTATION' },
                { stage: 'CONFIRMED', num: '03', label: 'CONFIRMED' },
                { stage: 'ACTIVE', num: '04', label: 'ACTIVE' },
                { stage: 'CLOSED', num: '05', label: 'CLOSED' },
              ].map((step, idx) => {
                const stages = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED'];
                const currentIdx = stages.indexOf(selectedSub.status);
                const isPassed = currentIdx >= idx;
                const isCurrent = selectedSub.status === step.stage;

                return (
                  <div
                    key={step.stage}
                    className={`p-3 border-2 transition-all ${
                      isCurrent
                        ? 'bg-[#cc0000] border-[#cc0000] text-white shadow-xl transform -skew-x-3'
                        : isPassed
                        ? 'bg-[#1a1a1a] border-[#2d2d2d] text-white'
                        : 'bg-[#000000] border-[#1a1a1a] text-[#6b6b6b]'
                    }`}
                  >
                    <div className="text-xs opacity-75">{step.num}</div>
                    <div className="text-base font-bold">{step.label}</div>
                    {isCurrent && <div className="text-[10px] text-white tracking-widest mt-0.5 font-mono">ACTIVE STATE</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lines */}
          <div className="p-5 bg-[#1a1a1a] border-l-4 border-[#cc0000]">
            <h3 className="text-xl font-['Bebas_Neue'] tracking-wider text-white uppercase mb-3">
              LINE ITEMS &bull; DYNAMIC ODOO VARIANT PRICING
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {selectedSub.lines.map((l) => (
                <div
                  key={l.id}
                  className="p-3 bg-[#000000] border border-[#2d2d2d] flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      {l.productName}
                      <span className="text-[10px] px-2 py-0.5 bg-[#cc0000] text-white uppercase font-bold">
                        {l.variantLabel || 'STANDARD'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6b6b6b] mt-1">
                      QTY: {l.quantity} &times; {formatCurrency(l.unitPrice)} (BASE {formatCurrency(l.baseUnitPrice)} + DELTA {formatCurrency(l.variantDelta)})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-white">{formatCurrency(l.lineTotal)}</div>
                    <div className="text-[10px] text-[#6b6b6b]">INCL. TAX ({l.taxRatePercent}%)</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d2d2d] flex justify-between font-mono text-xs">
              <span className="text-[#6b6b6b]">SUBTOTAL: {formatCurrency(selectedSub.subtotal)} | TAX: {formatCurrency(selectedSub.taxTotal)}</span>
              <span className="text-base font-bold text-[#cc0000] font-['Bebas_Neue'] tracking-wider">
                CYCLE TOTAL: {formatCurrency(selectedSub.grandTotal)}
              </span>
            </div>
          </div>

          {/* NOVELTY #1: CHRONOS™ TIME-MACHINE IN CONSTRUCTIVIST AESTHETIC */}
          <div className="p-6 bg-[#1a1a1a] border-2 border-[#cc0000] relative con-wedge space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2d2d2d] pb-3">
              <div>
                <h3 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#cc0000]" />
                  CHRONOS&trade; TIME-MACHINE &bull; PRORATION PROJECTION
                </h3>
                <p className="text-xs text-[#f2f0eb]">
                  Scrub timeline forward. Inspect future tax cascades and discount expirations before committing changes.
                </p>
              </div>

              {chronosData && (
                <div className="text-right font-mono">
                  <div className="text-xs text-[#6b6b6b] uppercase">PROJECTED TOTAL VALUE (TCV)</div>
                  <div className="text-2xl font-['Bebas_Neue'] tracking-wider text-[#cc0000] font-bold">
                    {formatCurrency(chronosData.projectedTCV)}
                  </div>
                </div>
              )}
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs pt-2">
              <div className="p-3 bg-[#000000] border-l-2 border-[#cc0000]">
                <label className="block text-[#f2f0eb] uppercase mb-1 flex justify-between">
                  <span>TIMELINE SCRUBBER</span>
                  <span className="text-[#cc0000] font-bold">+{chronosCycles} CYCLES</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={chronosCycles}
                  onChange={(e) => setChronosCycles(parseInt(e.target.value))}
                  className="w-full accent-[#cc0000] bg-[#2d2d2d] h-2"
                />
              </div>

              <div className="p-3 bg-[#000000] border-l-2 border-white">
                <label className="block text-[#f2f0eb] uppercase mb-1 flex justify-between">
                  <span>WHAT-IF: EXTRA SEATS</span>
                  <span className="text-white font-bold">+{chronosAdditionalSeats} SEATS</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={chronosAdditionalSeats}
                  onChange={(e) => setChronosAdditionalSeats(parseInt(e.target.value))}
                  className="w-full accent-[#cc0000] bg-[#2d2d2d] h-2"
                />
              </div>

              <div className="p-3 bg-[#000000] border-l-2 border-[#c45522]">
                <label className="block text-[#f2f0eb] uppercase mb-1 flex justify-between">
                  <span>WHAT-IF: PAUSE SHIFT</span>
                  <span className="text-[#c45522] font-bold">+{chronosPauseDays} DAYS</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={15}
                  value={chronosPauseDays}
                  onChange={(e) => setChronosPauseDays(parseInt(e.target.value))}
                  className="w-full accent-[#cc0000] bg-[#2d2d2d] h-2"
                />
              </div>
            </div>

            {/* Projection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {chronosData?.timeline?.map((cycle: any) => (
                <div
                  key={cycle.cycleIndex}
                  className="p-3 bg-[#000000] border-l-4 border-[#cc0000] font-mono text-xs"
                >
                  <div className="flex justify-between text-[#6b6b6b] uppercase text-[10px]">
                    <span className="font-['Bebas_Neue'] text-sm text-white">CYCLE #{cycle.cycleIndex}</span>
                    <span>{cycle.billingDate}</span>
                  </div>
                  <div className="text-xl font-['Bebas_Neue'] tracking-wider text-[#cc0000] my-1 font-bold">
                    {formatCurrency(cycle.grandTotal)}
                  </div>
                  <div className="text-[11px] text-[#f2f0eb] flex justify-between">
                    <span>DISC: {cycle.discountAmount > 0 ? `-${formatCurrency(cycle.discountAmount)}` : 'NONE'}</span>
                    <span className="text-[#cc0000]">{cycle.discountNote}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Instantiate Modal */}
      {openCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#000000] border-4 border-[#cc0000] p-6 relative">
            <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase mb-1">
              INSTANTIATE CONTRACT FROM BLUEPRINT
            </h2>
            <p className="text-xs text-[#f2f0eb] mb-4 font-mono">
              Instantiate new contract in 1 click with automatic terms and Odoo variant delta.
            </p>

            <form onSubmit={handleCreateFromTemplate} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">SELECT BLUEPRINT</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.paymentTerms})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">CUSTOMER CADRE</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
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
                  <label className="block text-[#f2f0eb] uppercase mb-1">SEATS / UNITS</label>
                  <input
                    type="number"
                    min={1}
                    value={customSeats}
                    onChange={(e) => setCustomSeats(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                  />
                </div>

                <div>
                  <label className="block text-[#f2f0eb] uppercase mb-1">VARIANT BUNDLE</label>
                  <label className="flex items-center gap-2 p-2 bg-[#1a1a1a] border border-[#2d2d2d] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeOdooVariant}
                      onChange={(e) => setIncludeOdooVariant(e.target.checked)}
                      className="accent-[#cc0000]"
                    />
                    <span className="text-xs text-white">ODOO BRAND (+560.00)</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-[#1a1a1a] border-l-4 border-[#cc0000] text-xs">
                <div className="text-[#6b6b6b] uppercase">EFFECTIVE PRICING:</div>
                <div className="text-sm font-bold text-white mt-1">
                  Base $1,200 {includeOdooVariant ? '+ $560 Odoo = $1,760' : '+ $0 = $1,200'} &times; {customSeats} Seats = {formatCurrency((includeOdooVariant ? 1760 : 1200) * customSeats)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="con-btn-black !py-2 !px-4 text-xs"
                >
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  className="con-btn !py-2 !px-5 text-xs font-bold"
                >
                  <span>EXECUTE CREATION</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
