
import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Student Plan',
    price: 5,
    messages: Infinity,
    features: [
      'Unlimited messages',
      '1 week free trial',
      'Ideal for academic use',
      'Email support'
    ]
  },
  {
    name: 'Professional',
    price: 10,
    messages: 1000, // Monthly message limit to control API costs
    features: [
      '1,000 messages per month',
      'Priority support',
      'Advanced document analysis',
      'Business usage allowed'
    ]
  }
];

// Free tier limits
export const FREE_TIER_LIMIT = 20; // Reduced to control API costs

// API usage limits (messages per day) to prevent abuse
export const DAILY_MESSAGE_LIMIT = {
  student: 100,    // Student plan daily limit
  professional: 50  // Professional plan daily limit
};

// Trial period in days for student accounts
export const STUDENT_TRIAL_DAYS = 7;
