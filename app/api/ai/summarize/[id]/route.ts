import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { canDoAction } from '@/lib/plans';
import Entry from '@/models/Entry';
import User from '@/models/User';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const dbUser = await getAuthUser(req) as any;
  if (!dbUser) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();

  const fullUser = await User.findById(dbUser._id);
  if (!fullUser) return Response.json({ error: 'User not found.' }, { status: 404 });

  const check = canDoAction(fullUser.plan, 'aiMessages', fullUser.usage.aiMessagesThisMonth);
  if (!check.allowed) return Response.json({ error: check.reason, upgradeRequired: true }, { status: 403 });

  const entry = await Entry.findOne({ _id: params.id, userId: fullUser._id });
  if (!entry) return Response.json({ error: 'Entry not found.' }, { status: 404 });

  const templatePrompts: Record<string, string> = {
    'deal-tracker': 'Analyze this deal entry: 1) Deal status and next steps, 2) Key risks or blockers, 3) Recommended action to close or advance.',
    'meeting-notes': 'Summarize this meeting: 1) Key decisions made, 2) Action items with owners, 3) Follow-up required.',
    'weekly-review': 'Review this week: 1) Wins and achievements, 2) Open loops and blockers, 3) Top priority for next week.',
    'decision-log': 'Analyze this decision: 1) Core reasoning, 2) Key assumptions made, 3) Risks to watch.',
    'daily-review': 'Summarize this day: 1) Progress made, 2) Key insights, 3) Tomorrow\'s priority.',
    'free-write': 'Summarize: 1) Main themes, 2) Action items or commitments, 3) Key insight.',
  };

  const prompt = templatePrompts[entry.template] || templatePrompts['free-write'];

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `${prompt}\n\nEntry Title: ${entry.title}\n\n${entry.content}`,
    }],
  });

  await User.findByIdAndUpdate(fullUser._id, { $inc: { 'usage.aiMessagesThisMonth': 1 } });

  return Response.json({ summary: response.content[0]?.type === 'text' ? response.content[0].text : '' });
}
