'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import TemplateSelector, { TEMPLATE_STARTERS } from '@/components/journal/TemplateSelector';
import UpgradeModal from '@/components/ui/UpgradeModal';

const MOODS = [
  { value: 'excellent', emoji: '🚀', label: 'Excellent' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'challenging', emoji: '😤', label: 'Challenging' },
  { value: 'difficult', emoji: '💀', label: 'Difficult' },
];

export default function NewEntryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', content: '', template: 'free-write', tags: '',
    mood: '', dealValue: '', dealStatus: '', actionItems: '',
  });
  const [saving, setSaving] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<{ reason: string } | null>(null);

  const handleTemplateSelect = (id: string) => {
    setForm(f => ({ ...f, template: id, content: TEMPLATE_STARTERS[id] || '' }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        template: form.template,
        tags: form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        mood: form.mood || null,
        dealValue: form.dealValue ? parseFloat(form.dealValue) : undefined,
        dealStatus: form.dealStatus || undefined,
        actionItems: form.actionItems.split('\n').map(a => a.trim()).filter(Boolean),
      };
      await api.post('/entries', payload);
      toast.success('Entry saved.');
      router.push('/dashboard');
    } catch (err: any) {
      if (err.upgradeRequired) setUpgradeInfo({ reason: err.message });
      else toast.error(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const words = form.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] px-5 py-3 flex items-center justify-between sticky top-0 bg-ink/95 backdrop-blur z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/30 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-white/25">{form.content.split(/\s+/).filter(Boolean).length} words</span>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-xs py-2 px-5">
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Choose a template</h2>
          <TemplateSelector value={form.template} onChange={handleTemplateSelect} />
        </div>

        <div className="flex flex-col gap-5">
          {/* Title */}
          <textarea
              className="w-full bg-transparent border-none outline-none resize-none text-2xl font-bold text-white placeholder:text-white/15 leading-tight"
              placeholder="Entry title..."
              rows={2}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />

            {/* Meta row */}
            <div className="flex flex-wrap gap-5 items-center border-y border-white/[0.06] py-4">
              {/* Mood */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-white/30 tracking-widest">MOOD</span>
                <div className="flex gap-0.5">
                  {MOODS.map(m => (
                    <button key={m.value} type="button" title={m.label}
                      onClick={() => setForm(f => ({ ...f, mood: f.mood === m.value ? '' : m.value }))}
                      className={`text-lg px-1 rounded transition-all ${form.mood === m.value ? 'bg-brand/20 scale-110' : 'opacity-25 hover:opacity-60'}`}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tags */}
              <div className="flex items-center gap-2 flex-1 min-w-40">
                <span className="font-mono text-[9px] text-white/30 tracking-widest">TAGS</span>
                <input
                  className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-brand placeholder:text-white/15"
                  placeholder="sales, strategy, q2 (comma separated)"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>
            </div>

            {/* Deal fields (only for deal-tracker) */}
            {form.template === 'deal-tracker' && (
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

            {/* Content */}
            <textarea
              className="flex-1 w-full bg-transparent border-none outline-none resize-none font-mono text-sm text-white/75 placeholder:text-white/15 leading-[1.85] min-h-[380px]"
              placeholder="Start writing..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />

            {/* Action items */}
            <div className="border-t border-white/[0.06] pt-4">
              <label className="font-mono text-[9px] text-white/30 tracking-widest block mb-2">ACTION ITEMS (one per line)</label>
              <textarea
                className="w-full bg-surface border border-white/[0.07] rounded-lg p-3 font-mono text-xs text-white/60 placeholder:text-white/20 outline-none resize-none focus:border-brand/30"
                placeholder="Follow up with client by Friday&#10;Send proposal draft&#10;Schedule team review"
                rows={3}
                value={form.actionItems}
                onChange={e => setForm(f => ({ ...f, actionItems: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {upgradeInfo && user && (
        <UpgradeModal reason={upgradeInfo.reason} currentPlan={user.plan} onClose={() => setUpgradeInfo(null)} />
      )}
    </div>
  );
}
