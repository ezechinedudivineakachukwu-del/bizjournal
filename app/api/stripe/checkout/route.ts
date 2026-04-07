import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req) as any;
  if (!user) return Response.json({ error: 'Unauthorized.' }, { status: 401 });

  const { plan } = await req.json();
  if (plan !== 'pro' && plan !== 'enterprise')
    return Response.json({ error: 'Invalid plan.' }, { status: 400 });

  const priceId = PLANS[plan].stripePriceId;
  if (!priceId) return Response.json({ error: 'Stripe price ID not configured.' }, { status: 500 });

  const session = await createCheckoutSession(String(user._id), user.email, priceId, plan);
  return Response.json({ url: session.url });
}
