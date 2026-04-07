import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createPortalSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!user.stripeCustomerId)
    return Response.json({ error: 'No billing account found.' }, { status: 400 });

  const session = await createPortalSession(user.stripeCustomerId);
  return Response.json({ url: session.url });
}
