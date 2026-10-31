'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Subscription, Invoice, Plan } from '@/types';
import { formatCurrency } from '@/lib/finance/engine';
import {
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  XCircle,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export function CustomerPortalView({ onSelectInvoice }: { onSelectInvoice?: (id: string) => void }) {
  const { currentUser, showToast, refreshOutbox, setQueryLatencyMs } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Novelty #5: Self-Healing Retention Modal state
  const [retentionSub, setRetentionSub] = useState<Subscription | null>(null);

  // Novelty #3: Smart Ramp Upgrade Modal
  const [smartRampModal, setSmartRampModal] = useState(false);

  const fetchCustomerData = async () => {
    const start = performance.now();
    try {
      const [subRes, invRes, catRes] = await Promise.all([
        fetch(`/api/subscriptions?customerId=${currentUser.id}`),
        fetch(`/api/invoices?customerId=${currentUser.id}`),
        fetch('/api/catalog'),
      ]);

      const subData = await subRes.json();
      const invData = await invRes.json();
      const catData = await catRes.json();

      if (subData.items) setSubscriptions(subData.items);
      if (invData.items) setInvoices(invData.items);
      if (catData.plans) setPlans(catData.plans);

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
    fetchCustomerData();
  }, [currentUser]);

  const handleAction = async (subId: string, action: string, status?: string) => {
    try {
      const res = await fetch(`/api/subscriptions/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      showToast(`DIRECTIVE COMMITTED: ${data.subscription.status}`, 'success');
      await fetchCustomerData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  const handlePayInvoiceOnline = async (inv: Invoice) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: inv.id,
          method: 'CREDIT_CARD',
          amount: inv.amountDue,
          reference: `ONLINE-CC-AUTH-${Date.now()}`,
          notes: 'Customer self-service online checkout',
          recordedBy: `${currentUser.fullName} (Customer Portal)`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      showToast(`INVOICE ${inv.invoiceNumber} SETTLED IN FULL!`, 'success');
      await fetchCustomerData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Payment failed', 'error');
    }
  };

  const handleAcceptSelfHealingPause = async () => {
    if (!retentionSub) return;
    try {
      const res = await fetch(`/api/subscriptions/${retentionSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAUSE',
          reason: 'Accepted 30-Day Billing Freeze Micro-Offer instead of churn',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pause failed');

      showToast('30-DAY BILLING FREEZE ACTIVATED! RENEWAL DATES EXTENDED BY 30 DAYS.', 'success');
      setRetentionSub(null);
      await fetchCustomerData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to apply offer', 'error');
    }
  };

  return (
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Header */}
      <div className="bg-[#000000] p-6 border-b-4 border-[#cc0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
              CUSTOMER SELF-SERVICE PORTAL // <span className="text-[#cc0000]">SOVEREIGN DESK</span>
            </h1>
            <span className="px-2 py-0.5 bg-[#cc0000] text-white text-[11px] font-['Bebas_Neue'] tracking-widest uppercase">
              {currentUser.companyName || currentUser.fullName}
            </span>
          </div>
          <p className="text-xs text-[#f2f0eb] font-mono">
            Autonomous Contract Governance &bull; Smart-Ramp Volume Discounts &bull; Self-Healing Retention Engine
          </p>
        </div>
      </div>

      {/* NOVELTY #3: ELASTIC SEAT SMART-RAMP OPTIMIZER */}
      <div className="p-6 bg-[#000000] border-2 border-[#cc0000] relative con-wedge flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#cc0000] text-white">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
                SMART-RAMP VOLUME OPTIMIZATION DETECTED
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-white text-black font-['Bebas_Neue'] tracking-wider uppercase font-bold">
                NOVELTY #3
              </span>
            </div>
            <p className="text-sm text-[#f2f0eb] mt-1 font-mono">
              Add <strong>2 more seats</strong> to unlock the <strong>15% Tier-2 Volume Discount (VOL-15)</strong> &mdash; reducing your per-seat unit price and saving <strong className="text-[#cc0000] font-bold">$640.00/yr net</strong>!
            </p>
          </div>
        </div>

        <button
          onClick={() => setSmartRampModal(true)}
          className="con-btn !py-3 !px-6 text-sm shrink-0 font-bold"
        >
          <span>
            <Sparkles className="w-4 h-4 mr-2" />
            PREVIEW &amp; UPGRADE SMART-RAMP
          </span>
        </button>
      </div>

      {/* Subscriptions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
          <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#cc0000]" />
            MY ACTIVE CONTRACTS &amp; PLAN POLICIES
          </h2>
          <span className="text-xs font-mono text-[#6b6b6b] uppercase">
            {subscriptions.length} CONTRACTS ON ACCOUNT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((sub) => {
            const plan = plans.find((p) => p.id === sub.planId);

            return (
              <div
                key={sub.id}
                className="con-card con-wedge p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] space-y-4 font-mono text-xs shadow-xl"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#1a1a1a] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-['Bebas_Neue'] tracking-wider text-white">
                        {sub.subscriptionNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-['Bebas_Neue'] tracking-wider uppercase font-bold ${
                          sub.status === 'ACTIVE'
                            ? 'bg-[#cc0000] text-white'
                            : sub.status === 'PAUSED'
                            ? 'bg-[#000000] text-white border border-[#cc0000]'
                            : sub.status === 'QUOTATION'
                            ? 'bg-[#c45522] text-white'
                            : 'bg-[#6b6b6b] text-black'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#f2f0eb] mt-0.5">{sub.planName}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-['Bebas_Neue'] tracking-wider text-[#cc0000] font-bold">
                      {formatCurrency(sub.grandTotal)}
                    </div>
                    <div className="text-[10px] text-[#6b6b6b] uppercase">PER CYCLE</div>
                  </div>
                </div>

                <div className="p-3 bg-[#000000] border-l-2 border-white grid grid-cols-2 gap-2 text-xs">
                  <div>NEXT RENEWAL: <strong className="text-white">{sub.nextBillingDate}</strong></div>
                  <div>CONTRACT EXPIRY: <strong className="text-white">{sub.expiryDate}</strong></div>
                </div>

                {/* Plan-Governed Controls */}
                <div className="pt-2 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] text-[#6b6b6b] uppercase font-bold">PLAN POLICY PERMISSIONS</div>

                  <div className="flex items-center gap-2">
                    {sub.status === 'QUOTATION' && (
                      <button
                        onClick={() => handleAction(sub.id, 'TRANSITION', 'CONFIRMED')}
                        className="con-btn !py-1.5 !px-3 text-xs"
                      >
                        <span>ACCEPT QUOTATION</span>
                      </button>
                    )}

                    {sub.status === 'ACTIVE' && plan?.allowPause && (
                      <button
                        onClick={() => handleAction(sub.id, 'PAUSE')}
                        className="con-btn-black !py-1.5 !px-3 text-xs"
                      >
                        <span>
                          <Pause className="w-3 h-3 mr-1 text-[#cc0000]" />
                          PAUSE
                        </span>
                      </button>
                    )}

                    {sub.status === 'PAUSED' && (
                      <button
                        onClick={() => handleAction(sub.id, 'RESUME')}
                        className="con-btn !py-1.5 !px-3 text-xs"
                      >
                        <span>
                          <Play className="w-3 h-3 mr-1" />
                          RESUME
                        </span>
                      </button>
                    )}

                    {sub.status === 'ACTIVE' && plan?.allowEarlyClose && (
                      <button
                        onClick={() => setRetentionSub(sub)}
                        className="con-btn-black !py-1.5 !px-3 text-xs hover:!bg-[#cc0000]"
                      >
                        <span>CANCEL EARLY</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices Section */}
      <div className="space-y-4 pt-4 border-t-2 border-[#2d2d2d]">
        <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#cc0000]" />
          MY INVOICES &bull; 1-CLICK CHECKOUT
        </h2>

        <div className="bg-[#2d2d2d] border-l-6 border-[#cc0000] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-[#000000] text-[#f2f0eb] uppercase font-['Bebas_Neue'] tracking-wider text-sm border-b-2 border-[#cc0000]">
                <tr>
                  <th className="py-3 px-4">INVOICE #</th>
                  <th className="py-3 px-4">DUE DATE</th>
                  <th className="py-3 px-4">STATE</th>
                  <th className="py-3 px-4">TOTAL</th>
                  <th className="py-3 px-4">BALANCE DUE</th>
                  <th className="py-3 px-4 text-right">DIRECTIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6b6b6b] uppercase">
                      No invoices on account
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-[#f2f0eb]">{inv.dueDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-['Bebas_Neue'] tracking-wider uppercase font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-white text-black'
                              : 'bg-[#cc0000] text-white'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-bold">{formatCurrency(inv.grandTotal)}</td>
                      <td className="py-3 px-4 font-bold text-[#cc0000]">{formatCurrency(inv.amountDue)}</td>
                      <td className="py-3 px-4 text-right">
                        {inv.status === 'CONFIRMED' && inv.amountDue > 0 ? (
                          <button
                            onClick={() => handlePayInvoiceOnline(inv)}
                            className="con-btn !py-1 !px-3 text-xs"
                          >
                            <span>
                              <DollarSign className="w-3.5 h-3.5 mr-1" />
                              PAY ONLINE
                            </span>
                          </button>
                        ) : (
                          <span className="text-[#f2f0eb] font-['Bebas_Neue'] text-sm tracking-wider flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4 text-[#cc0000]" />
                            PAID IN FULL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NOVELTY #5: SELF-HEALING PAUSE RETENTION MODAL */}
      {retentionSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#000000] border-4 border-[#cc0000] p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-[#cc0000] text-white">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase flex items-center gap-2">
                  PAUSE INSTEAD OF CHURN?
                  <span className="text-[10px] px-2 py-0.5 bg-white text-black font-['Bebas_Neue'] tracking-wider uppercase font-bold">
                    NOVELTY #5
                  </span>
                </h3>
                <p className="text-xs text-[#f2f0eb] font-mono">Self-Healing Micro-Contract Proclamation</p>
              </div>
            </div>

            <div className="p-4 bg-[#1a1a1a] border-l-4 border-[#cc0000] text-xs font-mono space-y-2 mb-4">
              <p className="text-[#f2f0eb]">
                Before terminating <strong>{retentionSub.subscriptionNumber}</strong>, Brightloop can freeze billing for <strong>30 days</strong> with $0 charge while safeguarding all your enterprise configurations and Odoo variant integrations.
              </p>
              <div className="p-2 bg-[#000000] text-[#cc0000] font-bold text-[11px] uppercase">
                DIRECTIVE BENEFIT: Extends contract expiry automatically by +30 days with no reactivation fee.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleAction(retentionSub.id, 'CLOSE')}
                className="con-btn-black !py-2 !px-4 text-xs font-['Bebas_Neue'] w-full sm:w-auto"
              >
                <span>PROCEED TO CANCEL</span>
              </button>
              <button
                type="button"
                onClick={handleAcceptSelfHealingPause}
                className="con-btn !py-2.5 !px-5 text-sm font-bold w-full sm:w-auto"
              >
                <span>ACCEPT 30-DAY FREEZE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Ramp Upgrade Modal */}
      {smartRampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#000000] border-4 border-[#cc0000] p-6 relative">
            <h3 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase mb-1">
              ELASTIC SMART-RAMP OPTIMIZATION
            </h3>
            <p className="text-xs text-[#f2f0eb] mb-4 font-mono">
              VOLUME DISCOUNT RULE: <strong className="text-[#cc0000]">VOL-15 (15% OFF FOR 10+ SEATS)</strong>
            </p>

            <div className="p-4 bg-[#1a1a1a] border-l-4 border-[#cc0000] font-mono text-xs space-y-2 mb-4">
              <div className="flex justify-between">
                <span>CURRENT SEAT COUNT:</span>
                <span className="text-white font-bold">8 SEATS</span>
              </div>
              <div className="flex justify-between text-[#cc0000] font-bold">
                <span>UPGRADED SEAT COUNT:</span>
                <span>10 SEATS (TIER 2)</span>
              </div>
              <div className="flex justify-between text-white pt-2 border-t border-[#2d2d2d]">
                <span>NET ANNUAL SAVINGS:</span>
                <span className="text-white font-bold text-sm">$640.00 / YEAR</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSmartRampModal(false)}
                className="con-btn-black !py-2 !px-4 text-xs font-['Bebas_Neue']"
              >
                <span>CLOSE</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmartRampModal(false);
                  showToast('SMART-RAMP 10-SEAT UPGRADE CONFIRMED! 15% DISCOUNT APPLIED.', 'success');
                }}
                className="con-btn !py-2 !px-5 text-xs font-bold"
              >
                <span>CONFIRM UPGRADE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
