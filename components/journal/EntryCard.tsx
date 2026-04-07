'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Entry } from '@/types';

const TEMPLATES: Record<string, { label: string; color: string }> = {
  'daily-review':   { label: 'Daily Review',   color: 'text-brand bg-brand/10 border-brand/20' },
  'deal-tracker':   { label: 'Deal Tracker',   color: 'text-gold bg-gold/10 border-gold/20' },
  'meeting-notes':  { label: 'Meeting Notes',  color: 'text-accent bg-accent/10 border-accent/20' },
  'weekly-review':  { label: 'Weekly Review',  color: 'text-brand bg-brand/10 border-brand/20' },
  'decision-log':   { label: 'Decision Log',   color: 'text-coral bg-coral/10 border-coral/20' },
  'free-write':     { label: 'Free Write',     color: 'text-white/40 bg-white/5 border-white/10' },
};
const MOODS: Record<string, string> = { excellent: '🚀', good: '😊', neutral: '😐', challenging: '😤', difficult: '💀' };

interface Props { entry: Entry; onDelete: (id: string) => void; }

export default function EntryCard({ entry, onDelete }: Props) {
  const tmpl = TEMPLATES[entry.template] || TEMPLATES['free-write'];
  const words = entry.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="card flex flex-col gap-2.5 group">
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${tmpl.color}`}>{tmpl.label}</span>
        <div className="flex items-center gap-2">
          {entry.mood && <span className="text-sm">{MOODS[entry.mood]}</span>}
          <span className="font-mono text-[9px] text-white/20">{words}w</span>
        </div>
      </div>

      <Link href={`/entry/${entry._id}`}>
        <h3 className="font-semibold text-sm text-white/90 leading-snug line-clamp-2 hover:text-white transition-colors cursor-pointer">
          {entry.title}
        </h3>
      </Link>

      {entry.dealValue && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-brand">${entry.dealValue.toLocaleString()}</span>
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
            entry.dealStatus === 'closed-won' ? 'bg-brand/10 text-brand' :
            entry.dealStatus === 'closed-lost' ? 'bg-red-500/10 text-red-400' :
            'bg-brand/10 text-brand'  // Changed to gold for prospecting/negotiating
          }`}>{entry.dealStatus}</span>
        </div>
      )}

      <p className="font-mono text-[10px] text-white/30 line-clamp-2 leading-relaxed">{entry.content}</p>

      {entry.actionItems?.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] text-white/20">Actions:</span>
          <span className="font-mono text-[9px] text-brand/60 line-clamp-1">{entry.actionItems.slice(0, 2).join(' · ')}</span>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.slice(0, 3).map(t => <span key={t} className="tag">#{t}</span>)}
          {entry.tags.length > 3 && <span className="font-mono text-[9px] text-white/20">+{entry.tags.length - 3}</span>}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] mt-auto">
        <span className="font-mono text-[9px] text-white/20">
          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/entry/${entry._id}/edit`} className="font-mono text-[9px] text-white/40 hover:text-brand transition-colors">Edit</Link>
          <button onClick={() => onDelete(entry._id)} className="font-mono text-[9px] text-white/20 hover:text-red-400 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}
