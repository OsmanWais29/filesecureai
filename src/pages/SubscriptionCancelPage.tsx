
import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function SubscriptionCancelPage() {
  useEffect(() => {
    toast("Subscription cancelled", {
      description: "Your subscription process was cancelled."
    });
  }, []);

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-background border rounded-lg shadow-sm p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Subscription Cancelled</h1>
          
          <p className="text-muted-foreground mb-6">
            Your subscription process was cancelled. No charges have been made.
          </p>
          
          <div className="space-y-4">
            <Link to="/pricing">
              <Button className="w-full">View Plans</Button>
            </Link>
            
            <Link to="/">
              <Button variant="outline" className="w-full">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
