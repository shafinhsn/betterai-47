
import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: 10,
    messages: 1000,
    features: ['1,000 messages per month', 'Basic support', 'Standard response time']
  },
  {
    name: 'Premium',
    price: 25,
    messages: 5000,
    features: ['5,000 messages per month', 'Priority support', 'Faster response time', 'Advanced document analysis']
  },
  {
    name: 'Enterprise',
    price: 100,
    messages: 25000,
    features: ['25,000 messages per month', '24/7 Support', 'Fastest response time', 'Custom features']
  }
];

export const FREE_TIER_LIMIT = 100;
