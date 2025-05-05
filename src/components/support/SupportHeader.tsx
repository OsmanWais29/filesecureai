
import { Search, Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

interface SupportHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowChatbot: (show: boolean) => void;
}

export const SupportHeader = ({ searchQuery, setSearchQuery, setShowChatbot }: SupportHeaderProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();

  return (
    <div className={`border-b sticky top-0 z-10 ${isDarkMode ? 'bg-background' : 'bg-white'}`}>
      <div className="py-3 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold hidden md:block">Support Center</h1>
          
          <div className="flex items-center gap-2 flex-1 max-w-3xl mx-auto md:mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for support topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/support/new")} variant="outline" size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Ask a Question
            </Button>
            <Button onClick={() => setShowChatbot(true)} size="sm">
              <Bot className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
