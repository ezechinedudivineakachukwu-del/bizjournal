export type Plan = 'free' | 'pro' | 'enterprise';

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceLabel: '$0/mo',
    entriesPerMonth: 10,
    aiMessagesPerMonth: 20,
    features: [
      '10 journal entries/month',
      '20 AI messages/month',
      'Basic templates',
      'Export to TXT',
    ],
    limits: { entries: 10, aiMessages: 20 },
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceLabel: '$19/mo',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    entriesPerMonth: Infinity,
    aiMessagesPerMonth: 500,
    features: [
      'Unlimited journal entries',
      '500 AI messages/month',
      'All business templates',
      'AI deal tracker & insights',
      'Weekly AI review reports',
      'Export to PDF & JSON',
      'Priority support',
    ],
    limits: { entries: Infinity, aiMessages: 500 },
  },
  enterprise: {
    name: 'Enterprise',
    price: 79,
    priceLabel: '$79/mo',
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    entriesPerMonth: Infinity,
    aiMessagesPerMonth: Infinity,
    features: [
      'Everything in Pro',
      'Unlimited AI messages',
      'Team workspace (up to 10)',
      'Custom AI persona',
      'Admin analytics dashboard',
      'SSO / SAML auth',
      'Dedicated support',
      'SLA guarantee',
    ],
    limits: { entries: Infinity, aiMessages: Infinity },
  },
} as const;

export function canDoAction(
  plan: Plan,
  action: 'entries' | 'aiMessages',
  currentCount: number
): { allowed: boolean; reason?: string } {
  const limit = PLANS[plan].limits[action];
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached your ${plan === 'free' ? 'free plan' : plan} limit. Upgrade to continue.`,
    };
  }
  return { allowed: true };
}
