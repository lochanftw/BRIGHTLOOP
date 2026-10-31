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
      setErrorMsg('FORBIDDEN: ONLY ADMINISTRATORS CAN PROVISION STAFF ACCOUNTS.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMsg('PASSWORD MUST SATISFY ALL 4 SECURITY CRITERIA.');
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

      showToast(`STAFF CADRE ACCOUNT PROVISIONED FOR ${data.user.fullName}!`, 'success');
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
      <div className="p-12 bg-[#000000] border-4 border-[#cc0000] text-center font-mono space-y-4">
        <Lock className="w-16 h-16 mx-auto text-[#cc0000]" />
        <h2 className="text-3xl font-['Bebas_Neue'] tracking-wider text-white uppercase">
          ACCESS RESTRICTED &bull; COMMAND RANK ONLY
        </h2>
        <p className="text-xs text-[#f2f0eb] max-w-md mx-auto leading-relaxed">
          Your active persona ({currentUser.fullName} &bull; {currentUser.role}) does not hold administrative authority to provision internal staff operators.
        </p>
        <p className="text-xs text-[#cc0000] font-bold uppercase tracking-wider">
          Switch to Elena Vance (ADMIN) via the top-right persona switcher to test staff provisioning.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Roboto_Condensed']">
      {/* Header */}
      <div className="bg-[#000000] p-6 border-b-4 border-[#cc0000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl sm:text-4xl font-['Bebas_Neue'] tracking-wider text-white uppercase transform -rotate-1 origin-left">
              STAFF CADRE ADMINISTRATION // <span className="text-[#cc0000]">RBAC SOVEREIGNTY</span>
            </h1>
            <span className="px-2 py-0.5 bg-[#cc0000] text-white text-[11px] font-['Bebas_Neue'] tracking-widest uppercase">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-[#f2f0eb] font-mono">
            Scene 1: Internal Operators &bull; Permission Boundaries &bull; Password Policy Enforcement
          </p>
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          className="con-btn !py-2.5 !px-5 text-sm"
        >
          <span>
            <UserPlus className="w-4 h-4 mr-1.5" />
            PROVISION STAFF OPERATOR
          </span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-[#2d2d2d] border-l-6 border-[#cc0000] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-[#000000] text-[#f2f0eb] uppercase font-['Bebas_Neue'] tracking-wider text-sm border-b-2 border-[#cc0000]">
              <tr>
                <th className="py-3 px-4">STAFF OPERATOR</th>
                <th className="py-3 px-4">CORPORATE EMAIL</th>
                <th className="py-3 px-4">ASSIGNED ROLE</th>
                <th className="py-3 px-4">DEPARTMENT</th>
                <th className="py-3 px-4">STATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {staffList.map((u) => (
                <tr key={u.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-3 px-4 font-bold text-white font-sans text-sm">{u.fullName}</td>
                  <td className="py-3 px-4 text-[#cc0000] font-bold">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-['Bebas_Neue'] tracking-wider uppercase font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-[#cc0000] text-white'
                          : 'bg-white text-black'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#f2f0eb] uppercase">{u.department || 'Operations'}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#f2f0eb] font-['Bebas_Neue'] text-sm tracking-wider flex items-center gap-1">
                      <span className="w-2 h-2 bg-[#cc0000] animate-pulse" />
                      ACTIVE
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#000000] border-4 border-[#cc0000] p-6 relative font-mono text-xs">
            <h2 className="text-2xl font-['Bebas_Neue'] tracking-wider text-white uppercase mb-1">
              PROVISION INTERNAL OPERATOR
            </h2>
            <p className="text-xs text-[#f2f0eb] mb-4">
              Staff accounts can execute billing runs, manage quotes, and reconcile wires.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-[#cc0000] text-white font-bold text-xs uppercase">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">FULL NAME</label>
                <input
                  type="text"
                  required
                  placeholder="Jordan Vance"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                />
              </div>

              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">CORPORATE EMAIL</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.vance@brightloop.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                />
              </div>

              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">DEPARTMENT</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                >
                  <option value="Operations">Revenue Operations</option>
                  <option value="Finance">Treasury & Accounting</option>
                  <option value="Customer Success">Client Engagements</option>
                </select>
              </div>

              <div>
                <label className="block text-[#f2f0eb] uppercase mb-1">PASSWORD POLICY VALIDATOR</label>
                <input
                  type="password"
                  required
                  placeholder="StaffSecurePass@2026"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2d2d2d] text-white focus:outline-none focus:border-[#cc0000]"
                />
                <PasswordStrengthMeter password={password} onValidChange={setIsPasswordValid} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="con-btn-black !py-2 !px-4 text-xs font-['Bebas_Neue']"
                >
                  <span>CANCEL</span>
                </button>
                <button
                  type="submit"
                  disabled={loading || !isPasswordValid}
                  className="con-btn !py-2 !px-5 text-xs font-bold disabled:opacity-50"
                >
                  <span>PROVISION OPERATOR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
