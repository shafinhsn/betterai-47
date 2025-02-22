
import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Creator Plan',
    price: 8,
    messages: Infinity,
    features: [
      'Unlimited messages',
      '14-day free trial',
      'Advanced document editing',
      'Smart content suggestions',
      'Real-time collaborative editing',
      'Email support',
      '150 messages per day'
    ]
  },
  {
    name: 'Business Pro',
    price: 15,
    messages: Infinity,
    features: [
      'Everything in Creator Plan',
      'Priority support',
      'Advanced document analysis',
      'Custom document templates',
      'Team collaboration features',
      'API access',
      '500 messages per day'
    ]
  }
];

// Free tier limits
export const FREE_TIER_LIMIT = 50;

// API usage limits (messages per day) to prevent abuse
export const DAILY_MESSAGE_LIMIT = {
  creator: 150,
  business: 500,
  free: 50
};

// Trial period in days
export const STUDENT_TRIAL_DAYS = 14;

