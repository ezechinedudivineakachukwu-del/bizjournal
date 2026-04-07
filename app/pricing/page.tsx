'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLANS } from '@/lib/plans';
import { api } from '@/lib/api-client';

const PLAN_ORDER = ['free', 'pro', 'enterprise'] as const;

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    const token = localStorage.getItem('bj_token');
    if (!token) { window.location.href = '/register'; return; }
    setLoading(plan);
    try {
      const data: any = await api.post('/stripe/checkout', { plan });
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      <nav className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-[11px] font-black text-white">BJ</div>
          <span className="font-bold text-base">BizJournal</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm">Log in</Link>
          <Link href="/register" className="btn-primary text-sm py-2">Get started</Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="section-label mb-3">pricing</p>
          <h1 className="text-4xl font-bold mb-3">Simple, honest pricing</h1>
          <p className="text-white/40 text-sm">Start free. Upgrade when your business demands more.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
          {PLAN_ORDER.map(key => {
            const plan = PLANS[key];
            const isPro = key === 'pro';
            const isEnterprise = key === 'enterprise';

            return (
              <div key={key} className={`rounded-2xl border p-6 flex flex-col gap-5 ${
                isPro ? 'border-brand/40 bg-brand/5 ring-1 ring-brand/20' : 'border-white/[0.08] bg-surface'
              }`}>
                {isPro && (
                  <div className="text-center -mt-9 mb-1">
                    <span className="bg-brand text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                  </div>
                )}

                <div>
                  <p className={`font-mono text-xs tracking-widest mb-1 ${isPro ? 'text-brand' : isEnterprise ? 'text-purple-400' : 'text-white/40'}`}>
                    {plan.name.toUpperCase()}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.priceLabel.split('/')[0]}</span>
                    {plan.price > 0 && <span className="text-white/30 text-sm">/month</span>}
                  </div>
                  {plan.price === 0 && <p className="font-mono text-[10px] text-white/30 mt-1">Free forever</p>}
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-white/60">
                      <span className={`mt-0.5 text-[10px] font-bold shrink-0 ${isPro ? 'text-brand' : isEnterprise ? 'text-purple-400' : 'text-white/30'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {key === 'free' ? (
                  <Link href="/register" className="btn-secondary text-sm text-center py-2.5">Get started free</Link>
                ) : (
                  <button
                    onClick={() => handleUpgrade(key as 'pro' | 'enterprise')}
                    disabled={!!loading}
                    className={`text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 ${
                      isPro ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {loading === key ? 'Redirecting...' : `Get ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center font-mono text-xs text-white/20 mt-10">
          All plans billed monthly. Cancel anytime. Stripe-secured payments.
        </p>
      </section>
    </div>
  );
}
