'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Invoice } from '@/types';
import { formatCurrency } from '@/lib/finance/engine';
import {
  FileText,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  Lock,
  Calendar,
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';

export function InvoicesView() {
  const { showToast, refreshOutbox, setQueryLatencyMs, currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePrintInvoice, setActivePrintInvoice] = useState<Invoice | null>(null);

  // Record payment modal
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'BANK_TRANSFER' | 'CREDIT_CARD' | 'WIRE' | 'UPI_ACH' | 'CHECK' | 'CASH'>('BANK_TRANSFER');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`/api/invoices?status=${statusFilter}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.items) {
        setInvoices(data.items);
        setQueryLatencyMs(data.queryLatencyMs);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, searchQuery]);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      if (action === 'SEND') {
        await refreshOutbox();
        showToast('INVOICE DISPATCHED TO SIMULATED EMAIL OUTBOX!', 'success');
      } else {
        showToast(`INVOICE STATUS UPDATED: ${action}`, 'success');
      }
      await fetchInvoices();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoice) return;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payInvoice.id,
          method: payMethod,
          amount: payAmount,
          reference: payRef || `PAY-MANUAL-${Date.now()}`,
          notes: payNotes,
          recordedBy: currentUser.fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      showToast(`PAYMENT OF ${formatCurrency(payAmount)} POSTED!`, 'success');
      setPayInvoice(null);
      await fetchInvoices();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Payment recording failed', 'error');
    }
  };

  return (
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Header */}
      <div className="bg-[#000000] p-6 border-b-4 border-[#cc0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
            INVOICE MANAGEMENT // <span className="text-[#cc0000]">AR WORKBENCH</span>
          </h1>
          <p className="text-xs text-[#f2f0eb] mt-1 font-mono">
            Review Invoices &bull; Confirm Drafts &bull; Settle Balances &bull; Official Printable Tax Documents
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto bg-[#000000] border border-[#2d2d2d] p-1 text-xs">
          {['ALL', 'CONFIRMED', 'PAID', 'DRAFT', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 font-['Bebas_Neue'] text-sm tracking-wider uppercase transition-all shrink-0 ${
                statusFilter === s
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
          placeholder="FILTER INV-2026, CUSTOMER, OR SUB..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-[#000000] border-2 border-[#2d2d2d] text-xs font-mono uppercase text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000] w-full sm:w-80"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-[#2d2d2d] border-l-6 border-[#cc0000] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-[#000000] text-[#f2f0eb] uppercase font-['Bebas_Neue'] tracking-wider text-sm border-b-2 border-[#cc0000]">
              <tr>
                <th className="py-3 px-4">INVOICE #</th>
                <th className="py-3 px-4">CUSTOMER</th>
                <th className="py-3 px-4">DUE DATE</th>
                <th className="py-3 px-4">STATE</th>
                <th className="py-3 px-4">TOTAL</th>
                <th className="py-3 px-4">BALANCE DUE</th>
                <th className="py-3 px-4 text-right">DIRECTIVES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6b6b6b] uppercase">
                    No matching invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isOverdue = inv.status === 'CONFIRMED' && inv.dueDate < today;

                  return (
                    <tr key={inv.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#cc0000]" />
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-sans text-white">
                        <div className="font-bold">{inv.customerName}</div>
                        <div className="text-[10px] text-[#6b6b6b] font-mono">{inv.subscriptionNumber}</div>
                      </td>
                      <td className={`py-3 px-4 font-mono ${isOverdue ? 'text-[#cc0000] font-bold' : 'text-[#f2f0eb]'}`}>
                        {inv.dueDate} {isOverdue && '(OVERDUE)'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-['Bebas_Neue'] tracking-widest uppercase font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-white text-black'
                              : inv.status === 'CONFIRMED'
                              ? isOverdue
                                ? 'bg-[#cc0000] text-white'
                                : 'bg-[#c45522] text-white'
                              : 'bg-[#6b6b6b] text-black'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white text-sm">{formatCurrency(inv.grandTotal)}</td>
                      <td className={`py-3 px-4 font-bold ${inv.amountDue > 0 ? 'text-[#cc0000]' : 'text-[#6b6b6b]'}`}>
                        {formatCurrency(inv.amountDue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.status === 'DRAFT' && (
                            <button
                              onClick={() => handleAction(inv.id, 'CONFIRM')}
                              className="con-btn-black !py-1 !px-2.5 text-xs font-['Bebas_Neue']"
                            >
                              CONFIRM
                            </button>
                          )}

                          {inv.status === 'CONFIRMED' && (
                            <>
                              <button
                                onClick={() => {
                                  setPayInvoice(inv);
                                  setPayAmount(inv.amountDue);
                                }}
                                className="con-btn !py-1 !px-2.5 text-xs font-['Bebas_Neue']"
                              >
                                <span>
                                  <DollarSign className="w-3 h-3 mr-0.5" />
                                  PAY
                                </span>
                              </button>
                              <button
                                onClick={() => handleAction(inv.id, 'SEND')}
                                className="con-btn-black !py-1 !px-2 text-xs font-['Bebas_Neue']"
                                title="Send notice to simulated outbox"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setActivePrintInvoice(inv)}
                            className="con-btn-black !py-1 !px-2 text-xs font-['Bebas_Neue']"
                            title="Print / View Tax Document"
                          >
                            <Printer className="w-3 h-3 text-[#cc0000]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {payInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#000000] border-4 border-[#cc0000] p-6 relative">
            <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase mb-1">
              POST PAYMENT &bull; {payInvoice.invoiceNumber}
            </h2>
            <p className="text-xs text-[#f2f0eb] mb-4 font-mono">
              BALANCE DUE: <strong className="text-[#cc0000]">{formatCurrency(payInvoice.amountDue)}</strong>
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">PAYMENT MODALITY</label>
                <select
                  value={payMethod}
                  onChange={(e: any) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                >
                  <option value="BANK_TRANSFER">BANK WIRE / ACH TRANSFER</option>
                  <option value="CREDIT_CARD">CORPORATE CREDIT CARD</option>
                  <option value="WIRE">SWIFT WIRE TRANSFER</option>
                  <option value="UPI_ACH">UPI / INSTANT SETTLEMENT</option>
                  <option value="CHECK">CERTIFIED BANK CHECK</option>
                  <option value="CASH">CASH DEPOSIT</option>
                </select>
              </div>

              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">AMOUNT ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={payInvoice.amountDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                />
              </div>

              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">WIRE REFERENCE</label>
                <input
                  type="text"
                  placeholder="e.g. WIRE-FED-992019"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayInvoice(null)}
                  className="con-btn-black !py-2 !px-4 text-xs"
                >
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  className="con-btn !py-2 !px-5 text-xs font-bold"
                >
                  <span>POST PAYMENT</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Constructivist Printable Tax Invoice Modal */}
      {activePrintInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#f2f0eb] text-black border-4 border-[#000000] p-8 my-8 relative print:p-0 print:m-0 print:border-none print:w-full">
            {/* Action Bar (hidden on print) */}
            <div className="flex items-center justify-between pb-6 border-b-2 border-[#000000] mb-6 print:hidden">
              <span className="font-['Bebas_Neue'] text-lg tracking-widest text-[#cc0000] uppercase font-bold">
                CONSTRUCTIVIST TAX PROCLAMATION &bull; PRINT PREVIEW
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="con-btn !py-2 !px-5 text-sm"
                >
                  <span>
                    <Printer className="w-4 h-4 mr-1.5" />
                    PRINT TAX INVOICE
                  </span>
                </button>
                <button
                  onClick={() => setActivePrintInvoice(null)}
                  className="p-2 hover:bg-[#e8e0d0] text-black"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Letterhead */}
            <div className="flex items-start justify-between pb-6 border-b-4 border-[#000000]">
              <div>
                <h2 className="text-3xl font-black font-['Bebas_Neue'] tracking-wider text-black">
                  BRIGHTLOOP SOFTWARE CORP
                </h2>
                <p className="text-xs text-[#6b6b6b] mt-1 uppercase font-mono">
                  100 Financial Way, Suite 400 &bull; San Francisco, CA 94105
                </p>
                <p className="text-xs text-black font-mono font-bold">EIN: US-94-3882910 &bull; GSTIN: 27AABCB1234F1Z5</p>
              </div>

              <div className="text-right font-mono">
                <div className="text-2xl font-black font-['Bebas_Neue'] text-[#cc0000]">OFFICIAL TAX INVOICE</div>
                <div className="text-base font-bold text-black mt-1">{activePrintInvoice.invoiceNumber}</div>
                <div className="text-xs text-[#6b6b6b]">ISSUE: {activePrintInvoice.issueDate}</div>
                <div className="text-xs text-black font-bold">DUE: {activePrintInvoice.dueDate}</div>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-8 my-6 text-xs font-mono">
              <div>
                <span className="text-[#6b6b6b] uppercase block mb-1">BILLED TO:</span>
                <div className="font-bold text-sm text-black">{activePrintInvoice.customerName}</div>
                <div className="text-[#6b6b6b]">{activePrintInvoice.customerEmail}</div>
                <div className="text-black font-bold mt-1 uppercase">ENTERPRISE RECURRING ACCOUNT</div>
              </div>

              <div>
                <span className="text-[#6b6b6b] uppercase block mb-1">CONTRACT REF:</span>
                <div>SUB REF: <strong className="text-black">{activePrintInvoice.subscriptionNumber}</strong></div>
                <div>PERIOD: {activePrintInvoice.periodStart} to {activePrintInvoice.periodEnd}</div>
                <div>STATE: <span className="font-bold uppercase text-[#cc0000]">{activePrintInvoice.status}</span></div>
              </div>
            </div>

            {/* Line Items */}
            <table className="w-full text-xs text-left mb-6 font-mono border-y-2 border-[#000000]">
              <thead className="bg-[#000000] text-white uppercase font-['Bebas_Neue'] tracking-wider text-sm">
                <tr>
                  <th className="py-2.5 px-3">DESCRIPTION &amp; VARIANT</th>
                  <th className="py-2.5 px-3 text-center">QTY</th>
                  <th className="py-2.5 px-3 text-right">UNIT PRICE</th>
                  <th className="py-2.5 px-3 text-right">TAX RATE</th>
                  <th className="py-2.5 px-3 text-right">LINE TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e0d0]">
                {activePrintInvoice.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-black">{l.description}</div>
                      {l.variantName && (
                        <div className="text-[11px] text-[#cc0000] font-bold mt-0.5">{l.variantName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center text-black font-bold">{l.quantity}</td>
                    <td className="py-3 px-3 text-right text-black">{formatCurrency(l.unitPrice)}</td>
                    <td className="py-3 px-3 text-right text-[#6b6b6b]">{l.taxName}</td>
                    <td className="py-3 px-3 text-right font-bold text-black">{formatCurrency(l.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="flex justify-end mb-6 font-mono text-xs">
              <div className="w-72 space-y-1.5 border-t-2 border-[#000000] pt-2">
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>SUBTOTAL:</span>
                  <span>{formatCurrency(activePrintInvoice.subtotal)}</span>
                </div>
                {activePrintInvoice.discountTotal > 0 && (
                  <div className="flex justify-between text-[#cc0000] font-bold">
                    <span>DISCOUNT APPLIED:</span>
                    <span>-{formatCurrency(activePrintInvoice.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>TAX (8.5% SAAS):</span>
                  <span>{formatCurrency(activePrintInvoice.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-2 border-t-2 border-[#000000]">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(activePrintInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-[#6b6b6b]">
                  <span>AMOUNT PAID:</span>
                  <span>{formatCurrency(activePrintInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-black pt-1 border-t border-[#6b6b6b]">
                  <span>BALANCE DUE:</span>
                  <span className="text-[#cc0000] font-bold">{formatCurrency(activePrintInvoice.amountDue)}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Seal */}
            <div className="p-4 bg-[#000000] text-white font-mono text-[11px] space-y-1 border-l-4 border-[#cc0000]">
              <div className="flex items-center gap-1.5 font-bold font-['Bebas_Neue'] text-sm tracking-wider text-[#cc0000]">
                <ShieldCheck className="w-4 h-4 text-[#cc0000]" />
                ZERO-LEAKAGE CRYPTOGRAPHIC LEDGER SEAL
              </div>
              <div className="truncate text-white">
                SHA-256 HASH: <code>{activePrintInvoice.ledgerHash || 'CHAIN_GEN_001'}</code>
              </div>
              <div className="truncate text-[#6b6b6b]">
                PREV HASH: {activePrintInvoice.previousLedgerHash || 'GENESIS_CHAIN'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
