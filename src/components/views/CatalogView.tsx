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
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Header */}
      <div className="bg-[#000000] p-6 border-b-4 border-[#cc0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
              CATALOG ARSENAL // <span className="text-[#cc0000]">PRICING MATRIX</span>
            </h1>
            {!isAdmin && (
              <span className="px-2 py-0.5 bg-[#c45522] text-white text-[11px] font-['Bebas_Neue'] tracking-widest uppercase flex items-center gap-1">
                <Lock className="w-3 h-3" />
                STAFF READ-ONLY
              </span>
            )}
          </div>
          <p className="text-xs text-[#f2f0eb] font-mono">
            Scene 2 & 5: Odoo (+560.00) Dynamic Variant Delta &bull; Plan Policy Flags &bull; Autonomous Discounts
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] p-1 border border-[#2d2d2d] text-xs">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all ${
              activeSubTab === 'products' ? 'bg-[#cc0000] text-white font-bold' : 'text-[#f2f0eb] hover:bg-[#2d2d2d]'
            }`}
          >
            PRODUCTS &amp; VARIANTS
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all ${
              activeSubTab === 'plans' ? 'bg-[#cc0000] text-white font-bold' : 'text-[#f2f0eb] hover:bg-[#2d2d2d]'
            }`}
          >
            RECURRING PLANS
          </button>
          <button
            onClick={() => setActiveSubTab('discounts')}
            className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all ${
              activeSubTab === 'discounts' ? 'bg-[#cc0000] text-white font-bold' : 'text-[#f2f0eb] hover:bg-[#2d2d2d]'
            }`}
          >
            DISCOUNTS
          </button>
          <button
            onClick={() => setActiveSubTab('taxes')}
            className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all ${
              activeSubTab === 'taxes' ? 'bg-[#cc0000] text-white font-bold' : 'text-[#f2f0eb] hover:bg-[#2d2d2d]'
            }`}
          >
            TAX RULES
          </button>
        </div>
      </div>

      {/* RBAC Notice for Staff */}
      {!isAdmin && (
        <div className="p-4 bg-[#000000] border-l-6 border-[#c45522] text-[#f2f0eb] text-xs font-mono flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#c45522]" />
            RBAC DIRECTIVE: Only Administrators can modify catalog definitions, plans, and discounts.
          </span>
          <span className="text-[11px] text-[#c45522] font-bold">MARCUS CHEN (INTERNAL_STAFF)</span>
        </div>
      )}

      {/* Products Tab */}
      {activeSubTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => {
            const grossMargin = p.salesPrice > 0 ? (((p.salesPrice - p.costPrice) / p.salesPrice) * 100).toFixed(1) : '0';

            return (
              <div
                key={p.id}
                className="con-card con-wedge p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] space-y-4 font-mono text-xs shadow-xl"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#1a1a1a] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-['Bebas_Neue'] tracking-wider text-white">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-[#000000] text-[#cc0000] font-bold border border-[#cc0000]">
                        {p.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6b6b6b] mt-0.5">SKU: {p.sku}</div>
                  </div>

                  <span className="px-2 py-1 bg-[#cc0000] text-white text-xs font-['Bebas_Neue'] tracking-wider font-bold">
                    {grossMargin}% MARGIN
                  </span>
                </div>

                <p className="text-xs text-[#f2f0eb] leading-relaxed font-sans">{p.notes}</p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-[#000000] border-l-2 border-white">
                    <span className="text-[10px] text-[#6b6b6b] block uppercase">BASE SALES PRICE</span>
                    <span className="text-xl font-bold font-['Bebas_Neue'] tracking-wider text-white">{formatCurrency(p.salesPrice)}</span>
                  </div>
                  <div className="p-3 bg-[#000000] border-l-2 border-[#6b6b6b]">
                    <span className="text-[10px] text-[#6b6b6b] block uppercase">COST PRICE</span>
                    <span className="text-xl font-bold font-['Bebas_Neue'] tracking-wider text-[#6b6b6b]">{formatCurrency(p.costPrice)}</span>
                  </div>
                </div>

                {/* Variants Section */}
                {p.variants && p.variants.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[11px] text-[#f2f0eb] mb-2 flex items-center justify-between font-bold uppercase">
                      <span>ATTRIBUTE VARIANTS:</span>
                      <span className="text-[#cc0000]">EFFECTIVE UNIT PRICE</span>
                    </div>
                    <div className="space-y-1.5">
                      {p.variants.map((v) => {
                        const effective = p.salesPrice + v.priceDelta;
                        const isOdoo = v.attributeValue === 'Odoo';

                        return (
                          <div
                            key={v.id}
                            className={`p-2.5 border-l-4 flex items-center justify-between ${
                              isOdoo
                                ? 'bg-[#000000] border-[#cc0000] text-white'
                                : 'bg-[#1a1a1a] border-[#6b6b6b] text-[#f2f0eb]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{v.attributeName}: {v.attributeValue}</span>
                              {isOdoo && (
                                <span className="text-[9px] px-2 py-0.5 bg-[#cc0000] text-white font-['Bebas_Neue'] tracking-widest uppercase">
                                  +560.00 REQUIREMENT
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-[#6b6b6b]">
                                {v.priceDelta >= 0 ? `+${formatCurrency(v.priceDelta)}` : formatCurrency(v.priceDelta)}
                              </span>
                              <span className="text-white font-bold ml-2 font-['Bebas_Neue'] text-sm tracking-wider">
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
      )}

      {/* Plans Tab */}
      {activeSubTab === 'plans' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((pl) => (
            <div
              key={pl.id}
              className="con-card con-wedge p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] font-mono text-xs space-y-4 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-['Bebas_Neue'] tracking-wider text-white">{pl.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#000000] text-[#cc0000] border border-[#cc0000] font-bold">
                    {pl.billingPeriod}
                  </span>
                </div>
                <div className="text-3xl font-['Bebas_Neue'] tracking-wider text-[#cc0000] font-bold mt-2">
                  {formatCurrency(pl.price)} <span className="text-xs text-[#f2f0eb] font-normal font-mono">/ {pl.billingPeriod.toLowerCase()}</span>
                </div>
                <div className="text-[11px] text-[#6b6b6b] mt-1 uppercase">MIN QUANTITY: {pl.minQuantity} UNITS</div>
              </div>

              {/* 4 Governance Flags */}
              <div className="pt-3 border-t border-[#1a1a1a] space-y-2">
                <div className="text-[10px] uppercase font-['Bebas_Neue'] tracking-widest text-[#f2f0eb]">
                  LIFECYCLE GOVERNANCE SWITCHES:
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between p-1.5 bg-[#1a1a1a]">
                    <span className="text-[#f2f0eb]">Auto-Close on Expiry:</span>
                    {pl.autoCloseOnExpiry ? (
                      <span className="text-[#cc0000] font-bold font-['Bebas_Neue']">YES</span>
                    ) : (
                      <span className="text-[#6b6b6b] font-['Bebas_Neue']">NO</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-[#1a1a1a]">
                    <span className="text-[#f2f0eb]">Allow Early Close:</span>
                    {pl.allowEarlyClose ? (
                      <span className="text-[#cc0000] font-bold font-['Bebas_Neue']">YES</span>
                    ) : (
                      <span className="text-[#6b6b6b] font-['Bebas_Neue']">NO</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-[#1a1a1a]">
                    <span className="text-[#f2f0eb]">Allow Pause / Resume:</span>
                    {pl.allowPause ? (
                      <span className="text-[#cc0000] font-bold font-['Bebas_Neue']">YES</span>
                    ) : (
                      <span className="text-[#6b6b6b] font-['Bebas_Neue']">NO</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-[#1a1a1a]">
                    <span className="text-[#f2f0eb]">Allow Renewal:</span>
                    {pl.allowRenewal ? (
                      <span className="text-[#cc0000] font-bold font-['Bebas_Neue']">YES</span>
                    ) : (
                      <span className="text-[#6b6b6b] font-['Bebas_Neue']">NO</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discounts Tab */}
      {activeSubTab === 'discounts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {discounts.map((d) => (
            <div
              key={d.id}
              className="con-card con-wedge p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] font-mono text-xs space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between border-b border-[#1a1a1a] pb-3">
                <div>
                  <span className="text-xl font-['Bebas_Neue'] tracking-wider text-white">{d.name}</span>
                  <div className="text-[11px] text-[#cc0000] font-bold mt-0.5 uppercase">CODE: {d.code}</div>
                </div>
                <span className="text-2xl font-bold font-['Bebas_Neue'] tracking-wider text-white">
                  {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `-${formatCurrency(d.value)}`}
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#f2f0eb]">
                <div>SCOPE: <strong className="text-white">{d.scope}</strong></div>
                <div>MIN SEATS: <strong className="text-white">{d.minQuantity}</strong> | MIN SPEND: <strong className="text-white">{formatCurrency(d.minPurchaseAmount)}</strong></div>
                <div>VALIDITY: <span className="text-[#6b6b6b]">{d.startDate} to {d.endDate}</span></div>
              </div>

              <div className="pt-2 border-t border-[#1a1a1a]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#6b6b6b] uppercase">USAGE CAP:</span>
                  <span className="text-white font-bold">{d.currentUsageCount} / {d.maxUsageLimit}</span>
                </div>
                <div className="h-2 w-full bg-[#000000] border border-[#1a1a1a]">
                  <div
                    style={{ width: `${(d.currentUsageCount / d.maxUsageLimit) * 100}%` }}
                    className="h-full bg-[#cc0000]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Taxes Tab */}
      {activeSubTab === 'taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {taxes.map((t) => (
            <div
              key={t.id}
              className="con-card con-wedge p-6 bg-[#2d2d2d] border-l-6 border-[#cc0000] font-mono text-xs space-y-3 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-2">
                <span className="text-xl font-['Bebas_Neue'] tracking-wider text-white">{t.name}</span>
                <span className="text-2xl font-bold font-['Bebas_Neue'] text-[#cc0000]">{t.ratePercent}%</span>
              </div>
              <div className="space-y-1 text-xs text-[#f2f0eb]">
                <div>TERRITORY: <strong className="text-white">{t.region}</strong></div>
                <div>APPLIES TO: <strong className="text-white">{t.appliesToProductType}</strong></div>
                <div>STATE: <span className="text-[#cc0000] font-bold uppercase">{t.isActive ? 'ACTIVE' : 'INACTIVE'}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
