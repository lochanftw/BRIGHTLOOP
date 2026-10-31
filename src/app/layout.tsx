import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Brightloop OS — Autonomous Subscription & Recurring Revenue Engine',
  description: 'Enterprise Subscription Management, Recurring Billing, and Autonomous Revenue Operating System for Brightloop Software',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
