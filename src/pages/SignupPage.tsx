
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Full Name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full">Sign Up</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
