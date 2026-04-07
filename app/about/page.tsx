import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink-2 to-ink text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-[11px] font-black text-white">BJ</div>
          <span className="font-bold text-base">BizJournal</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-white/50 hover:text-white transition-colors">Pricing</Link>
          <Link href="/login" className="btn-secondary text-sm py-2">Log in</Link>
          <Link href="/register" className="btn-primary text-sm py-2">Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05] mb-6 font-display">
          About BizJournal
        </h1>
        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          The AI-powered business journal designed for founders, executives, and sales leaders who demand clarity, accountability, and intelligent insights.
        </p>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Our Mission</h3>
            <p className="text-white/70 leading-relaxed">
              BizJournal empowers business professionals to capture their thoughts, decisions, and progress with the help of AI. We believe that great businesses are built on clear thinking and consistent reflection.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">What Makes Us Different</h3>
            <p className="text-white/70 leading-relaxed">
              Unlike generic note-taking apps, BizJournal understands your business context. Our AI reads your entries and provides personalized advice, deal insights, and actionable recommendations.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Built for Professionals</h3>
            <p className="text-white/70 leading-relaxed">
              From daily reviews to deal tracking, meeting notes to decision logs, BizJournal offers purpose-built templates that capture exactly what matters to your business success.
            </p>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Privacy First</h3>
            <p className="text-white/70 leading-relaxed">
              Your journal entries are encrypted and private. We never use your data to train AI models. Your business insights remain yours alone.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Business Journaling?</h3>
          <Link href="/register" className="btn-primary px-8 py-3 text-base">Start Your Free Account</Link>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-6 text-center px-6">
        <p className="font-mono text-xs text-white/20">© 2026 BizJournal. Built for business people who think clearly.</p>
      </footer>
    </div>
  );
}