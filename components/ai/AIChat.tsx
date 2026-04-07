'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api-client';
import type { User, ChatMessage } from '@/types';
import UpgradeModal from '@/components/ui/UpgradeModal';

const SUGGESTIONS = [
  'What deals should I focus on this week?',
  'Summarize my recent business activity',
  'What action items are outstanding?',
  'How has my mood been trending?',
  'Help me prep for a negotiation',
];

interface Props { open: boolean; onClose: () => void; user: User; }

export default function AIChat({ open, onClose, user }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: `Hey ${user.name.split(' ')[0]} 👋 I'm your BizJournal AI. I read your journal and help you make better business decisions. What do you want to work through?`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<{ reason: string; plan: string } | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const updated = [...messages, { role: 'user' as const, content: msg }];
    setMessages(updated);
    setLoading(true);

    try {
      const data: any = await api.post('/ai/chat', {
        message: msg,
        history: messages.slice(-10),
      });
      setMessages([...updated, { role: 'assistant', content: data.reply }]);
      if (data.remaining !== null) setRemaining(data.remaining);
    } catch (err: any) {
      if (err.upgradeRequired) {
        setUpgradeInfo({ reason: err.message, plan: user.plan });
        setMessages(updated.slice(0, -1));
      } else {
        setMessages([...updated, { role: 'assistant', content: '⚠️ Something went wrong. Try again.' }]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:justify-end sm:pr-6 sm:pb-6">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:w-[420px] h-[88vh] sm:h-[640px] bg-surface-2 border border-white/[0.09] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="bg-ink-3 border-b border-white/[0.07] px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm shrink-0">AI</div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">BizJournal AI</h4>
              <p className="text-[10px] text-white/35 font-mono">Reads your journal · Business advisor</p>
            </div>
            {remaining !== null && (
              <span className="font-mono text-[9px] text-white/25">{remaining} left</span>
            )}
            <button onClick={onClose} className="text-white/30 hover:text-white text-xl leading-none transition-colors">×</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap font-mono ${
                  m.role === 'user'
                    ? 'bg-brand text-white rounded-br-md'
                    : 'bg-surface-3 border border-white/[0.06] text-white/75 rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-3 border border-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="font-mono text-[9px] px-2.5 py-1.5 rounded-full border border-brand/20 text-brand/60 hover:bg-brand/10 transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/[0.07] px-4 py-3 flex gap-2 shrink-0">
            <input ref={inputRef} className="input flex-1 text-xs py-2"
              placeholder="Ask anything about your business..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading} />
            <button onClick={() => send()} disabled={!input.trim() || loading} className="btn-primary text-xs px-4 py-2">Send</button>
          </div>
        </div>
      </div>

      {upgradeInfo && (
        <UpgradeModal reason={upgradeInfo.reason} currentPlan={upgradeInfo.plan} onClose={() => setUpgradeInfo(null)} />
      )}
    </>
  );
}
