
// Trial period in days
export const STUDENT_TRIAL_DAYS = 14;

// Initial free messages for new users
export const INITIAL_FREE_MESSAGES = 100;

// Daily free messages after using initial messages
export const DAILY_FREE_MESSAGES = 50;

// Daily message limits for subscribed users
export const DAILY_SUBSCRIPTION_LIMIT = 500;

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
      `${DAILY_SUBSCRIPTION_LIMIT} messages per day`
    ]
  }
];

