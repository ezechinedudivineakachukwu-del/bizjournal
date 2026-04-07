import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink-2 to-ink text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-gradient-to-b from-ink/80 to-ink/0 backdrop-blur-xl border-b border-brand/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-brand via-gold to-accent bg-clip-text text-transparent">BizJournal</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="px-5 py-2 rounded-lg bg-gradient-to-r from-brand to-accent text-white font-semibold text-sm hover:shadow-lg hover:shadow-brand/50 transition-all">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/30 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-xs text-brand">The AI Journal for Business Leaders</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-black leading-[1.1] mb-6 bg-gradient-to-r from-white via-brand to-gold bg-clip-text text-transparent">
            Transform Your Thoughts Into Action
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-white/70 mb-8 max-w-2xl leading-relaxed">
            Your AI-powered business journal that turns daily insights into strategic decisions. Write freely. Get actionable advice. Close more deals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/register" className="px-8 py-4 rounded-lg bg-gradient-to-r from-brand to-accent text-white font-bold text-base hover:shadow-2xl hover:shadow-brand/50 transition-all hover:scale-105">
              Start For Free
            </Link>
            <Link href="/pricing" className="px-8 py-4 rounded-lg border border-white/20 text-white font-bold text-base hover:bg-white/5 transition-all">
              View Pricing →
            </Link>
          </div>

          {/* Subtext */}
          <p className="text-sm text-white/50 font-mono">
            ✓ No credit card required  ✓ 10 free entries  ✓ 20 AI messages/month
          </p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="section-label mb-3">POWERFUL FEATURES</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Everything Built In</h2>
            <p className="text-lg text-white/60 max-w-2xl">Simple, focused tools designed specifically for business leaders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-surface/50 to-surface/20 border border-brand/20 hover:border-brand/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand to-cyan-500 flex items-center justify-center text-white text-xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">AI Advisor</h3>
              <p className="text-white/60 text-sm leading-relaxed">Get personalized business advice based on your journal entries. Your AI understands context and gives real insights.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20 hover:border-gold/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center text-white text-xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Deal Tracker</h3>
              <p className="text-white/60 text-sm leading-relaxed">Log deals with values, stages, and context. Monitor your sales pipeline health in real-time.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Weekly Insights</h3>
              <p className="text-white/60 text-sm leading-relaxed">AI-generated weekly reviews surface patterns in your decisions and help you improve over time.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-surface/50 to-surface/20 border border-white/10 hover:border-coral/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-coral to-pink-500 flex items-center justify-center text-white text-xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Templates</h3>
              <p className="text-white/60 text-sm leading-relaxed">Pre-built templates for daily reviews, strategy sessions, deal logs, and meeting notes.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-surface/50 to-surface/20 border border-white/10 hover:border-white/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white text-xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Privacy First</h3>
              <p className="text-white/60 text-sm leading-relaxed">Your data is encrypted. We never train AI on user journals. Your thoughts stay yours.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-xl bg-gradient-to-br from-surface/50 to-surface/20 border border-white/10 hover:border-white/30 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white text-xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-white/60 text-sm leading-relaxed">Clean, distraction-free editor that gets out of your way so you can think clearly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to transform your business?</h2>
          <p className="text-lg text-white/60 mb-10">Join founders and executives who journal with purpose.</p>
          <Link href="/register" className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-brand to-accent text-white font-bold text-base hover:shadow-2xl hover:shadow-brand/50 transition-all hover:scale-105">
            Start Your Free Journal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="font-mono text-xs text-white/30">© 2026 BizJournal. Transform thoughts into action.</p>
      </footer>
    </div>
  );
}
