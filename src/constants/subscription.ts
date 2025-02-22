
import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Student Plan',
    price: 8,
    messages: Infinity,
    features: [
      'Unlimited messages',
      '14-day free trial',
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
export const FREE_TIER_LIMIT = 50;

// API usage limits (messages per day) to prevent abuse
export const DAILY_MESSAGE_LIMIT = {
  creator: 150,
  free: 5
};

// Trial period in days
export const STUDENT_TRIAL_DAYS = 14;
