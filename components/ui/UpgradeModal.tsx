'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { PLANS } from '@/lib/plans';

interface Props { reason: string; currentPlan: string; onClose: () => void; }

export default function UpgradeModal({ reason, currentPlan, onClose }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro' | 'enterprise') => {
    setLoading(plan);
    try {
      const data: any = await api.post('/stripe/checkout', { plan });
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message);
      setLoading(null);
    }
  };

  const plans = [
    { key: 'pro' as const, ...PLANS.pro },
    { key: 'enterprise' as const, ...PLANS.enterprise },
  ].filter(p => p.key !== currentPlan);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-surface-2 border border-white/10 rounded-2xl p-7 max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
            <span className="text-brand text-lg">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">You've hit your plan limit</h3>
          <p className="text-sm text-white/50">{reason}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {plans.map(plan => (
            <div key={plan.key} className={`rounded-xl p-4 border cursor-pointer transition-all ${plan.key === 'pro' ? 'border-brand/30 bg-brand/5' : 'border-purple-500/30 bg-purple-500/5'}`}>
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs font-mono font-semibold ${plan.key === 'pro' ? 'text-brand' : 'text-purple-400'}`}>{plan.name}</span>
                <span className="text-white font-bold text-sm">{plan.priceLabel}</span>
              </div>
              <ul className="space-y-1 mb-4">
                {plan.features.slice(0, 4).map(f => (
                  <li key={f} className="text-xs text-white/50 flex items-start gap-1.5">
                    <span className={`mt-0.5 text-[9px] ${plan.key === 'pro' ? 'text-brand' : 'text-purple-400'}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={!!loading}
                className={`w-full text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-50 ${plan.key === 'pro' ? 'bg-brand text-white hover:bg-brand-dark' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
              >
                {loading === plan.key ? 'Redirecting...' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full text-xs text-white/30 hover:text-white/60 transition-colors py-1">
          Maybe later
        </button>
      </div>
    </div>
  );
}
