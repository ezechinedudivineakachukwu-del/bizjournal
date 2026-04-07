import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  plan: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, plan },
    success_url: `${baseUrl}/dashboard?upgrade=success`,
    cancel_url: `${baseUrl}/pricing?upgrade=cancelled`,
    subscription_data: { metadata: { userId, plan } },
  });
}

export async function createPortalSession(customerId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/settings`,
  });
}
