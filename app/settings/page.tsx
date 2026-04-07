'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api-client';
import { PLANS } from '@/lib/plans';
import Navbar from '@/components/ui/Navbar';
import PlanBadge from '@/components/ui/PlanBadge';

export default function SettingsPage() {
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: '', company: '', role: '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push('/login'); }, [user, authLoading, router]);
  useEffect(() => {
    if (user) setProfile({ name: user.name, company: user.company || '', role: user.role || '' });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      await api.put('/auth/me', profile);
      await refreshUser();
      toast.success('Profile updated.');
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) { toast.error('Password must be 8+ characters.'); return; }
    if (pw.next !== pw.confirm) { toast.error('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      await api.put('/auth/me', { currentPassword: pw.current, newPassword: pw.next });
      toast.success('Password updated.');
      setPw({ current: '', next: '', confirm: '' });
    } catch (err: any) { toast.error(err.message); } finally { setPwSaving(false); }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const d: any = await api.post('/stripe/portal', {});
      window.location.href = d.url;
    } catch (err: any) { toast.error(err.message); setPortalLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const d: any = await api.get('/entries?limit=1000');
      const blob = new Blob([JSON.stringify(d.entries, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `bizjournal-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success(`Exported ${d.entries.length} entries.`);
    } catch { toast.error('Export failed.'); } finally { setExporting(false); }
  };

  if (authLoading || !user) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <span className="font-mono text-brand text-xs animate-pulse">[ loading... ]</span>
    </div>
  );

  const plan = PLANS[user.plan];

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <Navbar user={user} onLogout={logout} />
      <main className="max-w-xl mx-auto w-full px-5 py-10 flex flex-col gap-5">
        <div>
          <p className="section-label mb-1">account</p>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {/* Plan info */}
        <Card title="Current Plan">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PlanBadge plan={user.plan} />
                <span className="text-sm font-semibold text-white">{plan.name}</span>
                <span className="font-mono text-xs text-white/30">{plan.priceLabel}</span>
              </div>
              <p className="font-mono text-[10px] text-white/30">
                {plan.limits.entries === Infinity ? 'Unlimited' : `${user.usage.entriesThisMonth}/${plan.limits.entries}`} entries ·{' '}
                {plan.limits.aiMessages === Infinity ? 'Unlimited' : `${user.usage.aiMessagesThisMonth}/${plan.limits.aiMessages}`} AI messages this month
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {user.plan !== 'enterprise' && (
              <button onClick={() => router.push('/pricing')} className="btn-primary text-xs py-2">
                {user.plan === 'free' ? '⚡ Upgrade to Pro' : '⚡ Upgrade to Enterprise'}
              </button>
            )}
            {user.plan !== 'free' && (
              <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary text-xs py-2">
                {portalLoading ? 'Opening...' : 'Manage Billing'}
              </button>
            )}
          </div>
        </Card>

        {/* Profile */}
        <Card title="Profile">
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <Field label="FULL NAME">
              <input className="input text-sm" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </Field>
            <Field label="EMAIL">
              <input className="input text-sm opacity-50 cursor-not-allowed" value={user.email} disabled />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="COMPANY">
                <input className="input text-sm" placeholder="Acme Inc." value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
              </Field>
              <Field label="YOUR ROLE">
                <input className="input text-sm" placeholder="CEO, VP Sales…" value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
              </Field>
            </div>
            <button type="submit" disabled={saving} className="btn-primary self-start text-xs py-2 px-5">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </Card>

        {/* Password */}
        <Card title="Change Password">
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <Field label="CURRENT PASSWORD">
              <input className="input text-sm" type="password" placeholder="••••••••" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required />
            </Field>
            <Field label="NEW PASSWORD">
              <input className="input text-sm" type="password" placeholder="Min. 8 characters" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} required />
            </Field>
            <Field label="CONFIRM PASSWORD">
              <input className="input text-sm" type="password" placeholder="Repeat new password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
            </Field>
            <button type="submit" disabled={pwSaving} className="btn-primary self-start text-xs py-2 px-5">
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </Card>

        {/* Export */}
        <Card title="Export Data">
          <p className="font-mono text-xs text-white/35 mb-4 leading-relaxed">
            Download all your journal entries as JSON. Your data belongs to you.
          </p>
          <button onClick={handleExport} disabled={exporting} className="btn-secondary text-xs py-2">
            {exporting ? 'Exporting...' : '↓ Export All Entries'}
          </button>
        </Card>

        {/* Danger */}
        <Card title="Danger Zone" danger>
          <p className="font-mono text-xs text-white/35 mb-4 leading-relaxed">
            Account deletion is permanent. All your journal entries will be gone forever.
          </p>
          <button
            className="font-mono text-xs text-red-400 border border-red-500/25 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            onClick={() => toast.error('To delete your account, email support@bizjournal.app')}
          >
            Delete Account
          </button>
        </Card>
      </main>
    </div>
  );
}

function Card({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 ${danger ? 'border-red-500/15 bg-red-500/5' : 'border-white/[0.07] bg-surface'}`}>
      <p className={`font-mono text-[9px] tracking-widest mb-5 ${danger ? 'text-red-400' : 'text-brand/70'}`}>{title.toUpperCase()}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[9px] text-white/35 tracking-widest block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
