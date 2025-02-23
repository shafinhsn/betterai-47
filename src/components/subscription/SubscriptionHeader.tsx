
import { STUDENT_TRIAL_DAYS } from '@/constants/subscription';

export const SubscriptionHeader = () => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
      <p className="text-muted-foreground">
        Start with a {STUDENT_TRIAL_DAYS}-day free trial. No credit card required.
      </p>
    </div>
  );
};
