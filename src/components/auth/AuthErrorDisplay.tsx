
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface AuthErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const AuthErrorDisplay = ({ error, onRetry }: AuthErrorDisplayProps) => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-900">Authentication Error</CardTitle>
          <CardDescription className="text-red-700">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {onRetry && (
            <Button onClick={onRetry} className="w-full">
              Try Again
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
