
import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success("Subscription successful!");
  }, []);

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-background border rounded-lg shadow-sm p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Subscription Confirmed!</h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for your subscription. Your account has been successfully upgraded.
          </p>
          
          <div className="space-y-4">
            <Link to="/documents">
              <Button className="w-full">Go to Documents</Button>
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
