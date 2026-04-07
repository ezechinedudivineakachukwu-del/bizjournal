import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { canDoAction, PLANS } from '@/lib/plans';
import Entry from '@/models/Entry';
import User from '@/models/User';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function retrieveContext(userId: string, query: string) {
  const words = query.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  let entries: any[] = [];

  if (words.length > 0) {
    entries = await Entry.find({ userId, $text: { $search: words.join(' ') } })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(4).select('title content tags template mood dealValue dealStatus actionItems createdAt');
  }

  if (entries.length < 4) {
    const recent = await Entry.find({ userId, _id: { $nin: entries.map(e => e._id) } })
      .sort({ createdAt: -1 }).limit(4 - entries.length)
      .select('title content tags template mood dealValue dealStatus actionItems createdAt');
    entries = [...entries, ...recent];
  }
  return entries;
}

function formatContext(entries: any[], userName: string) {
  if (!entries.length) return 'No journal entries found yet for this user.';
  return entries.map(e => {
    const date = new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const deal = e.dealValue ? ` | Deal: $${e.dealValue.toLocaleString()} (${e.dealStatus})` : '';
    const actions = e.actionItems?.length ? `\nAction items: ${e.actionItems.join(', ')}` : '';
    return `--- [${e.template.toUpperCase()}] "${e.title}" | ${date} | Mood: ${e.mood || 'not set'}${deal} ---\n${e.content}${actions}`;
  }).join('\n\n');
}

export async function POST(req: NextRequest) {
  const dbUser = await getAuthUser(req) as any;
  if (!dbUser) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();

  const fullUser = await User.findById(dbUser._id);
  if (!fullUser) return Response.json({ error: 'User not found.' }, { status: 404 });

  const check = canDoAction(fullUser.plan, 'aiMessages', fullUser.usage.aiMessagesThisMonth);
  if (!check.allowed) {
    return Response.json({
      error: check.reason,
      upgradeRequired: true,
      currentPlan: fullUser.plan,
      limit: PLANS[fullUser.plan].limits.aiMessages,
    }, { status: 403 });
  }

  const { message, history = [] } = await req.json();
  if (!message?.trim()) return Response.json({ error: 'Message is required.' }, { status: 400 });

  const entries = await retrieveContext(String(fullUser._id), message);
  const journalContext = formatContext(entries, fullUser.name);
  const planName = PLANS[fullUser.plan].name;

  const systemPrompt = `You are BizJournal AI — a sharp, focused business advisor and journaling assistant for ${fullUser.name}${fullUser.company ? ` at ${fullUser.company}` : ''}${fullUser.role ? `, ${fullUser.role}` : ''}.

You have access to their recent journal entries below. Use them to give personalized, actionable business insights.

Your capabilities:
- Analyze business decisions and suggest next steps
- Extract and track action items from journal entries
- Spot patterns in deals, moods, and performance
- Provide weekly/monthly business reviews
- Help with deal strategy, negotiation prep, meeting planning
- Identify risks and opportunities based on past entries
- Give brutally honest, no-fluff business advice

Tone: Direct, confident, data-driven. You are a trusted business advisor, not a chatbot.
Plan: User is on ${planName} plan.
${fullUser.plan === 'free' ? 'Note: Gently remind user about Pro features when relevant, but never be pushy.' : ''}

--- JOURNAL CONTEXT (most relevant entries) ---
${journalContext}
--- END CONTEXT ---

Rules:
- Reference specific entries by title/date when relevant
- If information isn't in journal, say so — never fabricate
- For business questions without journal context, answer from general expertise
- Keep responses concise and structured with bullet points where useful
- Always end with 1 clear next action if applicable`;

  const messages = [
    ...history.slice(-10),
    { role: 'user' as const, content: message },
  ];

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const reply = response.content[0]?.type === 'text' ? response.content[0].text : 'Unable to generate response.';

  await User.findByIdAndUpdate(fullUser._id, { $inc: { 'usage.aiMessagesThisMonth': 1 } });

  const remaining = PLANS[fullUser.plan].limits.aiMessages === Infinity
    ? null
    : PLANS[fullUser.plan].limits.aiMessages - fullUser.usage.aiMessagesThisMonth - 1;

  return Response.json({ reply, entriesUsed: entries.length, remaining });
}
