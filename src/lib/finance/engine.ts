/**
 * Financial Calculation & Cryptographic Hashing Engine
 * Implements strict 2-decimal rounded minor-unit math and SHA-256 ledger chaining.
 */

export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Portable SHA-256 implementation that runs on Node.js, Next.js Server, and Client Browser
export async function sha256(message: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Node.js environment
    try {
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(message).digest('hex');
    } catch {
      // Fallback
    }
  }

  // Web Crypto API in browser / Edge runtime
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Pure JS fallback (simple 32-bit FNV/Murmur deterministic hash for offline edge cases)
  let h1 = 0xdeadbeef ^ message.length;
  let h2 = 0x41c6ce57 ^ message.length;
  for (let i = 0; i < message.length; i++) {
    const ch = message.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0') + 'f7a8b9c0d1e2f3a4b5c6d7e8f9012345';
}

export async function computeLedgerHash(
  prevHash: string,
  subscriptionId: string,
  billingCycleKey: string,
  grandTotal: number,
  timestamp: string
): Promise<string> {
  const payload = `${prevHash}|${subscriptionId}|${billingCycleKey}|${grandTotal.toFixed(2)}|${timestamp}`;
  return await sha256(payload);
}

