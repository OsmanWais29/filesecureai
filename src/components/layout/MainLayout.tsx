
import { ReactNode, useEffect, useState } from "react";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { MainHeader } from "@/components/header/MainHeader";
import { Footer } from "@/components/layout/Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const MainLayout = ({ children, showFooter = true }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarCollapse = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    // Listen for sidebar collapse events
    window.addEventListener('sidebarCollapse', handleSidebarCollapse as EventListener);
    
    // Listen for document sidebar collapse events as well (from DocumentManagement)
    window.addEventListener('documentSidebarCollapse', handleSidebarCollapse as EventListener);
    
    return () => {
      window.removeEventListener('sidebarCollapse', handleSidebarCollapse as EventListener);
      window.removeEventListener('documentSidebarCollapse', handleSidebarCollapse as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen h-screen w-full flex overflow-hidden bg-gray-50 dark:bg-background">
      <MainSidebar />
      <div 
        className={cn(
          "flex-1 flex flex-col w-full overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <MainHeader />
        <main className="flex-1 overflow-auto p-2 sm:p-4 md:p-6 bg-gray-50 dark:bg-background w-full">
          <div className="container mx-auto max-w-full pb-16 sm:pb-20">
            {children}
          </div>
        </main>
        {showFooter && <Footer compact className="bg-white dark:bg-background" />}
      </div>
    </div>
  );
};
