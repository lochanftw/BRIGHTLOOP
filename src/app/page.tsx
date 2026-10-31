'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { EmailDrawer } from '@/components/outbox/EmailDrawer';
import { AuthModal } from '@/components/auth/AuthModal';

import { FinanceDashboard } from '@/components/views/FinanceDashboard';
import { SubscriptionsView } from '@/components/views/SubscriptionsView';
import { BillingDayView } from '@/components/views/BillingDayView';
import { InvoicesView } from '@/components/views/InvoicesView';
import { PaymentsView } from '@/components/views/PaymentsView';
import { CatalogView } from '@/components/views/CatalogView';
import { StaffView } from '@/components/views/StaffView';
import { CustomerPortalView } from '@/components/views/CustomerPortalView';

import { Zap, ShieldCheck, CheckCircle2, AlertCircle, Info, Flame } from 'lucide-react';

export default function Home() {
  const { currentUser, toast, showToast, setQueryLatencyMs } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('finance');
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Automatically switch tab if role is customer
  React.useEffect(() => {
    if (currentUser.role === 'CUSTOMER') {
      setCurrentTab('customer-portal');
    } else if (currentTab === 'customer-portal' || currentTab === 'customer-invoices') {
      setCurrentTab('finance');
    }
  }, [currentUser.role]);

  // High-Volume Benchmark Trigger
  const handleBenchmarkRun = async () => {
    setIsBenchmarking(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEED_BENCHMARK', count: 2500 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Benchmark failed');

      const elapsed = (performance.now() - start).toFixed(1);
      setQueryLatencyMs(parseFloat(elapsed));

      showToast(
        `CONSTRUCTIVIST STRESS BENCHMARK PASS: 2,500 SUBSCRIPTIONS INDEXED IN ${elapsed} MS!`,
        'success'
      );
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Benchmark failed', 'error');
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Reset database state
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');

      showToast('REVOLUTIONARY LEDGER RESET TO SEED STATE.', 'info');
      window.location.reload();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Reset failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col text-white selection:bg-[#cc0000] selection:text-white">
      {/* Top Constructivist Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onBenchmarkRun={handleBenchmarkRun}
        onResetData={handleResetData}
        isBenchmarking={isBenchmarking}
      />

      {/* Constructivist Diagonal Stripe Separator */}
      <div className="con-stripe-thin w-full" />

      {/* Manifesto Marquee Header */}
      <div className="bg-[#000000] border-b border-[#2d2d2d] py-2 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-['Bebas_Neue'] tracking-widest text-[#f2f0eb]">
          <div className="flex items-center gap-3">
            <span className="text-[#cc0000] flex items-center gap-1 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" />
              CONSTRUCTIVIST DOCTRINE:
            </span>
            <span className="text-[#e8e0d0]">
              ART INTO LIFE &middot; ZERO REVENUE LEAKAGE &middot; DIAGONAL COMPOSITION &middot; 100% IDEMPOTENCY
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[#6b6b6b]">
            <span>PRECISION DECIMALS: DECIMAL(18,4)</span>
            <span>&middot;</span>
            <span className="text-[#cc0000]">ODOO BRAND (+560.00) VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'finance' && <FinanceDashboard onSelectTab={setCurrentTab} />}
        {currentTab === 'subscriptions' && <SubscriptionsView />}
        {currentTab === 'billing-day' && <BillingDayView />}
        {currentTab === 'invoices' && <InvoicesView />}
        {currentTab === 'payments' && <PaymentsView />}
        {currentTab === 'catalog' && <CatalogView />}
        {currentTab === 'staff' && <StaffView />}
        {currentTab === 'customer-portal' && <CustomerPortalView />}
        {currentTab === 'customer-invoices' && <InvoicesView />}
      </main>

      {/* Constructivist Diagonal Stripe Accent Above Footer */}
      <div className="con-stripe w-full" />

      {/* Constructivist Industrial Footer */}
      <footer className="border-t-4 border-[#000000] bg-[#000000] py-8 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-['Roboto_Condensed']">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#cc0000] flex items-center justify-center font-['Bebas_Neue'] text-xl font-bold transform -skew-x-6">
              BL
            </div>
            <div>
              <div className="font-['Bebas_Neue'] text-lg tracking-wider text-white">
                BRIGHTLOOP OS // REVOLUTIONARY BILLING ARCHITECTURE
              </div>
              <div className="text-xs text-[#6b6b6b]">
                Soviet-Era Constructivism Meets High-Speed Autonomous FinTech Systems &middot; Sub-2-Second Response SLA
              </div>
            </div>
          </div>

          <div className="text-xs text-[#6b6b6b] text-center md:text-right font-mono">
            <div>CRYPTOGRAPHIC SHA-256 HASH-CHAINED LEDGER</div>
            <div className="text-[#f2f0eb] mt-0.5">Designed with Bebas Neue, Red (#CC0000), Pure Black & Steel Angles</div>
          </div>
        </div>
      </footer>

      {/* Drawers & Modals */}
      <EmailDrawer />
      <AuthModal />

      {/* Toast Notification Container in Constructivist Style */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#000000] border-l-4 border-[#cc0000] shadow-2xl text-xs font-['Bebas_Neue'] tracking-wider uppercase text-white animate-in slide-in-from-bottom duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#cc0000] shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#cc0000] shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-white shrink-0" />}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
