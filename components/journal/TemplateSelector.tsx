'use client';

const TEMPLATES = [
  { id: 'daily-review',  icon: '📊', label: 'Daily Review',  desc: 'End-of-day recap & wins' },
  { id: 'deal-tracker',  icon: '💰', label: 'Deal Tracker',  desc: 'Pipeline & negotiation log' },
  { id: 'meeting-notes', icon: '🤝', label: 'Meeting Notes', desc: 'Decisions & action items' },
  { id: 'weekly-review', icon: '📅', label: 'Weekly Review', desc: 'Weekly wins & planning' },
  { id: 'decision-log',  icon: '⚖️', label: 'Decision Log',  desc: 'Document key decisions' },
  { id: 'free-write',    icon: '✏️', label: 'Free Write',    desc: 'Open-ended journaling' },
];

export const TEMPLATE_STARTERS: Record<string, string> = {
  'daily-review': `**Today's wins:**\n- \n\n**Key decisions made:**\n- \n\n**Blockers or challenges:**\n- \n\n**Tomorrow's #1 priority:**\n`,
  'deal-tracker': `**Deal name / Company:**\n\n**Deal value:** $\n\n**Current stage:**\n\n**Key contact:**\n\n**Last interaction:**\n\n**Next step:**\n\n**Risks / objections:**\n`,
  'meeting-notes': `**Meeting with:**\n\n**Purpose:**\n\n**Key points discussed:**\n- \n\n**Decisions made:**\n- \n\n**Action items:**\n- \n\n**Follow-up by:**\n`,
  'weekly-review': `**Week of:**\n\n**Top 3 wins this week:**\n1. \n2. \n3. \n\n**Revenue / pipeline update:**\n\n**What didn't go as planned:**\n\n**Lessons learned:**\n\n**Top 3 priorities for next week:**\n1. \n2. \n3. \n`,
  'decision-log': `**Decision:**\n\n**Context / why this matters:**\n\n**Options considered:**\n1. \n2. \n3. \n\n**Decision made:**\n\n**Reasoning:**\n\n**Risks accepted:**\n\n**Review date:**\n`,
  'free-write': ``,
};

interface Props { value: string; onChange: (id: string) => void; }

export default function TemplateSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {TEMPLATES.map(t => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)}
          className={`text-left p-3 rounded-xl border transition-all ${
            value === t.id
              ? 'border-brand/50 bg-brand/10 text-white'
              : 'border-white/[0.07] bg-surface hover:border-white/20 text-white/60'
          }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{t.icon}</span>
            <span className="font-medium text-xs">{t.label}</span>
          </div>
          <p className="font-mono text-[9px] text-white/30 leading-snug">{t.desc}</p>
        </button>
      ))}
    </div>
  );
}
