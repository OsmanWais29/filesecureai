
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { SupportHeader } from "./SupportHeader";
import { SupportSidebar } from "./SupportSidebar";

interface ForumLayoutProps {
  children: ReactNode;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowChatbot: (show: boolean) => void;
}

export const ForumLayout = ({ 
  children, 
  searchQuery, 
  setSearchQuery,
  setShowChatbot 
}: ForumLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      <SupportHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        setShowChatbot={setShowChatbot}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-4 p-4 md:p-6 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 max-w-3xl overflow-auto">
            <Card className="shadow-sm h-full">
              {children}
            </Card>
          </div>
          
          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 overflow-auto">
            <SupportSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};
