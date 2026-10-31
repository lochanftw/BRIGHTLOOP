'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { X, Lock, Mail, User as UserIcon, Building, ShieldCheck, ArrowRight } from 'lucide-react';

export function AuthModal() {
  const {
    openAuthModal,
    setOpenAuthModal,
    authModalMode,
    setAuthModalMode,
    resetTokenForModal,
    switchPersona,
    showToast,
    refreshOutbox,
    setOpenOutbox,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resetToken, setResetToken] = useState(resetTokenForModal || '');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (resetTokenForModal) {
      setResetToken(resetTokenForModal);
    }
  }, [resetTokenForModal]);

  if (!openAuthModal) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign in');

      switchPersona(data.user.role, data.user);
      showToast(`AUTHENTICATED: WELCOME ${data.user.fullName.toUpperCase()}!`, 'success');
      setOpenAuthModal(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage('Please satisfy all 4 security criteria.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-up failed');

      switchPersona('CUSTOMER', data.user);
      showToast(`ACCOUNT REGISTERED FOR ${data.user.fullName.toUpperCase()}!`, 'success');
      setOpenAuthModal(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset request failed');

      await refreshOutbox();
      showToast('RESET TOKEN DISPATCHED TO OUTBOX!', 'info');
      setResetToken(data.token);
      setAuthModalMode('RESET');
      setOpenOutbox(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage('New password must satisfy all 4 security criteria.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');

      showToast('PASSWORD SUCCESSFULLY UPDATED! PROCEED TO SIGN IN.', 'success');
      setAuthModalMode('SIGNIN');
      setPassword('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-['Roboto_Condensed']">
      <div className="w-full max-w-md bg-[#000000] border-4 border-[#cc0000] shadow-2xl p-6 relative">
        <button
          onClick={() => setOpenAuthModal(false)}
          className="absolute top-4 right-4 p-1 hover:bg-[#1a1a1a] text-[#6b6b6b] hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-[#cc0000] text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs uppercase font-['Bebas_Neue'] tracking-widest text-[#cc0000]">
              BRIGHTLOOP SECURITY &bull; IDENTITY FORTRESS
            </span>
          </div>

          <h2 className="text-3xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
            {authModalMode === 'SIGNIN' && 'SIGN IN TO COMMAND'}
            {authModalMode === 'SIGNUP' && 'REGISTER CUSTOMER CADRE'}
            {authModalMode === 'FORGOT' && 'RESET PASSWORD TOKEN'}
            {authModalMode === 'RESET' && 'FORGE NEW COMPLIANT PASSWORD'}
          </h2>
          <p className="text-xs text-[#f2f0eb] mt-1 font-mono">
            {authModalMode === 'SIGNIN' && 'Enter credentials or use the Persona Switcher in the top bar.'}
            {authModalMode === 'SIGNUP' && 'Enforces strict email uniqueness and high-entropy password requirements.'}
            {authModalMode === 'FORGOT' && 'Dispatches single-use token to the Real-Time Email Outbox Drawer.'}
            {authModalMode === 'RESET' && 'Token verified. Specify high-entropy password.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-[#cc0000] text-white font-mono text-xs uppercase font-bold">
            {errorMessage}
          </div>
        )}

        {/* Forms */}
        {authModalMode === 'SIGNIN' && (
          <form onSubmit={handleSignIn} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6b6b6b] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#f2f0eb] uppercase">PASSWORD</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthModalMode('FORGOT');
                  }}
                  className="text-xs text-[#cc0000] font-['Bebas_Neue'] tracking-wider hover:underline"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6b6b6b] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="con-btn w-full !py-3 text-sm font-bold disabled:opacity-50"
            >
              <span>
                {loading ? 'AUTHENTICATING...' : 'ENTER BRIGHTLOOP OS'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </span>
            </button>

            <div className="pt-2 text-center text-xs text-[#6b6b6b]">
              Need a customer account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setAuthModalMode('SIGNUP');
                }}
                className="text-[#cc0000] font-bold font-['Bebas_Neue'] tracking-wider hover:underline text-sm ml-1"
              >
                SIGN UP
              </button>
            </div>
          </form>
        )}

        {authModalMode === 'SIGNUP' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 font-mono text-xs">
            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">FULL NAME</label>
              <input
                type="text"
                required
                placeholder="Elena Rostova"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
              />
            </div>

            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">ORGANIZATION</label>
              <input
                type="text"
                placeholder="Acme Innovations Ltd"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
              />
            </div>

            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                placeholder="elena@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
              />
            </div>

            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">PASSWORD POLICY VALIDATOR</label>
              <input
                type="password"
                required
                placeholder="BrightloopPass@2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
              />
              <PasswordStrengthMeter password={password} onValidChange={setIsPasswordValid} />
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="con-btn w-full !py-3 text-sm font-bold disabled:opacity-50 mt-2"
            >
              <span>
                {loading ? 'REGISTERING...' : 'REGISTER CUSTOMER CADRE'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </span>
            </button>

            <div className="pt-2 text-center text-xs text-[#6b6b6b]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setAuthModalMode('SIGNIN');
                }}
                className="text-[#cc0000] font-bold font-['Bebas_Neue'] tracking-wider hover:underline text-sm ml-1"
              >
                SIGN IN
              </button>
            </div>
          </form>
        )}

        {authModalMode === 'FORGOT' && (
          <form onSubmit={handleForgotPassword} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">REGISTERED EMAIL</label>
              <input
                type="email"
                required
                placeholder="billing@acmecorp.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="con-btn w-full !py-3 text-sm font-bold disabled:opacity-50"
            >
              <span>
                {loading ? 'DISPATCHING TOKEN...' : 'DISPATCH RESET TOKEN'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </span>
            </button>

            <div className="pt-2 text-center text-xs text-[#6b6b6b]">
              Remembered credentials?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setAuthModalMode('SIGNIN');
                }}
                className="text-[#cc0000] font-bold font-['Bebas_Neue'] tracking-wider hover:underline text-sm ml-1"
              >
                BACK TO SIGN IN
              </button>
            </div>
          </form>
        )}

        {authModalMode === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 font-mono text-xs">
            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">RESET TOKEN</label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="rst_xxxx"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-xs font-mono text-[#cc0000] font-bold focus:outline-none focus:border-[#cc0000]"
              />
            </div>

            <div>
              <label className="block text-[#f2f0eb] uppercase mb-1">NEW COMPLIANT PASSWORD</label>
              <input
                type="password"
                required
                placeholder="NewSecurePass@2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:border-[#cc0000]"
              />
              <PasswordStrengthMeter password={password} onValidChange={setIsPasswordValid} />
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !resetToken}
              className="con-btn w-full !py-3 text-sm font-bold disabled:opacity-50 mt-2"
            >
              <span>
                {loading ? 'COMMITTING...' : 'FORGE NEW PASSWORD'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
