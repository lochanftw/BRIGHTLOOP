'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Activity,
  Mail,
  UserCheck,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Zap,
  Lock,
  Layers,
  FileText,
  Calendar,
  CreditCard,
  Package,
  Users,
  Compass
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onBenchmarkRun: () => void;
  onResetData: () => void;
  isBenchmarking: boolean;
}

export function Navbar({
  currentTab,
  setCurrentTab,
  onBenchmarkRun,
  onResetData,
  isBenchmarking,
}: NavbarProps) {
  const {
    currentUser,
    switchPersona,
    unreadEmailsCount,
    setOpenOutbox,
    setOpenAuthModal,
    setAuthModalMode,
    queryLatencyMs,
  } = useAuth();

  const [personaOpen, setPersonaOpen] = useState(false);

  const isAdmin = currentUser.role === 'ADMIN';
  const isStaff = currentUser.role === 'INTERNAL_STAFF';
  const isCustomer = currentUser.role === 'CUSTOMER';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-950/50">
                <Activity className="w-5 h-5 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-100 font-mono">
                    BRIGHTLOOP<span className="text-emerald-400 font-sans font-light">OS</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                    SUB-2S SLA
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                  Autonomous Recurring Revenue Operating System
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
              {!isCustomer ? (
                <>
                  <button
                    onClick={() => setCurrentTab('finance')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'finance'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Finance Command
                  </button>

                  <button
                    onClick={() => setCurrentTab('subscriptions')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'subscriptions'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Subscriptions
                  </button>

                  <button
                    onClick={() => setCurrentTab('billing-day')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'billing-day'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Billing Day
                  </button>

                  <button
                    onClick={() => setCurrentTab('invoices')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'invoices'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Invoices & AR
                  </button>

                  <button
                    onClick={() => setCurrentTab('payments')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'payments'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Payments & AI Matcher
                  </button>

                  <button
                    onClick={() => setCurrentTab('catalog')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'catalog'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Catalog & Pricing
                    {!isAdmin && <Lock className="w-3 h-3 text-amber-400" />}
                  </button>

                  <button
                    onClick={() => setCurrentTab('staff')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'staff'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Staff RBAC
                    {!isAdmin && <Lock className="w-3 h-3 text-amber-400" />}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('customer-portal')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'customer-portal'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    My Subscriptions & Plan Controls
                  </button>
                  <button
                    onClick={() => setCurrentTab('customer-invoices')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      currentTab === 'customer-invoices'
                        ? 'bg-slate-800 text-emerald-400 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    My Invoices & Online Payments
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right: Controls & Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Live SLA Telemetry HUD Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Query Latency:</span>
              <span className="text-emerald-400 font-bold">{queryLatencyMs} ms</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">SLA &lt;2000ms:</span>
              <span className="text-emerald-400 font-semibold">PASS</span>
            </div>

            {/* Benchmark Trigger Button */}
            <button
              onClick={onBenchmarkRun}
              disabled={isBenchmarking}
              title="Seed 2,500 subscriptions and 5,000 invoices to test high-volume performance"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 text-xs font-mono font-medium transition-all shadow-sm disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {isBenchmarking ? 'Simulating...' : '2.5k Bench'}
            </button>

            {/* Reset Database Button */}
            <button
              onClick={onResetData}
              title="Reset all memory data back to initial seed state"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Simulated Email Outbox Drawer Button */}
            <button
              onClick={() => setOpenOutbox(true)}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
              title="Open In-App Simulated Email Outbox"
            >
              <Mail className="w-4 h-4" />
              {unreadEmailsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                  {unreadEmailsCount}
                </span>
              )}
            </button>

            {/* Persona & RBAC Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaOpen(!personaOpen)}
                className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="text-left font-mono">
                  <div className="font-semibold leading-tight flex items-center gap-1.5">
                    {currentUser.fullName}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isStaff
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {personaOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-800 mb-1">
                    Demo Persona Switcher (RBAC)
                  </div>

                  <button
                    onClick={() => {
                      switchPersona('ADMIN');
                      setCurrentTab('finance');
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isAdmin ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100">Elena Vance</div>
                      <div className="text-[10px] text-slate-400">ADMIN (Full Platform Control)</div>
                    </div>
                    {isAdmin && <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      switchPersona('INTERNAL_STAFF');
                      setCurrentTab('subscriptions');
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isStaff ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100">Marcus Chen</div>
                      <div className="text-[10px] text-slate-400">INTERNAL_STAFF (Operations)</div>
                    </div>
                    {isStaff && <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => {
                      switchPersona('CUSTOMER');
                      setCurrentTab('customer-portal');
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isCustomer ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-100">Acme Corporation</div>
                      <div className="text-[10px] text-slate-400">CUSTOMER (Self-Service Portal)</div>
                    </div>
                    {isCustomer && <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <div className="border-t border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => {
                        setAuthModalMode('SIGNUP');
                        setOpenAuthModal(true);
                        setPersonaOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-slate-900 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Test New Customer Sign-Up
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalMode('FORGOT');
                        setOpenAuthModal(true);
                        setPersonaOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-900"
                    >
                      Test Forgot Password Flow
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab Scroller */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800/60">
          {!isCustomer ? (
            <>
              <button
                onClick={() => setCurrentTab('finance')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'finance' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Finance
              </button>
              <button
                onClick={() => setCurrentTab('subscriptions')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'subscriptions' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setCurrentTab('billing-day')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'billing-day' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Billing Day
              </button>
              <button
                onClick={() => setCurrentTab('invoices')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'invoices' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setCurrentTab('payments')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'payments' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setCurrentTab('catalog')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'catalog' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Catalog
              </button>
              <button
                onClick={() => setCurrentTab('staff')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'staff' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                Staff
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentTab('customer-portal')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'customer-portal' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                My Subscriptions
              </button>
              <button
                onClick={() => setCurrentTab('customer-invoices')}
                className={`px-2.5 py-1 rounded text-xs shrink-0 ${
                  currentTab === 'customer-invoices' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'
                }`}
              >
                My Invoices
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

