
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const NoSubscription = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">No Active Subscription</h1>
        <p className="text-muted-foreground mb-6">
          You don't currently have an active subscription.
        </p>
        <Button onClick={() => navigate('/subscription')}>View Plans</Button>
      </div>
    </div>
  );
};
