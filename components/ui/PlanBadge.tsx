import type { Plan } from '@/lib/plans';

const labels: Record<Plan, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' };
const classes: Record<Plan, string> = {
  free: 'plan-badge-free',
  pro: 'plan-badge-pro',
  enterprise: 'plan-badge-enterprise',
};

export default function PlanBadge({ plan }: { plan: Plan }) {
  return <span className={classes[plan]}>{labels[plan]}</span>;
}
