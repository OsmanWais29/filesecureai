
import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  children: ReactNode;
  navigation: ReactNode;
  title: string;
  description: string;
}

export const SettingsLayout = ({ children, navigation, title, description }: SettingsLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Navigation Sidebar */}
      {!isMobile && navigation}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation */}
        {isMobile && navigation}
        
        {/* Content Header */}
        <div className="p-6 border-b bg-card">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
