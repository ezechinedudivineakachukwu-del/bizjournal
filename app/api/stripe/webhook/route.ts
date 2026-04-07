import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const { userId, plan } = session.metadata || {};
      if (userId && plan) {
        await User.findByIdAndUpdate(userId, {
          plan,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
      }
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as any;
      const userId = sub.metadata?.userId;
      if (userId) {
        const plan = sub.metadata?.plan || 'free';
        const isActive = ['active', 'trialing'].includes(sub.status);
        await User.findByIdAndUpdate(userId, { plan: isActive ? plan : 'free' });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      const userId = sub.metadata?.userId;
      if (userId) await User.findByIdAndUpdate(userId, { plan: 'free', stripeSubscriptionId: null });
      break;
    }
  }

  return Response.json({ received: true });
}
