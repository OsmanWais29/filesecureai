
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlusCircle, LifeBuoy, BookOpen, Users, Award, Lightbulb } from "lucide-react";

export const SupportSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button 
        onClick={() => navigate("/support/new")} 
        className="w-full font-medium"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Post
      </Button>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">About Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 text-sm">
          <p className="text-muted-foreground">
            A community for SecureFiles AI users to get help, share ideas, and discuss features.
          </p>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>1.2k members</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span>Created Jan 2025</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Community Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="border-b pb-2">
            <p className="text-sm font-medium">1. Be respectful to others</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">2. No spam or self-promotion</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm font-medium">3. Use appropriate tags</p>
          </div>
          <div>
            <p className="text-sm font-medium">4. Search before posting</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" onClick={() => window.open('#', '_blank')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" onClick={() => window.open('#', '_blank')}>
            <Lightbulb className="mr-2 h-4 w-4" />
            Feature Requests
          </Button>
          <Button variant="ghost" className="w-full justify-start text-sm h-auto py-2" onClick={() => window.open('#', '_blank')}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
