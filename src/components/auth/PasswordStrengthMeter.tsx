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
    { label: '> 8 CHARACTERS (MIN 9)', passed: hasMinLength },
    { label: 'UPPERCASE LETTER (A-Z)', passed: hasUppercase },
    { label: 'LOWERCASE LETTER (a-z)', passed: hasLowercase },
    { label: 'SPECIAL CHARACTER (!@#$...)', passed: hasSpecial },
  ];

  return (
    <div className="mt-3 space-y-2 font-mono">
      <div className="flex items-center justify-between text-xs text-[#6b6b6b] uppercase">
        <span>SECURITY CRITERIA VERIFIER</span>
        <span className={isValid ? 'text-white bg-[#cc0000] px-2 py-0.5 font-bold' : 'text-[#c45522]'}>
          {rules.filter((r) => r.passed).length}/4 COMPLIANT
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-colors ${
              rule.passed
                ? 'bg-[#cc0000] border-[#cc0000] text-white font-bold'
                : 'bg-[#1a1a1a] border-[#2d2d2d] text-[#6b6b6b]'
            }`}
          >
            {rule.passed ? (
              <Check className="w-3.5 h-3.5 text-white shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-[#6b6b6b] shrink-0" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
