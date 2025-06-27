
import { Button } from "@/components/ui/button";

interface AuthErrorDisplayProps {
  error: string;
}

export const AuthErrorDisplay = ({ error }: AuthErrorDisplayProps) => {
  return (
    <div className="min-h-screen h-screen w-full bg-background flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Authentication Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </div>
  );
};
