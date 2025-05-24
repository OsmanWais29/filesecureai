
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailVerificationProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailVerification = ({ email, onBackToLogin }: EmailVerificationProps) => {
  const [resending, setResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    setResending(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setError(error.message);
      toast.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) throw error;

      toast.success('Email verified successfully!');
      onBackToLogin();
    } catch (error: any) {
      console.error('Verify code error:', error);
      setError('Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Or enter verification code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={verifying || !verificationCode.trim()}
            className="w-full"
          >
            {verifying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email?
          </p>
          <Button
            variant="outline"
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full"
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onBackToLogin}
          className="w-full"
        >
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
};
