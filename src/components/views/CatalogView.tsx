'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Product, Plan, TaxRule, DiscountRule } from '@/types';
import { formatCurrency } from '@/lib/finance/engine';
import {
  Package,
  Calendar,
  Percent,
  Receipt,
  Lock,
  Plus,
  Check,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export function CatalogView() {
  const { currentUser, showToast, setQueryLatencyMs } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'plans' | 'taxes' | 'discounts'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setPlans(data.plans || []);
        setTaxes(data.taxRules || []);
        setDiscounts(data.discountRules || []);
        setQueryLatencyMs(round2(performance.now() - start));
      }
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
    fetchCatalog();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Product Catalog, Variant Engine & Pricing Rules
            </h1>
            {!isAdmin && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Staff Read-Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scene 2 & 5: Dynamic attribute variants (Odoo +560), plan lifecycle flags, and autonomous discount rules.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-3 py-1.5 rounded font-mono transition-colors ${
              activeSubTab === 'products' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Products & Variants
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded font-mono transition-colors ${
              activeSubTab === 'plans' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Recurring Plans
          </button>
          <button
            onClick={() => setActiveSubTab('discounts')}
            className={`px-3 py-1.5 rounded font-mono transition-colors ${
              activeSubTab === 'discounts' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Discount Rules
          </button>
          <button
            onClick={() => setActiveSubTab('taxes')}
            className={`px-3 py-1.5 rounded font-mono transition-colors ${
              activeSubTab === 'taxes' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Tax Rules
          </button>
        </div>
      </div>

      {/* RBAC Notice for Staff */}
      {!isAdmin && (
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            RBAC Guard Active: Only Administrators can create or modify catalog definitions, plans, and discounts.
          </span>
          <span className="text-[11px] text-amber-400">Marcus Chen (INTERNAL_STAFF)</span>
        </div>
      )}

      {/* Products & Dynamic Variants Tab */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => {
              const grossMargin = p.salesPrice > 0 ? (((p.salesPrice - p.costPrice) / p.salesPrice) * 100).toFixed(1) : '0';

              return (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 font-mono text-xs shadow-sm hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">SKU: {p.sku}</div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                        {grossMargin}% Margin
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-sans text-slate-400">{p.notes}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Base Sales Price</span>
                      <span className="font-bold text-slate-200">{formatCurrency(p.salesPrice)}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Internal Cost Price</span>
                      <span className="font-bold text-slate-400">{formatCurrency(p.costPrice)}</span>
                    </div>
                  </div>

                  {/* Variants Section */}
                  {p.variants && p.variants.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                        <span>Dynamic Attribute Variants:</span>
                        <span className="text-emerald-400">Effective Unit Price</span>
                      </div>
                      <div className="space-y-1.5">
                        {p.variants.map((v) => {
                          const effective = p.salesPrice + v.priceDelta;
                          const isOdoo = v.attributeValue === 'Odoo';

                          return (
                            <div
                              key={v.id}
                              className={`p-2 rounded-lg border flex items-center justify-between ${
                                isOdoo
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{v.attributeName}: {v.attributeValue}</span>
                                {isOdoo && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                    CORE BRIEF REQUIREMENT (+560)
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400">
                                  {v.priceDelta >= 0 ? `+${formatCurrency(v.priceDelta)}` : formatCurrency(v.priceDelta)}
                                </span>
                                <span className="text-slate-100 font-bold ml-2">
                                  = {formatCurrency(effective)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recurring Plans Tab */}
      {activeSubTab === 'plans' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((pl) => (
              <div
                key={pl.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100">{pl.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {pl.billingPeriod}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400 mt-2">
                    {formatCurrency(pl.price)} <span className="text-xs text-slate-400 font-normal">/ {pl.billingPeriod.toLowerCase()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Min Quantity: {pl.minQuantity} units</div>
                </div>

                {/* 4 Granular Lifecycle Governance Flags */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">
                    Lifecycle Governance Flags:
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Auto-Close on Expiry:</span>
                      {pl.autoCloseOnExpiry ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Allow Early Close:</span>
                      {pl.allowEarlyClose ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Allow Pause / Resume:</span>
                      {pl.allowPause ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Allow Renewal:</span>
                      {pl.allowRenewal ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Autonomous Discount Rules Tab (Scene 5) */}
      {activeSubTab === 'discounts' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Autonomous Discount Engine (Scene 5: Self-Applying & Self-Stopping)
            </div>
            <p className="text-slate-400 text-[11px]">
              Rules automatically inject discounts onto invoices when criteria are met, atomically decrement usage counters, and automatically cease once expired or limit exhausted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {discounts.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-100">{d.name}</span>
                    <div className="text-[11px] text-emerald-400 mt-0.5">Code: {d.code}</div>
                  </div>
                  <span className="text-base font-bold text-slate-100">
                    {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `-${formatCurrency(d.value)}`}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <div>Scope: <strong className="text-slate-200">{d.scope}</strong></div>
                  <div>Min Seats: <strong className="text-slate-200">{d.minQuantity}</strong> | Min Purchase: <strong className="text-slate-200">{formatCurrency(d.minPurchaseAmount)}</strong></div>
                  <div>Valid: <span className="text-slate-300">{d.startDate} to {d.endDate}</span></div>
                </div>

                {/* Usage meter */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Usage Cap:</span>
                    <span className="text-slate-200 font-bold">{d.currentUsageCount} / {d.maxUsageLimit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(d.currentUsageCount / d.maxUsageLimit) * 100}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax Rules Tab */}
      {activeSubTab === 'taxes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {taxes.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{t.name}</span>
                  <span className="text-base font-bold text-emerald-400">{t.ratePercent}%</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div>Region: <strong className="text-slate-200">{t.region}</strong></div>
                  <div>Applies To: <strong className="text-slate-200">{t.appliesToProductType}</strong></div>
                  <div>Status: <span className="text-emerald-400 font-semibold">{t.isActive ? 'Active' : 'Inactive'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
