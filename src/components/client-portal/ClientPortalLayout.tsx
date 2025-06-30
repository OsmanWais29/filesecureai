
import { ReactNode, useState, useEffect } from "react";
import { ClientHeader } from "./ClientHeader";
import { ClientSidebar } from "./ClientSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface ClientPortalLayoutProps {
  children: ReactNode;
  onSignOut?: () => Promise<void>;
}

export const ClientPortalLayout = ({ children, onSignOut }: ClientPortalLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar collapse events from ClientSidebar
  useEffect(() => {
    const handleSidebarCollapse = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener('clientSidebarCollapse', handleSidebarCollapse as EventListener);
    
    return () => {
      window.removeEventListener('clientSidebarCollapse', handleSidebarCollapse as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      <ClientHeader onSignOut={onSignOut} />
      
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className={cn(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            sidebarCollapsed ? "w-20" : "w-72"
          )}>
            <ClientSidebar />
          </div>
        )}

        {/* Mobile Sidebar */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-72 bg-white">
              <ClientSidebar />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Main content */}
        <div className="flex-1 overflow-auto bg-white rounded-tl-3xl shadow-lg border-l border-t border-blue-100">
          <div className="p-6 h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
