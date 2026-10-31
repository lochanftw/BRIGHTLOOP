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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end font-['Roboto_Condensed']">
      <div className="w-full max-w-md bg-[#000000] border-l-4 border-[#cc0000] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#1a1a1a] flex items-center justify-between bg-[#000000]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#cc0000] text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-['Bebas_Neue'] tracking-wider text-white uppercase flex items-center gap-2">
                SIMULATED DISPATCH OUTBOX
                <span className="text-xs px-2 py-0.5 bg-[#cc0000] text-white font-mono">
                  {emails.length}
                </span>
              </h2>
              <p className="text-xs text-[#6b6b6b] font-mono">Internal SMTP Simulation for Evaluation</p>
            </div>
          </div>
          <button
            onClick={() => setOpenOutbox(false)}
            className="p-1.5 hover:bg-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Email list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {emails.length === 0 ? (
            <div className="text-center py-16 text-[#6b6b6b]">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-['Bebas_Neue'] text-lg text-white">NO DISPATCHED NOTICES</p>
              <p className="text-xs font-mono mt-1">Dispatches appear when invoices are sent or passwords reset</p>
            </div>
          ) : (
            emails.map((email) => {
              const isPasswordReset = email.category === 'PASSWORD_RESET';
              const tokenMatch = email.actionUrl?.match(/token=([^&]+)/);
              const resetToken = tokenMatch ? tokenMatch[1] : undefined;

              return (
                <div
                  key={email.id}
                  className={`p-4 border-l-4 transition-all ${
                    email.isRead
                      ? 'bg-[#1a1a1a] border-[#2d2d2d] opacity-80'
                      : 'bg-[#1a1a1a] border-[#cc0000]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 font-mono">
                    <span className="text-xs text-[#cc0000] font-bold truncate max-w-[200px]">
                      TO: {email.toEmail}
                    </span>
                    <span className="text-[10px] text-[#6b6b6b] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(email.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 uppercase">{email.subject}</h3>

                  <div
                    className="text-xs text-[#f2f0eb] bg-[#000000] p-3 border border-[#2d2d2d] mb-3 font-mono leading-relaxed max-h-36 overflow-y-auto"
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
                        className="con-btn !py-1.5 !px-3 text-xs"
                      >
                        <span>
                          <ExternalLink className="w-3 h-3 mr-1" />
                          EXECUTE PASSWORD RESET
                        </span>
                      </button>
                    ) : email.actionUrl ? (
                      <span className="text-xs text-[#6b6b6b] font-mono">{email.actionUrl}</span>
                    ) : (
                      <span className="text-[11px] text-[#6b6b6b] font-mono">DISPATCH CONFIRMED</span>
                    )}

                    {!email.isRead && (
                      <button
                        onClick={() => markEmailRead(email.id)}
                        className="text-xs text-[#6b6b6b] hover:text-white flex items-center gap-1 font-mono uppercase"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        MARK READ
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-2 border-[#1a1a1a] bg-[#000000] text-xs text-[#6b6b6b] flex items-center justify-between font-mono uppercase">
          <span>SMTP ENGINE: IN-MEMORY SIMULATION</span>
          <span className="text-[#cc0000] font-bold">100% DELIVERABILITY</span>
        </div>
      </div>
    </div>
  );
}
