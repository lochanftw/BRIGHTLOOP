'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { PasswordStrengthMeter } from '../auth/PasswordStrengthMeter';
import { Users, UserPlus, Lock, ShieldCheck, Mail, Building, ArrowRight } from 'lucide-react';

export function StaffView() {
  const { currentUser, showToast } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  const [staffList, setStaffList] = useState<User[]>([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (data.users) {
        const staff = data.users.filter((u: User) => u.role === 'INTERNAL_STAFF' || u.role === 'ADMIN');
        setStaffList(staff);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setErrorMsg('Forbidden: Only Administrators can create staff accounts.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('Password must satisfy all 4 security criteria.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({ email, password, fullName, department }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff');

      showToast(`Staff account created for ${data.user.fullName}!`, 'success');
      setOpenAddModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      await fetchStaff();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Staff creation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center font-mono">
        <Lock className="w-12 h-12 mx-auto text-amber-400 mb-3" />
        <h2 className="text-lg font-bold text-slate-100">Access Restricted (Admin Only)</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-sans">
          Your current persona ({currentUser.fullName} - {currentUser.role}) does not have administrative rights to create or manage internal staff accounts.
        </p>
        <p className="text-xs text-emerald-400 mt-4">
          Switch to Elena Vance (ADMIN) via the top-right persona switcher to test staff creation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
              Staff RBAC & Identity Administration
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/80 border border-rose-500/40 text-rose-300">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Scene 1: Manage internal operators, billing controllers, and enforce password security policies.
          </p>
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Internal Staff Member
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Corporate Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {staffList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200 font-sans">{u.fullName}</td>
                  <td className="py-3 px-4 text-emerald-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{u.department || 'Operations'}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {openAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-lg font-bold text-slate-100 font-mono mb-1">
              Add Internal Staff Member
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Staff members can run batch billing, manage quotes, and reconcile bank deposits.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jordan Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.vance@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Operations">Revenue Operations</option>
                  <option value="Finance">Treasury & Accounting</option>
                  <option value="Customer Success">Client Engagements</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Secure Staff Password</label>
                <input
                  type="password"
                  required
                  placeholder="BrightloopStaff@2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <PasswordStrengthMeter password={password} onValidChange={setIsPasswordValid} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Provision Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
