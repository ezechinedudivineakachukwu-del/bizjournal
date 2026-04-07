# BizJournal — AI Business Journal

> The AI-powered journal for founders, executives, and sales leaders.

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas
- **AI**: Anthropic Claude (claude-opus-4-5)
- **Payments**: Stripe (subscriptions)
- **Auth**: JWT + bcrypt
- **Hosting**: Vercel (full stack)

## Plans
| Feature | Free | Pro ($19/mo) | Enterprise ($79/mo) |
|---|---|---|---|
| Journal entries/month | 10 | Unlimited | Unlimited |
| AI messages/month | 20 | 500 | Unlimited |
| Templates | Basic | All 6 | All 6 |
| Deal tracker | ✗ | ✓ | ✓ |
| AI insights | ✗ | ✓ | ✓ |
| Team workspace | ✗ | ✗ | ✓ |

---

## Local Setup (Step by Step)

### 1. Prerequisites
Install Node.js (LTS) from https://nodejs.org

### 2. Clone & install
```bash
cd bizjournal
npm install
```

### 3. MongoDB Atlas (free)
1. Go to https://cloud.mongodb.com → create free account
2. Create Project → Create Cluster (M0 free tier)
3. Database Access → Add DB User (username + password)
4. Network Access → Add IP → Allow from anywhere (0.0.0.0/0)
5. Connect → Drivers → copy connection string
6. Replace `<username>` and `<password>` in the string

### 4. Anthropic API Key
1. Go to https://console.anthropic.com
2. API Keys → Create Key
3. Copy it (starts with `sk-ant-...`)

### 5. Stripe Setup
1. Go to https://dashboard.stripe.com → create account
2. Developers → API Keys → copy **Secret key** (sk_test_...)
3. Products → Create two products:
   - "BizJournal Pro" → $19/month recurring → copy Price ID
   - "BizJournal Enterprise" → $79/month recurring → copy Price ID
4. Webhooks → Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy Webhook Secret (whsec_...)

### 6. Configure environment
```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

### 7. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 8. Test Stripe webhooks locally
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Deploy to Vercel (Free)

### One-command deploy
```bash
npx vercel
```

### Or via dashboard
1. Push to GitHub
2. Go to https://vercel.com → New Project → Import repo
3. Framework: Next.js (auto-detected)
4. Add all environment variables from `.env.local`
5. Deploy

### After deploy: update Stripe webhook
- Add your Vercel URL as a Stripe webhook endpoint
- Update `NEXT_PUBLIC_APP_URL` env var to your Vercel URL

---

## Project Structure
```
bizjournal/
├── app/
│   ├── api/
│   │   ├── auth/{register,login,me}/route.ts
│   │   ├── entries/route.ts + [id]/route.ts + tags/route.ts
│   │   ├── ai/{chat,summarize/[id]}/route.ts
│   │   └── stripe/{checkout,webhook,portal}/route.ts
│   ├── dashboard/page.tsx
│   ├── entry/{new,[id],[id]/edit}/page.tsx
│   ├── stats/page.tsx
│   ├── settings/page.tsx
│   ├── pricing/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx
│   └── page.tsx (landing)
├── components/
│   ├── ui/{Toast,Navbar,PlanBadge,UpgradeModal}.tsx
│   ├── ai/AIChat.tsx
│   └── journal/{EntryCard,TemplateSelector}.tsx
├── hooks/useAuth.ts
├── lib/{db,auth,plans,stripe,api-client}.ts
├── models/{User,Entry}.ts
├── types/index.ts
└── .env.example
```

## API Reference
```
POST /api/auth/register     Register new user
POST /api/auth/login        Login + JWT
GET  /api/auth/me           Current user
PUT  /api/auth/me           Update profile

GET  /api/entries           List entries (search, tag, template, page)
POST /api/entries           Create entry (plan-gated)
GET  /api/entries/[id]      Single entry
PUT  /api/entries/[id]      Update entry
DEL  /api/entries/[id]      Delete entry
GET  /api/entries/tags      All user tags

POST /api/ai/chat           AI chat with journal memory (plan-gated)
POST /api/ai/summarize/[id] Summarize one entry (plan-gated)

POST /api/stripe/checkout   Create Stripe checkout session
POST /api/stripe/webhook    Stripe webhook handler
POST /api/stripe/portal     Stripe billing portal
```
