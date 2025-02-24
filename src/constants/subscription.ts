
// Trial period in days
export const STUDENT_TRIAL_DAYS = 14;

import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Student Plan',
    price: 8,
    messages: Infinity,
    features: [
      'Unlimited messages',
      `${STUDENT_TRIAL_DAYS}-day free trial`,
      'Advanced document editing',
      'Citation generation',
      'Academic formatting (APA, MLA)',
      'Essay structure improvements',
      'Smart formatting',
      'Email support',
      '150 messages per day'
    ]
  }
];

// Free tier limits
export const FREE_TIER_LIMIT = 100;

// API usage limits (messages per day) to prevent abuse
export const DAILY_MESSAGE_LIMIT = {
  creator: 150,
  free: 5
};

