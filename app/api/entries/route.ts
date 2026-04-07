import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { canDoAction } from '@/lib/plans';
import Entry from '@/models/Entry';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const template = searchParams.get('template') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;

  const query: any = { userId: user._id };
  if (tag) query.tags = tag;
  if (template) query.template = template;
  if (search) query.$text = { $search: search };

  const [entries, total] = await Promise.all([
    Entry.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-keywords'),
    Entry.countDocuments(query),
  ]);

  return Response.json({ entries, pagination: { total, page, pages: Math.ceil(total / limit) } });
}

export async function POST(req: NextRequest) {
  const dbUser = await getAuthUser(req) as any;
  if (!dbUser) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();

  const fullUser = await User.findById(dbUser._id);
  if (!fullUser) return Response.json({ error: 'User not found.' }, { status: 404 });

  const check = canDoAction(fullUser.plan, 'entries', fullUser.usage.entriesThisMonth);
  if (!check.allowed) return Response.json({ error: check.reason, upgradeRequired: true }, { status: 403 });

  const { title, content, template, tags, mood, dealValue, dealStatus, actionItems } = await req.json();
  if (!title || !content) return Response.json({ error: 'Title and content are required.' }, { status: 400 });

  const entry = await Entry.create({ userId: fullUser._id, title, content, template: template || 'free-write', tags: tags || [], mood: mood || null, dealValue, dealStatus, actionItems: actionItems || [] });

  await User.findByIdAndUpdate(fullUser._id, { $inc: { 'usage.entriesThisMonth': 1 } });

  return Response.json({ entry }, { status: 201 });
}
