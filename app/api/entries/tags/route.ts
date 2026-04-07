import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Entry from '@/models/Entry';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  await connectDB();
  const tags = await Entry.distinct('tags', { userId: user._id });
  return Response.json({ tags });
}
