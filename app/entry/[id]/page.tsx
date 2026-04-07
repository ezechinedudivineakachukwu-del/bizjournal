'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import AIChat from '@/components/ai/AIChat';
import type { Entry } from '@/types';

const MOODS: Record<string, string> = { excellent: '🚀', good: '😊', neutral: '😐', challenging: '😤', difficult: '💀' };
const TEMPLATES: Record<string, string> = {
  'daily-review': 'Daily Review', 'deal-tracker': 'Deal Tracker', 'meeting-notes': 'Meeting Notes',
  'weekly-review': 'Weekly Review', 'decision-log': 'Decision Log', 'free-write': 'Free Write',
};

export default function EntryViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    api.get<{ entry: Entry }>(`/entries/${id}`)
      .then(d => setEntry(d.entry))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSummarize = async () => {
    setSummarizing(true); setSummary('');
    try {
      const d: any = await api.post(`/ai/summarize/${id}`, {});
      setSummary(d.summary);
    } catch (err: any) {
      toast.error(err.message || 'Summarization failed.');
    } finally { setSummarizing(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this entry permanently?')) return;
    try {
      await api.del(`/entries/${id}`);
      toast.success('Entry deleted.');
      router.push('/dashboard');
    } catch { toast.error('Delete failed.'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <span className="font-mono text-brand text-xs animate-pulse">[ loading... ]</span>
    </div>
  );
  if (!entry || !user) return null;

  const words = entry.content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] px-5 py-3 flex items-center justify-between sticky top-0 bg-ink/95 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-white/30 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <span className="font-mono text-[10px] text-white/25">{TEMPLATES[entry.template] || entry.template}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSummarize} disabled={summarizing} className="btn-ghost text-xs py-1.5 hidden sm:block">
            {summarizing ? 'Summarizing...' : '✨ AI Summary'}
          </button>
          <button onClick={() => setChatOpen(true)} className="btn-ghost text-xs py-1.5 hidden sm:block">
            💬 Ask AI
          </button>
          <Link href={`/entry/${id}/edit`} className="btn-secondary text-xs py-1.5 px-4">Edit</Link>
          <button onClick={handleDelete} className="btn-danger text-xs py-1.5 px-3">Delete</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-5 py-10">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          {entry.mood && <span className="text-2xl">{MOODS[entry.mood]}</span>}
          <div>
            <p className="font-mono text-[10px] text-white/30">
              {format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy')}
            </p>
            <p className="font-mono text-[9px] text-white/20">{words} words · {readTime} min read</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white leading-tight mb-4">{entry.title}</h1>

        {/* Deal info */}
        {(entry as any).dealValue && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
            <span className="font-mono text-sm text-green-400 font-bold">${(entry as any).dealValue.toLocaleString()}</span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
              (entry as any).dealStatus === 'closed-won' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
              (entry as any).dealStatus === 'closed-lost' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
              'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
            }`}>{(entry as any).dealStatus}</span>
          </div>
        )}

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {entry.tags.map(t => <span key={t} className="tag">#{t}</span>)}
          </div>
        )}

        {/* AI Summary */}
        {summary && (
          <div className="mb-6 p-4 bg-brand/5 border border-brand/20 rounded-xl">
            <p className="section-label mb-2">AI Summary</p>
            <p className="font-mono text-xs text-white/65 whitespace-pre-wrap leading-relaxed">{summary}</p>
          </div>
        )}

        {/* Content */}
        <div className="border-t border-white/[0.06] pt-7 mb-8">
          <p className="prose-journal">{entry.content}</p>
        </div>

        {/* Action items */}
        {entry.actionItems?.length > 0 && (
          <div className="border border-white/[0.07] rounded-xl p-4">
            <p className="section-label mb-3">Action Items</p>
            <ul className="space-y-2">
              {entry.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 font-mono text-xs text-white/60">
                  <span className="text-brand mt-0.5 text-[10px]">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mobile actions */}
        <div className="flex gap-2 mt-8 sm:hidden">
          <button onClick={handleSummarize} disabled={summarizing} className="btn-secondary text-xs flex-1">
            {summarizing ? 'Summarizing...' : '✨ AI Summary'}
          </button>
          <button onClick={() => setChatOpen(true)} className="btn-secondary text-xs flex-1">
            💬 Ask AI
          </button>
        </div>
      </div>

      <AIChat open={chatOpen} onClose={() => setChatOpen(false)} user={user} />
    </div>
  );
}
