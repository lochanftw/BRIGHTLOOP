'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, SimulatedEmail } from '@/types';

interface AuthContextType {
  currentUser: User;
  switchPersona: (role: Role, customUser?: User) => void;
  emails: SimulatedEmail[];
  unreadEmailsCount: number;
  refreshOutbox: () => Promise<void>;
  markEmailRead: (id: string) => Promise<void>;
  openOutbox: boolean;
  setOpenOutbox: (open: boolean) => void;
  openAuthModal: boolean;
  setOpenAuthModal: (open: boolean) => void;
  authModalMode: 'SIGNIN' | 'SIGNUP' | 'FORGOT' | 'RESET';
  setAuthModalMode: (mode: 'SIGNIN' | 'SIGNUP' | 'FORGOT' | 'RESET') => void;
  resetTokenForModal?: string;
  setResetTokenForModal: (token?: string) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  queryLatencyMs: number;
  setQueryLatencyMs: (ms: number) => void;
}

const defaultAdminUser: User = {
  id: 'user-admin',
  email: 'elena.vance@brightloop.io',
  passwordHash: 'Brightloop@2026',
  fullName: 'Elena Vance',
  companyName: 'Brightloop Software Corp',
  role: 'ADMIN',
  department: 'Executive Leadership',
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const defaultStaffUser: User = {
  id: 'user-staff',
  email: 'marcus.chen@brightloop.io',
  passwordHash: 'Brightloop@2026',
  fullName: 'Marcus Chen',
  companyName: 'Brightloop Software Corp',
  role: 'INTERNAL_STAFF',
  department: 'Revenue Operations',
  isActive: true,
  createdAt: '2026-01-10T00:00:00Z',
};

const defaultCustomerUser: User = {
  id: 'user-cust-acme',
  email: 'billing@acmecorp.com',
  passwordHash: 'Brightloop@2026',
  fullName: 'Sarah Jenkins',
  companyName: 'Acme Corporation',
  role: 'CUSTOMER',
  isActive: true,
  createdAt: '2026-02-01T00:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultAdminUser);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [openOutbox, setOpenOutbox] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'SIGNIN' | 'SIGNUP' | 'FORGOT' | 'RESET'>('SIGNIN');
  const [resetTokenForModal, setResetTokenForModal] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [queryLatencyMs, setQueryLatencyMs] = useState(14.2);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshOutbox = async () => {
    try {
      const res = await fetch('/api/outbox');
      const data = await res.json();
      if (data.items) {
        setEmails(data.items);
      }
    } catch {
      // Fallback
    }
  };

  const markEmailRead = async (id: string) => {
    try {
      await fetch('/api/outbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isRead: true } : e)));
    } catch {
      // Fallback
    }
  };

  const switchPersona = (role: Role, customUser?: User) => {
    if (customUser) {
      setCurrentUser(customUser);
      showToast(`Switched persona to ${customUser.fullName} (${customUser.role})`, 'info');
      return;
    }
    if (role === 'ADMIN') {
      setCurrentUser(defaultAdminUser);
      showToast('Switched to Elena Vance (ADMIN) — Full Control', 'info');
    } else if (role === 'INTERNAL_STAFF') {
      setCurrentUser(defaultStaffUser);
      showToast('Switched to Marcus Chen (INTERNAL_STAFF) — Operations', 'info');
    } else {
      setCurrentUser(defaultCustomerUser);
      showToast('Switched to Acme Corp (CUSTOMER) — Self-Service Portal', 'info');
    }
  };

  useEffect(() => {
    refreshOutbox();
    const interval = setInterval(refreshOutbox, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadEmailsCount = emails.filter((e) => !e.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchPersona,
        emails,
        unreadEmailsCount,
        refreshOutbox,
        markEmailRead,
        openOutbox,
        setOpenOutbox,
        openAuthModal,
        setOpenAuthModal,
        authModalMode,
        setAuthModalMode,
        resetTokenForModal,
        setResetTokenForModal,
        toast,
        showToast,
        queryLatencyMs,
        setQueryLatencyMs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
