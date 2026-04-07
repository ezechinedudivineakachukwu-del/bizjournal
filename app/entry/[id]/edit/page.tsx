'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import type { Entry } from '@/types';

const MOODS = [
  { value: 'excellent', emoji: '🚀' }, { value: 'good', emoji: '😊' },
  { value: 'neutral', emoji: '😐' }, { value: 'challenging', emoji: '😤' }, { value: 'difficult', emoji: '💀' },
];

export default function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', tags: '', mood: '', dealValue: '', dealStatus: '', actionItems: '',
  });
  const [template, setTemplate] = useState('free-write');

  useEffect(() => {
    api.get<{ entry: Entry }>(`/entries/${id}`)
      .then(({ entry }) => {
        setTemplate(entry.template);
        setForm({
          title: entry.title,
          content: entry.content,
          tags: entry.tags.join(', '),
          mood: entry.mood || '',
          dealValue: (entry as any).dealValue?.toString() || '',
          dealStatus: (entry as any).dealStatus || '',
          actionItems: entry.actionItems?.join('\n') || '',
        });
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required.'); return; }
    setSaving(true);
    try {
      await api.put(`/entries/${id}`, {
        title: form.title.trim(),
        content: form.content.trim(),
        tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        mood: form.mood || null,
        dealValue: form.dealValue ? parseFloat(form.dealValue) : undefined,
        dealStatus: form.dealStatus || undefined,
        actionItems: form.actionItems.split('\n').map(a => a.trim()).filter(Boolean),
      });
      toast.success('Entry updated.');
      router.push(`/entry/${id}`);
    } catch (err: any) {
      toast.error(err.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <span className="font-mono text-brand text-xs animate-pulse">[ loading... ]</span>
    </div>
  );

  const words = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <div className="border-b border-white/[0.06] px-5 py-3 flex items-center justify-between sticky top-0 bg-ink/95 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <Link href={`/entry/${id}`} className="text-white/30 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <span className="font-mono text-[10px] text-white/25">Editing entry</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/20">{words} words</span>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-5">
            {saving ? 'Saving...' : 'Update Entry'}
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 flex flex-col gap-5">
        <textarea
          className="w-full bg-transparent border-none outline-none resize-none text-2xl font-bold text-white placeholder:text-white/15 leading-tight"
          placeholder="Entry title..." rows={2}
          value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />

        <div className="flex flex-wrap gap-5 items-center border-y border-white/[0.06] py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-white/30 tracking-widest">MOOD</span>
            <div className="flex gap-0.5">
              {MOODS.map(m => (
                <button key={m.value} type="button"
                  onClick={() => setForm(f => ({ ...f, mood: f.mood === m.value ? '' : m.value }))}
                  className={`text-lg px-1 rounded transition-all ${form.mood === m.value ? 'bg-brand/20 scale-110' : 'opacity-25 hover:opacity-60'}`}>
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <span className="font-mono text-[9px] text-white/30 tracking-widest">TAGS</span>
            <input className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-brand placeholder:text-white/15"
              placeholder="sales, strategy (comma separated)"
              value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
        </div>

        {template === 'deal-tracker' && (
          <div className="flex flex-wrap gap-3 p-4 bg-surface-2 rounded-xl border border-white/[0.07]">
            <div className="flex flex-col gap-1 min-w-32">
              <label className="font-mono text-[9px] text-white/30 tracking-widest">DEAL VALUE ($)</label>
              <input className="input py-1.5 text-xs" type="number" placeholder="50000"
                value={form.dealValue} onChange={e => setForm(f => ({ ...f, dealValue: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1 min-w-40">
              <label className="font-mono text-[9px] text-white/30 tracking-widest">DEAL STATUS</label>
              <select className="input py-1.5 text-xs" value={form.dealStatus}
                onChange={e => setForm(f => ({ ...f, dealStatus: e.target.value }))}>
                <option value="">Select status</option>
                <option value="prospecting">Prospecting</option>
                <option value="negotiating">Negotiating</option>
                <option value="closed-won">Closed Won ✓</option>
                <option value="closed-lost">Closed Lost ✗</option>
              </select>
            </div>
          </div>
        )}

        <textarea
          className="flex-1 w-full bg-transparent border-none outline-none resize-none font-mono text-sm text-white/75 placeholder:text-white/15 leading-[1.85] min-h-[380px]"
          placeholder="Start writing..." value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        />

        <div className="border-t border-white/[0.06] pt-4">
          <label className="font-mono text-[9px] text-white/30 tracking-widest block mb-2">ACTION ITEMS (one per line)</label>
          <textarea
            className="w-full bg-surface border border-white/[0.07] rounded-lg p-3 font-mono text-xs text-white/60 placeholder:text-white/20 outline-none resize-none focus:border-brand/30"
            placeholder="Follow up with client&#10;Send proposal" rows={3}
            value={form.actionItems} onChange={e => setForm(f => ({ ...f, actionItems: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
}
