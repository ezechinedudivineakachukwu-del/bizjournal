'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import { PLANS } from '@/lib/plans';
import Navbar from '@/components/ui/Navbar';
import EntryCard from '@/components/journal/EntryCard';
import AIChat from '@/components/ai/AIChat';
import UpgradeModal from '@/components/ui/UpgradeModal';
import type { Entry } from '@/types';

const TEMPLATE_FILTERS = [
  { id: '', label: 'All' },
  { id: 'daily-review', label: 'Daily' },
  { id: 'deal-tracker', label: 'Deals' },
  { id: 'meeting-notes', label: 'Meetings' },
  { id: 'weekly-review', label: 'Weekly' },
  { id: 'decision-log', label: 'Decisions' },
];

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [template, setTemplate] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [upgradeInfo, setUpgradeInfo] = useState<{ reason: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get<{ tags: string[] }>('/entries/tags').then(d => setTags(d.tags)).catch(() => {});
  }, [user]);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (template) params.set('template', template);
      if (tag) params.set('tag', tag);
      const data: any = await api.get(`/entries?${params}`);
      setEntries(data.entries);
      setTotal(data.pagination.total);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [user, search, template, tag]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await api.del(`/entries/${id}`);
      setEntries(p => p.filter(e => e._id !== id));
      setTotal(p => p - 1);
      toast.success('Entry deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  if (authLoading || !user) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <span className="font-mono text-brand text-xs animate-pulse">[ loading... ]</span>
    </div>
  );

  const plan = PLANS[user.plan];
  const usagePct = plan.limits.entries === Infinity ? 0 : Math.round((user.usage.entriesThisMonth / plan.limits.entries) * 100);
  const aiPct = plan.limits.aiMessages === Infinity ? 0 : Math.round((user.usage.aiMessagesThisMonth / plan.limits.aiMessages) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink-2 to-ink flex flex-col">
      <Navbar user={user} onAIOpen={() => setChatOpen(true)} onLogout={logout} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}


        {/* Main */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* Greeting */}
          <div className="mb-5 flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white via-brand to-gold bg-clip-text text-transparent">
                Good {getGreeting()}, {user.name.split(' ')[0]}
              </h1>
              <p className="text-xs text-white/35 mt-0.5 font-mono">
                {total} {total === 1 ? 'entry' : 'entries'} in your journal
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost text-sm">Filters</button>
              <Link href="/entry/new" className="btn-primary text-sm">+ New Entry</Link>
            </div>
          </div>

          {/* Filters */}
          {sidebarOpen && (
            <div className="mb-5 p-4 bg-surface rounded-xl border border-white/[0.07]">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <input
                  className="input text-xs py-2 flex-1 max-w-xs"
                  placeholder="Search entries..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <div className="flex gap-1.5 flex-wrap">
                  {TEMPLATE_FILTERS.map(f => (
                    <button key={f.id} onClick={() => setTemplate(f.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all ${template === f.id ? 'bg-gradient-to-r from-brand to-accent text-white shadow-lg shadow-brand/30' : 'bg-surface-2 text-white/60 hover:text-white border border-white/10 hover:border-brand/30'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              {tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => setTag('')} className={`text-xs px-2 py-1 rounded transition-all ${!tag ? 'bg-gradient-to-r from-brand to-accent text-white shadow-lg shadow-brand/30' : 'bg-surface-2 text-white/60 hover:text-white border border-white/10'}`}>
                    All
                  </button>
                  {tags.map(t => (
                    <button key={t} onClick={() => setTag(tag === t ? '' : t)}
                      className={`text-xs px-2 py-1 rounded transition-all ${tag === t ? 'bg-gradient-to-r from-brand to-accent text-white shadow-lg shadow-brand/30' : 'bg-surface-2 text-white/60 hover:text-white border border-white/10'}`}>
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Entries */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : entries.length === 0 ? (
            <EmptyState search={search} template={template} tag={tag} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {entries.map(e => (
                <EntryCard key={e._id} entry={e} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {upgradeInfo && (
        <UpgradeModal reason={upgradeInfo.reason} currentPlan={user.plan} onClose={() => setUpgradeInfo(null)} />
      )}

      <AIChat open={chatOpen} onClose={() => setChatOpen(false)} user={user} />
    </div>
  );
}

function UsageBar({ label, used, limit, pct }: { label: string; used: number; limit: number | typeof Infinity; pct: number }) {
  const isUnlimited = limit === Infinity;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[9px] text-white/35">{label}</span>
        <span className="font-mono text-[9px] text-white/35">{isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}</span>
      </div>
      {!isUnlimited && (
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : 'bg-brand'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ search, template, tag }: { search: string; template: string; tag: string }) {
  if (search || template || tag) return (
    <div className="text-center py-20">
      <p className="font-mono text-white/20 text-sm mb-2">No entries match your filters</p>
      <p className="font-mono text-white/15 text-xs">Try adjusting your search or filters</p>
    </div>
  );
  return (
    <div className="text-center py-24">
      <div className="text-5xl mb-4">📓</div>
      <h3 className="text-lg font-semibold text-white/80 mb-2">Your journal is empty</h3>
      <p className="font-mono text-xs text-white/30 mb-7">Write your first entry and start building business clarity.</p>
      <Link href="/entry/new" className="btn-primary">Write First Entry</Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 w-20 rounded bg-white/5" />
        <div className="h-4 w-4 rounded-full bg-white/5" />
      </div>
      <div className="h-4 w-3/4 rounded bg-white/5 mb-2" />
      <div className="space-y-1.5 mb-3">
        <div className="h-3 rounded bg-white/5" />
        <div className="h-3 w-5/6 rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-4 w-12 rounded bg-white/5" />
        <div className="h-4 w-16 rounded bg-white/5" />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
