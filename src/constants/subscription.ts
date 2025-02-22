
import { SubscriptionPlan } from '@/types/chat';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Student Basic',
    price: 5,
    messages: Infinity,
    features: ['Unlimited messages', 'Basic support', 'Standard response time']
  },
  {
    name: 'Student Plus',
    price: 10,
    messages: Infinity,
    features: ['Unlimited messages', 'Priority support', 'Faster response time', 'Advanced document analysis']
  },
  {
    name: 'Student Pro',
    price: 20,
    messages: Infinity,
    features: ['Unlimited messages', 'Priority support', 'Custom chat presets', 'Advanced document analysis', 'Premium features']
  }
];

export const FREE_TIER_LIMIT = 50;
