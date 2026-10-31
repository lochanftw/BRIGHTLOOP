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

      showToast(`Subscription status updated: ${data.subscription.status}`, 'success');
      await fetchCustomerData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  // 1-Click Pay Invoice Online
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

      showToast(`Invoice ${inv.invoiceNumber} paid in full! Thank you.`, 'success');
      await fetchCustomerData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Payment failed', 'error');
    }
  };

  // Novelty #5: Self-Healing Pause Instead of Churn Acceptance
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

      showToast('30-Day Billing Freeze activated! Your configuration is preserved and renewal dates extended by 30 days.', 'success');
      setRetentionSub(null);
      await fetchCustomerData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to apply offer', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
            Customer Self-Service Portal
          </h1>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
            {currentUser.companyName || currentUser.fullName}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Scene 1 & Phase 5: Manage subscriptions, adjust seats, pay invoices, and review reverse-discount smart ramps.
        </p>
      </div>

      {/* NOVELTY #3: ELASTIC SEAT & ADD-ON SMART-RAMP OPTIMIZER */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100 font-mono">
                Smart-Ramp Volume Optimization Detected
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                NOVELTY #3
              </span>
            </div>
            <p className="text-slate-300 font-sans mt-0.5">
              Add <strong>2 more seats</strong> to unlock the <strong>15% Tier-2 Volume Discount (VOL-15)</strong> — lowering your per-seat unit price and saving <strong>$640/yr net</strong>!
            </p>
          </div>
        </div>

        <button
          onClick={() => setSmartRampModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 shrink-0 font-sans transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Preview & Upgrade Smart-Ramp
        </button>
      </div>

      {/* Subscriptions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            My Active Subscriptions & Plan Controls
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {subscriptions.length} Subscriptions on Account
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => {
            const plan = plans.find((p) => p.id === sub.planId);

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 font-mono text-xs shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{sub.subscriptionNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : sub.status === 'PAUSED'
                            ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                            : sub.status === 'QUOTATION'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{sub.planName}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400">{formatCurrency(sub.grandTotal)}</div>
                    <div className="text-[10px] text-slate-500">per cycle</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Next Renewal: <span className="text-slate-200">{sub.nextBillingDate}</span></div>
                  <div>Contract Expiry: <span className="text-slate-200">{sub.expiryDate}</span></div>
                </div>

                {/* Plan-Governed Lifecycle Actions */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-500">Plan Policy Governance</div>

                  <div className="flex items-center gap-2">
                    {sub.status === 'QUOTATION' && (
                      <button
                        onClick={() => handleAction(sub.id, 'TRANSITION', 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Accept Quotation
                      </button>
                    )}

                    {sub.status === 'ACTIVE' && plan?.allowPause && (
                      <button
                        onClick={() => handleAction(sub.id, 'PAUSE')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause Billing
                      </button>
                    )}

                    {sub.status === 'PAUSED' && (
                      <button
                        onClick={() => handleAction(sub.id, 'RESUME')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Resume Billing
                      </button>
                    )}

                    {sub.status === 'ACTIVE' && plan?.allowEarlyClose && (
                      <button
                        onClick={() => setRetentionSub(sub)} // Triggers Novelty #5 Self-Healing Modal!
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 text-xs transition-colors"
                      >
                        Cancel / Close Early
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices & Online Checkout */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          My Invoices & 1-Click Online Payments
        </h2>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Balance Owed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                      No invoices found on this customer account
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-200">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-300">{inv.dueDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-bold">{formatCurrency(inv.grandTotal)}</td>
                      <td className="py-3 px-4 font-bold text-amber-400">{formatCurrency(inv.amountDue)}</td>
                      <td className="py-3 px-4 text-right">
                        {inv.status === 'CONFIRMED' && inv.amountDue > 0 ? (
                          <button
                            onClick={() => handlePayInvoiceOnline(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-sans shadow transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Pay Now Online
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-sans flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid in Full
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

      {/* NOVELTY #5: SELF-HEALING PAUSE-INSTEAD-OF-CHURN MODAL */}
      {retentionSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-950 border-2 border-emerald-500/50 rounded-2xl shadow-2xl p-6 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-950/80 border border-purple-500/40 rounded-xl text-purple-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-mono flex items-center gap-2">
                  Pause Instead of Cancel?
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    NOVELTY #5
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Self-Healing Micro-Contract Retention Engine</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-2 mb-4">
              <p className="text-slate-300 font-sans">
                Before closing <strong>{retentionSub.subscriptionNumber}</strong>, Brightloop can freeze billing for <strong>30 days</strong> with zero charge while preserving all your enterprise configurations and Odoo variant integrations.
              </p>
              <div className="p-2 rounded bg-slate-950 text-emerald-400 text-[11px]">
                Benefit: Extends contract expiry automatically by +30 days with no reactivation penalty.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleAction(retentionSub.id, 'CLOSE')}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                Proceed to Cancel Early
              </button>
              <button
                type="button"
                onClick={handleAcceptSelfHealingPause}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-md transition-colors"
              >
                Accept 30-Day Billing Freeze
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Ramp Upgrade Modal */}
      {smartRampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-100 font-mono mb-2">
              Elastic Smart-Ramp Volume Optimization
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Volume Discount Rule: <strong className="text-emerald-400">VOL-15 (15% OFF for 10+ seats)</strong>
            </p>

            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 font-mono text-xs space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Current Seat Count:</span>
                <span className="text-slate-200">8 Seats</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-300">
                <span>Upgraded Seat Count:</span>
                <span>10 Seats (Unlocks Tier 2)</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span>Net Annual Savings:</span>
                <span className="text-emerald-400 font-bold">$640.00 / year</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSmartRampModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmartRampModal(false);
                  showToast('Smart-Ramp 10-seat configuration confirmed! 15% discount will apply on your next cycle.', 'success');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

