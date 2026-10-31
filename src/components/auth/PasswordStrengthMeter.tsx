'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  onValidChange?: (isValid: boolean) => void;
}

export function PasswordStrengthMeter({ password, onValidChange }: PasswordStrengthMeterProps) {
  const hasMinLength = password.length >= 9; // Strictly > 8 chars
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasSpecial;

  React.useEffect(() => {
    if (onValidChange) {
      onValidChange(isValid);
    }
  }, [isValid, onValidChange]);

  const rules = [
    { label: '> 8 Characters (min 9)', passed: hasMinLength },
    { label: 'Uppercase Letter (A-Z)', passed: hasUppercase },
    { label: 'Lowercase Letter (a-z)', passed: hasLowercase },
    { label: 'Special Character (!@#$...)', passed: hasSpecial },
  ];

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Password Security Requirements</span>
        <span className={isValid ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
          {rules.filter((r) => r.passed).length}/4 Compliant
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-colors ${
              rule.passed
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {rule.passed ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
