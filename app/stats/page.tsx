'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import Navbar from '@/components/ui/Navbar';
import AIChat from '@/components/ai/AIChat';
import type { Entry } from '@/types';

export default function StatsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);
  useEffect(() => {
    if (!user) return;
    api.get<any>('/entries?limit=200').then(d => setEntries(d.entries)).finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return <div className="min-h-screen bg-ink flex items-center justify-center"><span className="font-mono text-brand text-xs animate-pulse">[ loading... ]</span></div>;

  const totalWords = entries.reduce((s, e) => s + e.content.trim().split(/\s+/).filter(Boolean).length, 0);
  const avgWords = entries.length ? Math.round(totalWords / entries.length) : 0;

  // Streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = subDays(new Date(), i);
    if (entries.some(e => isSameDay(parseISO(e.createdAt), d))) streak++;
    else if (i > 0) break;
  }

  // Heatmap — 49 days
  const heatmap = [...Array(49)].map((_, i) => {
    const date = subDays(new Date(), 48 - i);
    const count = entries.filter(e => isSameDay(parseISO(e.createdAt), date)).length;
    return { date, count };
  });

  // Template breakdown
  const tmplCounts: Record<string, number> = {};
  entries.forEach(e => { tmplCounts[e.template] = (tmplCounts[e.template] || 0) + 1; });
  const tmplNames: Record<string, string> = {
    'daily-review': 'Daily Review', 'deal-tracker': 'Deal Tracker', 'meeting-notes': 'Meeting Notes',
    'weekly-review': 'Weekly Review', 'decision-log': 'Decision Log', 'free-write': 'Free Write',
  };

  // Mood
  const moodCounts: Record<string, number> = {};
  entries.forEach(e => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });

  // Deal pipeline
  const deals = entries.filter(e => e.template === 'deal-tracker' && (e as any).dealValue);
  const totalDealValue = deals.reduce((s, e) => s + ((e as any).dealValue || 0), 0);
  const wonDeals = deals.filter(e => (e as any).dealStatus === 'closed-won');
  const wonValue = wonDeals.reduce((s, e) => s + ((e as any).dealValue || 0), 0);

  // Word chart (last 10)
  const recentWords = entries.slice(0, 10).reverse().map(e => ({
    words: e.content.trim().split(/\s+/).filter(Boolean).length,
  }));
  const maxW = Math.max(...recentWords.map(r => r.words), 1);

  const MOOD_COLORS: Record<string, string> = { excellent: '#22c55e', good: '#86efac', neutral: '#94a3b8', challenging: '#f97316', difficult: '#ef4444' };
  const MOOD_EMOJI: Record<string, string> = { excellent: '🚀', good: '😊', neutral: '😐', challenging: '😤', difficult: '💀' };

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <Navbar user={user} onAIOpen={() => setChatOpen(true)} onLogout={logout} />
      <main className="max-w-5xl mx-auto w-full px-5 py-8">
        <div className="mb-7">
          <p className="section-label mb-1">analytics</p>
          <h1 className="text-3xl font-bold text-white">Business Insights</h1>
        </div>

        {loading ? (
          <p className="font-mono text-white/30 text-xs animate-pulse">Crunching your numbers...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-mono text-white/20">No data yet. Start writing to see your stats.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total entries" value={entries.length} />
              <StatCard label="Total words" value={totalWords.toLocaleString()} />
              <StatCard label="Avg words" value={avgWords} />
              <StatCard label="Day streak" value={streak} highlight={streak >= 3} />
            </div>

            {/* Deal pipeline */}
            {deals.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Deals tracked" value={deals.length} />
                <StatCard label="Total pipeline" value={`$${(totalDealValue / 1000).toFixed(0)}k`} />
                <StatCard label="Won value" value={`$${(wonValue / 1000).toFixed(0)}k`} highlight />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Heatmap */}
              <Section title="Writing activity — last 7 weeks">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                  {['M','T','W','T','F','S','S'].map((d, i) => (
                    <div key={i} style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono', textAlign: 'center', marginBottom: '3px' }}>{d}</div>
                  ))}
                  {heatmap.map((day, i) => {
                    const op = day.count === 0 ? 0 : day.count === 1 ? 0.35 : day.count === 2 ? 0.65 : 1;
                    return (
                      <div key={i} title={`${format(day.date, 'MMM d')} — ${day.count} entries`}
                        style={{ height: '16px', borderRadius: '3px', background: op === 0 ? 'rgba(255,255,255,0.04)' : `rgba(0,102,255,${op})` }} />
                    );
                  })}
                </div>
              </Section>

              {/* Template breakdown */}
              <Section title="Entry types">
                <div className="flex flex-col gap-2.5">
                  {Object.entries(tmplCounts).sort((a,b) => b[1]-a[1]).map(([k, v]) => {
                    const pct = Math.round((v / entries.length) * 100);
                    return (
                      <div key={k}>
                        <div className="flex justify-between mb-1">
                          <span className="font-mono text-[10px] text-white/50">{tmplNames[k] || k}</span>
                          <span className="font-mono text-[10px] text-white/30">{v} ({pct}%)</span>
                        </div>
                        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>

              {/* Word chart */}
              <Section title="Words per entry — last 10">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '72px' }}>
                  {recentWords.map((r, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono' }}>{r.words}</span>
                      <div style={{ width: '100%', height: `${Math.max(4, (r.words / maxW) * 52)}px`, background: 'rgba(0,102,255,0.55)', borderRadius: '3px 3px 0 0' }} />
                    </div>
                  ))}
                </div>
              </Section>

              {/* Mood */}
              {Object.keys(moodCounts).length > 0 && (
                <Section title="Mood breakdown">
                  <div className="flex flex-col gap-2.5">
                    {Object.entries(moodCounts).sort((a,b) => b[1]-a[1]).map(([mood, count]) => {
                      const pct = Math.round((count / entries.length) * 100);
                      return (
                        <div key={mood}>
                          <div className="flex justify-between mb-1">
                            <span className="font-mono text-[10px] text-white/50">{MOOD_EMOJI[mood]} {mood}</span>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: MOOD_COLORS[mood] }}>{pct}%</span>
                          </div>
                          <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
                            <div style={{ height: '100%', width: `${pct}%`, background: MOOD_COLORS[mood], borderRadius: '2px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>
          </div>
        )}
      </main>
      <AIChat open={chatOpen} onClose={() => setChatOpen(false)} user={user} />
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center border ${highlight ? 'border-brand/30 bg-brand/5' : 'border-white/[0.06] bg-surface'}`}>
      <div className={`text-3xl font-bold mb-1 ${highlight ? 'text-brand' : 'text-white'}`}>{value}</div>
      <div className="font-mono text-[9px] text-white/30 tracking-wide">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-white/[0.06] rounded-xl p-5">
      <p className="section-label mb-4">{title}</p>
      {children}
    </div>
  );
}
