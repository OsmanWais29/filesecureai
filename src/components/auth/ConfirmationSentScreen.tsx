
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';

interface ConfirmationSentScreenProps {
  email: string;
  onBackToSignIn: () => void;
}

export const ConfirmationSentScreen: React.FC<ConfirmationSentScreenProps> = ({
  email,
  onBackToSignIn
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-xl font-semibold">Check your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          We've sent a confirmation link to <strong>{email}</strong>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Click the link in the email to complete your registration
        </p>
        <Button 
          onClick={onBackToSignIn}
          variant="outline"
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sign In
        </Button>
      </CardContent>
    </Card>
  );
};
