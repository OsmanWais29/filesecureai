
import { FileText, MessageCircle, Shield, Lightbulb, Ticket, Award, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

const categories = [
  { id: "all", label: "All Categories", icon: FileText },
  { id: "general", label: "General Support", icon: FileText },
  { id: "ai", label: "AI Issues", icon: MessageCircle },
  { id: "legal", label: "Legal Assistance", icon: Shield },
  { id: "feature", label: "Feature Requests", icon: Lightbulb },
];

interface SupportCategorySidebarProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const SupportCategorySidebar = ({ 
  selectedCategory, 
  setSelectedCategory 
}: SupportCategorySidebarProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className={`w-56 border-r h-full ${isDarkMode ? 'bg-background' : 'bg-white'} hidden sm:block flex-shrink-0`}>
      <ScrollArea className="h-full">
        <div className="p-3 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold mb-1 px-1">Categories</h2>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 py-2 h-auto",
                  selectedCategory === category.id && "bg-accent/10 text-accent"
                )}
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-4 w-4" />
                <span className="text-sm">{category.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-sm font-semibold mb-1 px-1">My Tickets</h2>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 py-2 h-auto"
              onClick={() => window.location.href = "/support/tickets"}
            >
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Open Tickets</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 py-2 h-auto"
              onClick={() => window.location.href = "/support/tickets?status=resolved"}
            >
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Resolved Tickets</span>
            </Button>
          </div>
          
          <div className="pt-2 border-t">
            <h2 className="text-sm font-semibold mb-1 px-1">Leaderboard</h2>
            <Card className="p-2">
              <h3 className="text-xs font-medium mb-1">Top Contributors</h3>
              <div className="space-y-2">
                {[
                  { name: "John Doe", points: 350 },
                  { name: "Jane Smith", points: 280 },
                  { name: "Robert Johnson", points: 220 },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-500" />
                      <span className="text-xs">{user.points}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-1 border-t">
                <h3 className="text-xs font-medium mb-1">AI Agent Accuracy</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Overall Score</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-green-500">95.8%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
