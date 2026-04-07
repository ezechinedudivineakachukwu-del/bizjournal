'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/types';
import PlanBadge from './PlanBadge';

interface Props { user: User; onAIOpen?: () => void; onLogout: () => void; }

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
];

export default function Navbar({ user, onAIOpen, onLogout }: Props) {
  const path = usePathname();

  return (
    <nav className="border-b border-brand/20 px-6 py-3 flex items-center justify-between sticky top-0 bg-gradient-to-r from-ink/95 to-ink-2/95 backdrop-blur-xl z-30 shadow-lg shadow-brand/10">
      <div className="flex items-center gap-7">
        <Link href="/dashboard" className="text-white font-bold text-base tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center text-[11px] font-black text-white">BJ</span>
          <span className="bg-gradient-to-r from-brand to-gold bg-clip-text text-transparent">BizJournal</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className={`text-sm px-3 py-1.5 rounded-lg transition-all ${path === n.href ? 'text-white bg-gradient-to-r from-brand/30 to-accent/30 border border-brand/30' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <PlanBadge plan={user.plan} />
        {onAIOpen && (
          <button onClick={onAIOpen}
            className="hidden sm:flex items-center gap-1.5 text-xs text-white/50 hover:text-brand border border-brand/20 hover:border-brand/50 px-3 py-1.5 rounded-lg transition-all hover:bg-brand/5">
            <span>✨</span> Ask AI
          </button>
        )}
        <Link href="/entry/new" className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand to-accent text-white font-semibold text-xs hover:shadow-lg hover:shadow-brand/50 transition-all">+ New</Link>
        <Link href="/settings" className="text-white/30 hover:text-brand transition-colors hidden sm:block">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        </Link>
        <button onClick={onLogout} className="text-xs text-white/25 hover:text-coral transition-colors">Out</button>
      </div>
    </nav>
  );
}
