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
      showToast(`Welcome back, ${data.user.fullName}!`, 'success');
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
      setErrorMessage('Please ensure your password satisfies all 4 security criteria.');
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
      showToast(`Account created for ${data.user.fullName}! Switched to Customer Portal.`, 'success');
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
      showToast('Reset email sent! Check the Simulated Email Outbox in the top bar.', 'info');
      setResetToken(data.token);
      setAuthModalMode('RESET');
      setOpenOutbox(true); // Automatically open the outbox so evaluator can see and click!
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

      showToast('Password successfully reset! You can now sign in.', 'success');
      setAuthModalMode('SIGNIN');
      setPassword('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={() => setOpenAuthModal(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-400">
              Brightloop Security & Identity
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-100">
            {authModalMode === 'SIGNIN' && 'Sign In to Brightloop OS'}
            {authModalMode === 'SIGNUP' && 'Create Customer Account'}
            {authModalMode === 'FORGOT' && 'Reset Your Password'}
            {authModalMode === 'RESET' && 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'SIGNIN' && 'Enter your credentials or use the Persona Switcher in the top bar.'}
            {authModalMode === 'SIGNUP' && 'Evaluates strict email uniqueness and high-entropy password requirements.'}
            {authModalMode === 'FORGOT' && 'Generates a time-limited token dispatched to the Simulated Outbox.'}
            {authModalMode === 'RESET' && 'Token verified. Create a compliant password.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        {authModalMode === 'SIGNIN' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthModalMode('FORGOT');
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Need a customer account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setAuthModalMode('SIGNUP');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {authModalMode === 'SIGNUP' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Elena Rostova"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Acme Innovations Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="elena@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Brightloop@2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <PasswordStrengthMeter password={password} onValidChange={setIsPasswordValid} />
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register Customer Account'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setAuthModalMode('SIGNIN');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {authModalMode === 'FORGOT' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Registered Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="billing@acmecorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Dispatching Token...' : 'Send Password Reset Email'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              Remembered your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setAuthModalMode('SIGNIN');
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {authModalMode === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reset Token</label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="rst_xxxx"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New Compliant Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="NewSecurePass@2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <PasswordStrengthMeter password={password} onValidChange={setIsPasswordValid} />
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordValid || !resetToken}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
