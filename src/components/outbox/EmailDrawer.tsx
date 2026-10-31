'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

export function EmailDrawer() {
  const {
    openOutbox,
    setOpenOutbox,
    emails,
    markEmailRead,
    setOpenAuthModal,
    setAuthModalMode,
    setResetTokenForModal,
  } = useAuth();

  if (!openOutbox) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Simulated Email Outbox
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {emails.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">In-app SMTP simulation for evaluator testing</p>
            </div>
          </div>
          <button
            onClick={() => setOpenOutbox(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/40">
          {emails.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No dispatched emails yet</p>
              <p className="text-xs text-slate-600 mt-1">Dispatches appear when invoices are sent or passwords reset</p>
            </div>
          ) : (
            emails.map((email) => {
              const isPasswordReset = email.category === 'PASSWORD_RESET';
              const tokenMatch = email.actionUrl?.match(/token=([^&]+)/);
              const resetToken = tokenMatch ? tokenMatch[1] : undefined;

              return (
                <div
                  key={email.id}
                  className={`pt-3 first:pt-0 p-3 rounded-lg border transition-all ${
                    email.isRead
                      ? 'bg-slate-900/30 border-slate-800/60 opacity-80'
                      : 'bg-slate-900/80 border-slate-700/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-mono font-medium text-emerald-400 truncate max-w-[200px]">
                      To: {email.toEmail}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(email.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 mb-2">{email.subject}</h3>

                  <div
                    className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800/80 mb-3 font-mono leading-relaxed max-h-36 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: email.htmlPreview }}
                  />

                  <div className="flex items-center justify-between pt-1">
                    {isPasswordReset && resetToken ? (
                      <button
                        onClick={() => {
                          markEmailRead(email.id);
                          setResetTokenForModal(resetToken);
                          setAuthModalMode('RESET');
                          setOpenAuthModal(true);
                          setOpenOutbox(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Execute Reset Password Flow
                      </button>
                    ) : email.actionUrl ? (
                      <span className="text-xs text-slate-400 font-mono">Action: {email.actionUrl}</span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Notice sent</span>
                    )}

                    {!email.isRead && (
                      <button
                        onClick={() => markEmailRead(email.id)}
                        className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <span>SMTP Engine: In-Memory Simulated</span>
          <span className="text-emerald-400 font-semibold">100% Deliverability</span>
        </div>
      </div>
    </div>
  );
}

