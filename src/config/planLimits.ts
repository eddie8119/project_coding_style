export const SUBSCRIPTION_PLAN_LIMITS = {
  free: { maxProjects: 3, maxMembers: 2 },
  pro: { maxProjects: 10, maxMembers: 20 },
  enterprise: { maxProjects: Infinity, maxMembers: Infinity },
} as const;
