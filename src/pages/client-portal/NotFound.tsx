
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist in the client portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/portal">
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/portal/support">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
