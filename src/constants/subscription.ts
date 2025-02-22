
import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Student Plan',
    price: 5,
    messages: Infinity,
    features: [
      'Unlimited messages',
      '7 day free trial',
      'Ideal for academic use',
      'Email support',
      '100 messages per day limit'
    ]
  },
  {
    name: 'Professional',
    price: 10,
    messages: 1000,
    features: [
      '1,000 messages per month',
      'Priority support',
      'Advanced document analysis',
      'Business usage allowed',
      '50 messages per day limit'
    ]
  }
];

// Free tier limits
export const FREE_TIER_LIMIT = 20;

// API usage limits (messages per day) to prevent abuse
export const DAILY_MESSAGE_LIMIT = {
  student: 100,
  professional: 50,
  free: 20
};

// Trial period in days for student accounts
export const STUDENT_TRIAL_DAYS = 7;
