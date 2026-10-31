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
    <header className="sticky top-0 z-40 bg-[#000000] border-b-2 border-[#cc0000] shadow-2xl relative">
      {/* Constructivist Bottom Angular Accent */}
      <div className="absolute bottom-0 left-0 w-56 h-1 bg-[#cc0000] transform -skew-x-[25deg] origin-bottom-left" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand & Constructivist Monolith */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 bg-[#cc0000] text-white shadow-lg transform -skew-x-6">
                <span className="font-['Bebas_Neue'] text-2xl tracking-tighter transform skew-x-6 font-bold">
                  BL
                </span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border border-[#000000]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold tracking-wider text-white font-['Bebas_Neue']">
                    BRIGHTLOOP<span className="text-[#cc0000]">.OS</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-['Bebas_Neue'] bg-[#cc0000] text-white tracking-widest uppercase transform -skew-x-6">
                    <span className="transform skew-x-6">REVOLUTIONARY SPEED</span>
                  </span>
                </div>
                <div className="text-[11px] text-[#6b6b6b] uppercase font-['Roboto_Condensed'] tracking-wider hidden sm:block">
                  Autonomous Recurring Revenue Engine // Moscow 1921 &middot; SF 2026
                </div>
              </div>
            </div>

            {/* Navigation Links in Bebas Neue */}
            <nav className="hidden xl:flex items-center space-x-1 pl-4 border-l border-[#2d2d2d]">
              {!isCustomer ? (
                <>
                  <button
                    onClick={() => setCurrentTab('finance')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'finance'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'finance' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <Activity className="w-4 h-4" />
                      Finance Command
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('subscriptions')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'subscriptions'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'subscriptions' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <Layers className="w-4 h-4" />
                      Subscriptions
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('billing-day')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'billing-day'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'billing-day' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <Calendar className="w-4 h-4" />
                      Billing Day
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('invoices')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'invoices'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'invoices' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <FileText className="w-4 h-4" />
                      Invoices & AR
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('payments')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'payments'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'payments' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <CreditCard className="w-4 h-4" />
                      Payments & AI Matcher
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('catalog')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'catalog'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'catalog' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <Package className="w-4 h-4" />
                      Catalog
                      {!isAdmin && <Lock className="w-3 h-3 text-[#c45522]" />}
                    </span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('staff')}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'staff'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'staff' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <Users className="w-4 h-4" />
                      Staff
                      {!isAdmin && <Lock className="w-3 h-3 text-[#c45522]" />}
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentTab('customer-portal')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'customer-portal'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'customer-portal' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <Compass className="w-4 h-4" />
                      My Subscriptions & Plan Controls
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('customer-invoices')}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-['Bebas_Neue'] tracking-wider uppercase transition-all ${
                      currentTab === 'customer-invoices'
                        ? 'bg-[#cc0000] text-white transform -skew-x-6'
                        : 'text-[#f2f0eb] hover:text-[#cc0000] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span className={currentTab === 'customer-invoices' ? 'transform skew-x-6 inline-flex items-center gap-1.5' : 'inline-flex items-center gap-1.5'}>
                      <FileText className="w-4 h-4" />
                      My Invoices & Online Checkout
                    </span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right: Controls & Persona Switcher */}
          <div className="flex items-center gap-3">
            {/* Constructivist SLA Telemetry HUD */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border-l-4 border-[#cc0000] font-mono text-xs">
              <span className="w-2 h-2 bg-[#cc0000] animate-ping" />
              <span className="text-[#6b6b6b] uppercase">LATENCY:</span>
              <span className="text-[#ffffff] font-bold">{queryLatencyMs} MS</span>
              <span className="text-[#6b6b6b]">/</span>
              <span className="text-[#cc0000] font-bold">SLA PASS</span>
            </div>

            {/* Benchmark Trigger Button */}
            <button
              onClick={onBenchmarkRun}
              disabled={isBenchmarking}
              title="Seed 2,500 subscriptions and 5,000 invoices"
              className="con-btn !py-2 !px-3 text-sm !bg-[#cc0000] hover:!bg-[#990000] disabled:opacity-50"
            >
              <span>
                <Zap className="w-4 h-4 mr-1 text-white" />
                {isBenchmarking ? 'SIMULATING...' : '2.5K BENCH'}
              </span>
            </button>

            {/* Reset Database Button */}
            <button
              onClick={onResetData}
              title="Reset all memory data back to initial seed state"
              className="p-2.5 bg-[#1a1a1a] hover:bg-[#cc0000] text-[#f2f0eb] hover:text-white transition-colors border border-[#2d2d2d]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Simulated Email Outbox Button */}
            <button
              onClick={() => setOpenOutbox(true)}
              className="relative p-2.5 bg-[#1a1a1a] hover:bg-[#cc0000] text-[#f2f0eb] hover:text-white border border-[#2d2d2d] transition-colors"
              title="Open In-App Simulated Email Outbox"
            >
              <Mail className="w-4 h-4" />
              {unreadEmailsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-[#cc0000] text-[10px] font-bold text-white font-mono">
                  {unreadEmailsCount}
                </span>
              )}
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPersonaOpen(!personaOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-l-2 border-[#cc0000] hover:bg-[#2d2d2d] text-white text-xs transition-colors"
              >
                <div className="w-2.5 h-2.5 bg-[#cc0000] transform rotate-45" />
                <div className="text-left font-['Roboto_Condensed']">
                  <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider">
                    {currentUser.fullName}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 font-['Bebas_Neue'] tracking-wider ${
                        isAdmin
                          ? 'bg-[#cc0000] text-white'
                          : isStaff
                          ? 'bg-[#2d2d2d] text-white border border-[#cc0000]'
                          : 'bg-[#f2f0eb] text-black font-bold'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#6b6b6b]" />
              </button>

              {personaOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#000000] border-2 border-[#cc0000] shadow-2xl p-2 z-50">
                  <div className="px-2 py-1 text-[11px] font-['Bebas_Neue'] uppercase tracking-widest text-[#6b6b6b] border-b border-[#2d2d2d] mb-1">
                    ACTIVE PERSONA CONTROLLER (RBAC)
                  </div>

                  <button
                    onClick={() => {
                      switchPersona('ADMIN');
                      setCurrentTab('finance');
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors border-l-4 ${
                      isAdmin ? 'bg-[#1a1a1a] border-[#cc0000] text-white' : 'border-transparent hover:bg-[#1a1a1a] text-[#f2f0eb]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white font-['Bebas_Neue'] text-sm tracking-wider">Elena Vance</div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase">ADMIN (Full Platform Command)</div>
                    </div>
                    {isAdmin && <UserCheck className="w-4 h-4 text-[#cc0000]" />}
                  </button>

                  <button
                    onClick={() => {
                      switchPersona('INTERNAL_STAFF');
                      setCurrentTab('subscriptions');
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors border-l-4 ${
                      isStaff ? 'bg-[#1a1a1a] border-[#cc0000] text-white' : 'border-transparent hover:bg-[#1a1a1a] text-[#f2f0eb]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white font-['Bebas_Neue'] text-sm tracking-wider">Marcus Chen</div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase">INTERNAL_STAFF (Operations)</div>
                    </div>
                    {isStaff && <UserCheck className="w-4 h-4 text-[#cc0000]" />}
                  </button>

                  <button
                    onClick={() => {
                      switchPersona('CUSTOMER');
                      setCurrentTab('customer-portal');
                      setPersonaOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition-colors border-l-4 ${
                      isCustomer ? 'bg-[#1a1a1a] border-[#cc0000] text-white' : 'border-transparent hover:bg-[#1a1a1a] text-[#f2f0eb]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white font-['Bebas_Neue'] text-sm tracking-wider">Acme Corporation</div>
                      <div className="text-[10px] text-[#6b6b6b] uppercase">CUSTOMER (Self-Service Portal)</div>
                    </div>
                    {isCustomer && <UserCheck className="w-4 h-4 text-[#cc0000]" />}
                  </button>

                  <div className="border-t border-[#2d2d2d] my-1 pt-1 space-y-1">
                    <button
                      onClick={() => {
                        setAuthModalMode('SIGNUP');
                        setOpenAuthModal(true);
                        setPersonaOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-['Bebas_Neue'] tracking-wider text-[#cc0000] hover:bg-[#1a1a1a] flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      TEST NEW CUSTOMER REGISTRATION
                    </button>
                    <button
                      onClick={() => {
                        setAuthModalMode('FORGOT');
                        setOpenAuthModal(true);
                        setPersonaOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-['Bebas_Neue'] tracking-wider text-[#6b6b6b] hover:text-white hover:bg-[#1a1a1a]"
                    >
                      TEST PASSWORD RESET TOKEN FLOW
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Tab Scroller */}
        <div className="xl:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-[#2d2d2d]">
          {!isCustomer ? (
            <>
              <button
                onClick={() => setCurrentTab('finance')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'finance' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Finance
              </button>
              <button
                onClick={() => setCurrentTab('subscriptions')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'subscriptions' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Subscriptions
              </button>
              <button
                onClick={() => setCurrentTab('billing-day')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'billing-day' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Billing Day
              </button>
              <button
                onClick={() => setCurrentTab('invoices')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'invoices' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setCurrentTab('payments')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'payments' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setCurrentTab('catalog')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'catalog' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Catalog
              </button>
              <button
                onClick={() => setCurrentTab('staff')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'staff' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                Staff
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentTab('customer-portal')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'customer-portal' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
                }`}
              >
                My Subscriptions
              </button>
              <button
                onClick={() => setCurrentTab('customer-invoices')}
                className={`px-3 py-1 text-xs font-['Bebas_Neue'] tracking-wider uppercase shrink-0 ${
                  currentTab === 'customer-invoices' ? 'bg-[#cc0000] text-white' : 'text-[#f2f0eb]'
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
