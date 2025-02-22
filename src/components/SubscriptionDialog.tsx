
import { SUBSCRIPTION_PLANS } from '@/constants/subscription';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import type { SubscriptionDialogProps } from '@/types/chat';

export const SubscriptionDialog = ({ open, onOpenChange, onSubscribe }: SubscriptionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            You've reached the limit of your free tier. Choose a plan to continue using our service.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div key={plan.name} className="border rounded-lg p-4 flex flex-col">
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold my-2">${plan.price}/mo</p>
              <ul className="text-sm space-y-2 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              <Button
                className="mt-4"
                onClick={() => onSubscribe(plan)}
              >
                Subscribe
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
