
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
      'Plagiarism checker',
      'Smart formatting',
      'Google Docs integration',
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
      'Everything in Student Plan',
      'Industry-specific editing',
      'Legal document support',
      'Medical content refinement',
      'Corporate language optimization',
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
