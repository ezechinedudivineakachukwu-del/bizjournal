'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '', role: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (form.password.length < 8) { setError('Password must be 8+ characters.'); setLoading(false); return; }
    try {
      const data: any = await api.post('/auth/register', form);
      login(data.token, data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-sm font-black text-white">BJ</div>
            <span className="font-bold text-lg">BizJournal</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-white/40 mt-1">Start journaling for free</p>
        </div>

        <div className="card-elevated rounded-2xl p-7">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg font-mono text-xs text-red-400">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] text-white/40 tracking-widest block mb-1.5">FULL NAME</label>
              <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="font-mono text-[10px] text-white/40 tracking-widest block mb-1.5">EMAIL</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-white/40 tracking-widest block mb-1.5">COMPANY</label>
                <input className="input" placeholder="Acme Inc." value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-white/40 tracking-widest block mb-1.5">YOUR ROLE</label>
                <input className="input" placeholder="CEO, VP Sales…" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] text-white/40 tracking-widest block mb-1.5">PASSWORD</label>
              <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full py-3 mt-1" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>
          <p className="text-center font-mono text-xs text-white/30 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-brand hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
